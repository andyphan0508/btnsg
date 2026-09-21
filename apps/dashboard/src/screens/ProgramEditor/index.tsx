import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Program, ProgramItem, ProgramItemKind } from '@btnsg/shared';
import {
  PROGRAM_ITEM_KIND_LABELS,
  cleanProgramItems,
  copyProgramItems,
  newProgramItem,
  nextFreeSunday,
  programTemplateItems,
} from '@btnsg/shared';
import { FiArrowLeft } from 'react-icons/fi';
import { programApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import { formatDate } from '../../utils/format';
import ProgramItemCard from './components/ProgramItemCard';

type Draft = { date: string; title: string; items: ProgramItem[]; published: boolean };

/** Địa chỉ OpenPresenter gọi để tải chương trình đã công bố. */
const SYNC_URL = `${window.location.origin}/api/program`;

const friendlyError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /duplicate|unique/i.test(message) ? 'Ngày này đã có chương trình — mở chương trình đó để sửa.' : message;
};

/** Trang làm việc: /chuong-trinh/moi (tạo mới, ?copy=<id> để chép tuần trước) và /chuong-trinh/:id (sửa). */
const ProgramEditorScreen = () => {
  // 1. State declarations
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [savedProgram, setSavedProgram] = useState<Program | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // 2. Logic functions
  const update = (patch: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setIsDirty(true);
  };
  const setItems = (items: ProgramItem[]) => update({ items });
  const setItem = (index: number, item: ProgramItem) => setItems(draft!.items.map((x, i) => (i === index ? item : x)));
  const moveItem = (index: number, dir: -1 | 1) => {
    const items = [...draft!.items];
    [items[index], items[index + dir]] = [items[index + dir], items[index]];
    setItems(items);
  };
  const addItem = (kind: ProgramItemKind) => setItems([...draft!.items, newProgramItem(kind, kind === 'song' ? 'Tôn vinh Chúa' : '')]);

  // 3. API call functions
  const loadDraft = async (): Promise<void> => {
    try {
      if (id) {
        const program = await programApi.getById(id);
        setSavedProgram(program);
        setDraft({ date: program.date, title: program.title, items: program.items, published: program.published });
        return;
      }
      const programs = await programApi.getList();
      const source = programs.find((p) => p.id === searchParams.get('copy'));
      setDraft({
        date: nextFreeSunday(programs.map((p) => p.date)),
        title: '',
        items: source ? copyProgramItems(source.items) : programTemplateItems(),
        published: false,
      });
    } catch (error) {
      setLoadError(friendlyError(error));
    }
  };

  const save = async (published: boolean): Promise<boolean> => {
    if (!draft?.date) {
      setMessage({ ok: false, text: 'Vui lòng chọn ngày.' });
      return false;
    }
    try {
      setIsSaving(true);
      setMessage(null);
      const payload = { ...draft, published, items: cleanProgramItems(draft.items) };
      const saved = isNew ? await programApi.create(payload) : await programApi.update(id!, payload);
      setSavedProgram(saved);
      setDraft({ date: saved.date, title: saved.title, items: saved.items, published: saved.published });
      setIsDirty(false);
      setMessage({ ok: true, text: published ? 'Đã lưu & công bố — OpenPresenter tải được ngay.' : 'Đã lưu bản nháp.' });
      if (isNew) navigate(`/chuong-trinh/${saved.id}`, { replace: true });
      return true;
    } catch (error) {
      setMessage({ ok: false, text: friendlyError(error) });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (): Promise<void> => {
    if (!id || !window.confirm('Xoá chương trình này?')) return;
    try {
      await programApi.remove(id);
      navigate('/chuong-trinh');
    } catch (error) {
      setMessage({ ok: false, text: friendlyError(error) });
    }
  };

  // 4. Effects
  useEffect(() => {
    setDraft(null);
    setIsDirty(false);
    loadDraft();
  }, [id]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  // 6. Render
  if (loadError) return <div className="form-error">{loadError}</div>;
  if (!draft) return <LoadingState />;

  return (
    <div>
      <div className="page-head">
        <div>
          <Link to="/chuong-trinh" className="program-back"><FiArrowLeft /> Tất cả chương trình</Link>
          <h2>{isNew ? 'Chương trình mới' : `Chương trình ${formatDate(draft.date)}`}</h2>
          <p className="page-sub">Điền từng mục theo thứ tự buổi nhóm. Thánh Ca chỉ cần chọn số bài.</p>
        </div>
      </div>

      <div className="program-workspace">
        <div>
          <ol className="program-items">
            {draft.items.map((item, index) => (
              <ProgramItemCard
                key={item.id}
                item={item}
                index={index}
                isFirst={index === 0}
                isLast={index === draft.items.length - 1}
                onChange={(next) => setItem(index, next)}
                onMove={(dir) => moveItem(index, dir)}
                onRemove={() => setItems(draft.items.filter((_, i) => i !== index))}
              />
            ))}
          </ol>
          <div className="program-add">
            {(Object.keys(PROGRAM_ITEM_KIND_LABELS) as ProgramItemKind[]).map((kind) => (
              <button key={kind} type="button" className="btn btn-outline" onClick={() => addItem(kind)}>
                + {PROGRAM_ITEM_KIND_LABELS[kind]}
              </button>
            ))}
          </div>
        </div>

        <aside className="card program-aside">
          <div className="field">
            <label className="field-label">Ngày *</label>
            <input type="date" className="input" value={draft.date} onChange={(e) => update({ date: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Tiêu đề</label>
            <input className="input" placeholder="Trống: “Chúa Nhật dd/mm/yyyy”" value={draft.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="program-status">
            <span className={`badge ${savedProgram?.published ? 'badge-green' : 'badge-grey'}`}>
              {savedProgram ? (savedProgram.published ? 'Đã công bố' : 'Bản nháp') : 'Chưa lưu'}
            </span>
            {isDirty && <span className="badge badge-amber">Có thay đổi chưa lưu</span>}
          </div>
          {message && <div className={message.ok ? 'program-ok' : 'form-error'}>{message.text}</div>}
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => save(true)}>
            {isSaving ? 'Đang lưu…' : 'Lưu & công bố'}
          </button>
          <button type="button" className="btn btn-ghost" disabled={isSaving} onClick={() => save(false)}>Lưu nháp</button>
          {!isNew && <button type="button" className="btn btn-danger" onClick={remove}>Xoá chương trình</button>}
          <p className="cell-muted program-hint">
            OpenPresenter tải bản đã công bố qua <code>{SYNC_URL}</code>
          </p>
        </aside>
      </div>
    </div>
  );
};

export default ProgramEditorScreen;
