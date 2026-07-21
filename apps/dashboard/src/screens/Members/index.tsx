import { useEffect, useMemo, useState } from 'react';
import {
  computeAge,
  computeMembershipYears,
  computeStage,
  type Member,
  type MemberChange,
} from '@btnsg/shared';
import { memberApi, memberChangeApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import { exportMembersExcel, type ParsedMemberRow } from '../../utils/excel';
import ImportExcelModal from './components/ImportExcelModal';
import MemberFilters, { type MemberSortKey } from './components/MemberFilters';
import MemberFormModal, { type MemberFormValues } from './components/MemberFormModal';
import MemberHistoryPanel from './components/MemberHistoryPanel';
import MemberTable from './components/MemberTable';
import TransitionAlertsPanel from './components/TransitionAlertsPanel';

const parseDutyList = (raw: string): string[] => {
  return raw
    .split(',')
    .map((duty) => duty.trim())
    .filter((duty) => duty !== '');
};

const buildMemberPayload = (values: MemberFormValues): Partial<Member> => {
  return {
    name: values.name,
    gender: values.gender || undefined,
    role: values.role,
    boardRole: values.boardRole || undefined,
    duties: parseDutyList(values.duties),
    group: values.group || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    birthday: values.birthday || undefined,
    joinedAt: values.joinedAt || undefined,
    status: values.status,
    stage: values.stage || undefined,
    notes: values.notes || undefined,
  };
};

const MembersScreen = () => {
  // 1. State declarations
  // Admin và BĐH đều được chỉnh danh sách (phân quyền chi tiết hơn nằm ở RLS phía Supabase).
  const canEdit = true;

  const [memberList, setMemberList] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);
  const [memberListError, setMemberListError] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<MemberSortKey>('name');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSavingMember, setIsSavingMember] = useState<boolean>(false);
  const [saveMemberError, setSaveMemberError] = useState<string | null>(null);

  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<MemberChange[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // 2. Logic functions
  const validateMemberForm = (values: MemberFormValues): boolean => {
    if (!values.name.trim()) return false;
    return true;
  };

  const groupOptions = useMemo(() => {
    const groups = new Set<string>();
    memberList.forEach((member) => {
      if (member.group) groups.add(member.group);
    });
    return [...groups].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  }, [memberList]);

  const filteredMembers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const filtered = memberList.filter((member) => {
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;
      if (statusFilter !== 'all' && member.status !== statusFilter) return false;
      if (groupFilter === 'none') {
        if (member.group) return false;
      } else if (groupFilter !== 'all' && member.group !== groupFilter) {
        return false;
      }
      if (stageFilter !== 'all' && computeStage(member) !== stageFilter) return false;
      if (!keyword) return true;
      const haystack = `${member.name} ${member.phone ?? ''} ${member.email ?? ''}`.toLowerCase();
      return haystack.includes(keyword);
    });

    const byName = (a: Member, b: Member) => a.name.localeCompare(b.name, 'vi');
    const sorters: Record<MemberSortKey, (a: Member, b: Member) => number> = {
      name: byName,
      group: (a, b) =>
        (a.group ?? '￿').localeCompare(b.group ?? '￿', 'vi', { numeric: true }) || byName(a, b),
      age: (a, b) => (computeAge(b.birthday) ?? -1) - (computeAge(a.birthday) ?? -1) || byName(a, b),
      membershipYears: (a, b) =>
        (computeMembershipYears(b.joinedAt) ?? -1) - (computeMembershipYears(a.joinedAt) ?? -1) || byName(a, b),
      joinedAt: (a, b) => (b.joinedAt ?? '').localeCompare(a.joinedAt ?? '') || byName(a, b),
    };
    return [...filtered].sort(sorters[sortKey]);
  }, [memberList, searchKeyword, roleFilter, statusFilter, groupFilter, stageFilter, sortKey]);

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

  const fetchHistory = async (): Promise<void> => {
    try {
      setIsLoadingHistory(true);
      setHistoryList(await memberChangeApi.getList());
    } catch {
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
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
      if (historyOpen) await fetchHistory();
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
      if (historyOpen) await fetchHistory();
      return true;
    } catch (error) {
      setMemberListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const importMembers = async (rows: ParsedMemberRow[]): Promise<boolean> => {
    try {
      setIsImporting(true);
      setImportError(null);
      await memberApi.bulkCreate(rows);
      setIsImportOpen(false);
      await fetchMemberList();
      if (historyOpen) await fetchHistory();
      return true;
    } catch (error) {
      setImportError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchMemberList();
  }, []);

  useEffect(() => {
    if (historyOpen) fetchHistory();
  }, [historyOpen]);

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

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportMembersExcel(filteredMembers, `thanh-vien-btnsg-${today}.xlsx`);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Nhân sự</span>
          <h2>Thành viên &amp; Ban Điều Hành</h2>
          <p className="page-sub">
            {memberList.length} thành viên trong danh sách · đang hiển thị {filteredMembers.length}.
          </p>
        </div>
      </div>

      <TransitionAlertsPanel members={memberList} />

      <MemberFilters
        searchKeyword={searchKeyword}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        groupFilter={groupFilter}
        stageFilter={stageFilter}
        sortKey={sortKey}
        groupOptions={groupOptions}
        historyOpen={historyOpen}
        canEdit={canEdit}
        onSearchChange={setSearchKeyword}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onGroupChange={setGroupFilter}
        onStageChange={setStageFilter}
        onSortChange={setSortKey}
        onToggleHistory={() => setHistoryOpen((open) => !open)}
        onImportClick={() => {
          setImportError(null);
          setIsImportOpen(true);
        }}
        onExportClick={handleExport}
        onAddClick={handleOpenCreate}
      />

      {historyOpen && <MemberHistoryPanel changes={historyList} isLoading={isLoadingHistory} />}

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

      <ImportExcelModal
        isOpen={isImportOpen}
        isImporting={isImporting}
        importError={importError}
        onClose={() => setIsImportOpen(false)}
        onImport={importMembers}
      />
    </div>
  );
};

export default MembersScreen;
