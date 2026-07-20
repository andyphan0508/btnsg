import { useEffect, useMemo, useState } from 'react';
import type { Announcement } from '@btnsg/shared';
import { announcementApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import AnnouncementFormModal, { type AnnouncementFormValues } from './components/AnnouncementFormModal';
import AnnouncementList from './components/AnnouncementList';

const AnnouncementsScreen = () => {
  // 1. State declarations
  const [announcementList, setAnnouncementList] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState<boolean>(false);
  const [announcementListError, setAnnouncementListError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState<boolean>(false);
  const [saveAnnouncementError, setSaveAnnouncementError] = useState<string | null>(null);

  // 2. Logic functions
  const validateAnnouncementForm = (values: AnnouncementFormValues): boolean => {
    if (!values.title.trim()) return false;
    if (!values.content.trim()) return false;
    return true;
  };

  const sortedAnnouncements = useMemo(() => {
    return [...announcementList].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [announcementList]);

  // 3. API call functions
  const fetchAnnouncementList = async (): Promise<boolean> => {
    try {
      setIsLoadingAnnouncements(true);
      const data = await announcementApi.getList();
      setAnnouncementList(data);
      return true;
    } catch (error) {
      setAnnouncementListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const submitAnnouncementForm = async (values: AnnouncementFormValues): Promise<boolean> => {
    if (!validateAnnouncementForm(values)) {
      setSaveAnnouncementError('Vui lòng nhập tiêu đề và nội dung.');
      return false;
    }

    try {
      setIsSavingAnnouncement(true);
      setSaveAnnouncementError(null);
      const payload = {
        title: values.title,
        content: values.content,
        author: values.author || undefined,
        pinned: values.pinned,
      };
      if (editingAnnouncement) {
        await announcementApi.update(editingAnnouncement.id, payload);
      } else {
        await announcementApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchAnnouncementList();
      return true;
    } catch (error) {
      setSaveAnnouncementError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const togglePin = async (item: Announcement): Promise<boolean> => {
    try {
      await announcementApi.update(item.id, { pinned: !item.pinned });
      await fetchAnnouncementList();
      return true;
    } catch (error) {
      setAnnouncementListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const deleteAnnouncement = async (item: Announcement): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá thông báo "${item.title}"?`);
    if (!confirmed) return false;

    try {
      await announcementApi.remove(item.id);
      await fetchAnnouncementList();
      return true;
    } catch (error) {
      setAnnouncementListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchAnnouncementList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setSaveAnnouncementError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingAnnouncement(item);
    setSaveAnnouncementError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Truyền thông</span>
          <h2>Thông báo</h2>
          <p className="page-sub">Nhắc lịch nhóm, sự kiện và các thông tin quan trọng — tránh miss thông tin.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Tạo thông báo
        </button>
      </div>

      {announcementListError && <div className="form-error" style={{ marginBottom: 14 }}>{announcementListError}</div>}
      {isLoadingAnnouncements && announcementList.length === 0 ? (
        <LoadingState />
      ) : (
        <AnnouncementList
          announcements={sortedAnnouncements}
          onEdit={handleOpenEdit}
          onDelete={deleteAnnouncement}
          onTogglePin={togglePin}
        />
      )}

      <AnnouncementFormModal
        isOpen={isFormOpen}
        editingAnnouncement={editingAnnouncement}
        isSaving={isSavingAnnouncement}
        saveError={saveAnnouncementError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitAnnouncementForm}
      />
    </div>
  );
};

export default AnnouncementsScreen;
