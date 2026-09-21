import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Program } from '@btnsg/shared';
import { programApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import ProgramList from './components/ProgramList';

/** Địa chỉ OpenPresenter gọi để tải chương trình đã công bố. */
const SYNC_URL = `${window.location.origin}/api/program`;

const ProgramsScreen = () => {
  // 1. State declarations
  const navigate = useNavigate();
  const [programList, setProgramList] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState<boolean>(false);
  const [programListError, setProgramListError] = useState<string | null>(null);

  // 2. Logic functions
  const sortedPrograms = useMemo(() => [...programList].sort((a, b) => b.date.localeCompare(a.date)), [programList]);

  // 3. API call functions
  const fetchProgramList = async (): Promise<boolean> => {
    try {
      setIsLoadingPrograms(true);
      setProgramList(await programApi.getList());
      return true;
    } catch (error) {
      setProgramListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchProgramList();
  }, []);

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Thờ phượng</span>
          <h2>Chương trình thờ phượng</h2>
          <p className="page-sub">
            Bản đã công bố được OpenPresenter tải về qua <code>{SYNC_URL}</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sortedPrograms.length > 0 && (
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/chuong-trinh/moi?copy=${sortedPrograms[0].id}`)}>
              Sao chép tuần gần nhất
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => navigate('/chuong-trinh/moi')}>
            + Chương trình mới
          </button>
        </div>
      </div>

      {programListError && <div className="form-error" style={{ marginBottom: 14 }}>{programListError}</div>}
      {isLoadingPrograms && programList.length === 0 ? (
        <LoadingState />
      ) : (
        <ProgramList
          programs={sortedPrograms}
          onEdit={(program) => navigate(`/chuong-trinh/${program.id}`)}
          onCopy={(program) => navigate(`/chuong-trinh/moi?copy=${program.id}`)}
        />
      )}
    </div>
  );
};

export default ProgramsScreen;
