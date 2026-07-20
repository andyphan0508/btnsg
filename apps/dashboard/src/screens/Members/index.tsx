import { useEffect, useMemo, useState } from 'react';
import type { Member } from '@btnsg/shared';
import { memberApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import MemberFilters from './components/MemberFilters';
import MemberFormModal, { type MemberFormValues } from './components/MemberFormModal';
import MemberTable from './components/MemberTable';

const parseDutyList = (raw: string): string[] => {
  return raw
    .split(',')
    .map((duty) => duty.trim())
    .filter((duty) => duty !== '');
};

const buildMemberPayload = (values: MemberFormValues): Partial<Member> => {
  return {
    name: values.name,
    role: values.role,
    boardRole: values.boardRole || undefined,
    duties: parseDutyList(values.duties),
    group: values.group || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    birthday: values.birthday || undefined,
    joinedAt: values.joinedAt || undefined,
    status: values.status,
    notes: values.notes || undefined,
  };
};

const MembersScreen = () => {
  // 1. State declarations
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);
  const [memberListError, setMemberListError] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSavingMember, setIsSavingMember] = useState<boolean>(false);
  const [saveMemberError, setSaveMemberError] = useState<string | null>(null);

  // 2. Logic functions
  const validateMemberForm = (values: MemberFormValues): boolean => {
    if (!values.name.trim()) return false;
    return true;
  };

  const filteredMembers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return memberList.filter((member) => {
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;
      if (statusFilter !== 'all' && member.status !== statusFilter) return false;
      if (!keyword) return true;
      const haystack = `${member.name} ${member.phone ?? ''} ${member.email ?? ''}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [memberList, searchKeyword, roleFilter, statusFilter]);

  // 3. API call functions
  const fetchMemberList = async (): Promise<boolean> => {
    try {
      setIsLoadingMembers(true);
      const data = await memberApi.getList();
      setMemberList(data);
      return true;
    } catch (error) {
      setMemberListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const submitMemberForm = async (values: MemberFormValues): Promise<boolean> => {
    if (!validateMemberForm(values)) {
      setSaveMemberError('Vui lòng nhập họ tên thành viên.');
      return false;
    }

    try {
      setIsSavingMember(true);
      setSaveMemberError(null);
      const payload = buildMemberPayload(values);
      if (editingMember) {
        await memberApi.update(editingMember.id, payload);
      } else {
        await memberApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchMemberList();
      return true;
    } catch (error) {
      setSaveMemberError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingMember(false);
    }
  };

  const deleteMember = async (member: Member): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá thành viên "${member.name}"?`);
    if (!confirmed) return false;

    try {
      await memberApi.remove(member.id);
      await fetchMemberList();
      return true;
    } catch (error) {
      setMemberListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchMemberList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingMember(null);
    setSaveMemberError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setSaveMemberError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Nhân sự</span>
          <h2>Thành viên &amp; Ban Điều Hành</h2>
          <p className="page-sub">{memberList.length} thành viên trong danh sách.</p>
        </div>
      </div>

      <MemberFilters
        searchKeyword={searchKeyword}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchKeyword}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onAddClick={handleOpenCreate}
      />

      {memberListError && <div className="form-error" style={{ marginBottom: 14 }}>{memberListError}</div>}
      {isLoadingMembers && memberList.length === 0 ? (
        <LoadingState />
      ) : (
        <MemberTable members={filteredMembers} onEdit={handleOpenEdit} onDelete={deleteMember} />
      )}

      <MemberFormModal
        isOpen={isFormOpen}
        editingMember={editingMember}
        isSaving={isSavingMember}
        saveError={saveMemberError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitMemberForm}
      />
    </div>
  );
};

export default MembersScreen;
