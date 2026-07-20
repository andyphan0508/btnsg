import { useEffect, useMemo, useState } from 'react';
import type { RequestItem, RequestStatus } from '@btnsg/shared';
import { REQUEST_STATUS_LABELS } from '@btnsg/shared';
import { requestApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import RequestFormModal, { type RequestFormValues } from './components/RequestFormModal';
import RequestTable from './components/RequestTable';

const RequestsScreen = () => {
  // 1. State declarations
  const [requestList, setRequestList] = useState<RequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [requestListError, setRequestListError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(null);
  const [isSavingRequest, setIsSavingRequest] = useState<boolean>(false);
  const [saveRequestError, setSaveRequestError] = useState<string | null>(null);

  // 2. Logic functions
  const validateRequestForm = (values: RequestFormValues): boolean => {
    if (!values.title.trim()) return false;
    if (!values.content.trim()) return false;
    if (!values.requesterName.trim()) return false;
    return true;
  };

  const filteredRequests = useMemo(() => {
    const sorted = [...requestList].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (statusFilter === 'all') return sorted;
    return sorted.filter((item) => item.status === statusFilter);
  }, [requestList, statusFilter]);

  // 3. API call functions
  const fetchRequestList = async (): Promise<boolean> => {
    try {
      setIsLoadingRequests(true);
      const data = await requestApi.getList();
      setRequestList(data);
      return true;
    } catch (error) {
      setRequestListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const submitRequestForm = async (values: RequestFormValues): Promise<boolean> => {
    if (!validateRequestForm(values)) {
      setSaveRequestError('Vui lòng nhập tiêu đề, nội dung và người gửi.');
      return false;
    }

    try {
      setIsSavingRequest(true);
      setSaveRequestError(null);
      const payload = {
        title: values.title,
        content: values.content,
        requesterName: values.requesterName,
        status: values.status,
        response: values.response || undefined,
      };
      if (editingRequest) {
        await requestApi.update(editingRequest.id, payload);
      } else {
        await requestApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchRequestList();
      return true;
    } catch (error) {
      setSaveRequestError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingRequest(false);
    }
  };

  const setRequestStatus = async (item: RequestItem, status: RequestStatus): Promise<boolean> => {
    try {
      await requestApi.update(item.id, { status });
      await fetchRequestList();
      return true;
    } catch (error) {
      setRequestListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const deleteRequest = async (item: RequestItem): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá request "${item.title}"?`);
    if (!confirmed) return false;

    try {
      await requestApi.remove(item.id);
      await fetchRequestList();
      return true;
    } catch (error) {
      setRequestListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchRequestList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingRequest(null);
    setSaveRequestError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: RequestItem) => {
    setEditingRequest(item);
    setSaveRequestError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Điều hành</span>
          <h2>Đề xuất / Request</h2>
          <p className="page-sub">Ghi nhận và theo dõi mọi yêu cầu để không bị bỏ sót thông tin.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Ghi nhận request
        </button>
      </div>

      <div className="toolbar">
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {requestListError && <div className="form-error" style={{ marginBottom: 14 }}>{requestListError}</div>}
      {isLoadingRequests && requestList.length === 0 ? (
        <LoadingState />
      ) : (
        <RequestTable
          requests={filteredRequests}
          onEdit={handleOpenEdit}
          onDelete={deleteRequest}
          onSetStatus={setRequestStatus}
        />
      )}

      <RequestFormModal
        isOpen={isFormOpen}
        editingRequest={editingRequest}
        isSaving={isSavingRequest}
        saveError={saveRequestError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitRequestForm}
      />
    </div>
  );
};

export default RequestsScreen;
