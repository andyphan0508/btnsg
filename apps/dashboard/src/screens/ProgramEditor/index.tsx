import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Program, ProgramItem, ProgramItemKind } from '@btnsg/shared';
import {
  PROGRAM_ITEM_KIND_LABELS,
  PROGRAM_ITEM_PRESETS,
  cleanProgramItems,
  copyProgramItems,
  duplicateProgramItem,
  newProgramItem,
  nextFreeSunday,
  programTemplateItems,
  programTimeline,
} from '@btnsg/shared';
import { FiArrowLeft, FiClock, FiPrinter } from 'react-icons/fi';
import { programApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import { formatDate } from '../../utils/format';
import ProgramItemCard from './components/ProgramItemCard';
import ProgramPrintSheet from './components/ProgramPrintSheet';

type Draft = { date: string; title: string; startTime: string; items: ProgramItem[]; published: boolean };

/** Địa chỉ OpenPresenter gọi để tải chương trình đã công bố. */
const SYNC_URL = `${window.location.origin}/api/program`;
const DEFAULT_START = '09:00';

const friendlyError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (/duplicate|unique/i.test(message)) return 'Ngày này đã có chương trình — mở chương trình đó để sửa.';
  if (/start_time/i.test(message)) return 'Database chưa có cột giờ bắt đầu — chạy supabase/migrations/0007_program_start_time.sql.';
  return message;
};

const toDraft = (program: Program): Draft => ({
  date: program.date,
  title: program.title,
  startTime: program.startTime ?? '',
  items: program.items,
  published: program.published,
});

/** Trang làm việc: /chuong-trinh/moi (tạo mới, ?copy=<id> để chép một tuần khác) và /chuong-trinh/:id (sửa). */
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // 2. Logic functions
  const update = (patch: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setIsDirty(true);
  };
  const setItems = (items: ProgramItem[]) => update({ items });
  const setItem = (index: number, item: ProgramItem) => setItems(draft!.items.map((x, i) => (i === index ? item : x)));
  const moveItem = (from: number, to: number) => {
    const items = [...draft!.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    setItems(items);
  };
  const addItem = (kind: ProgramItemKind, label = '', minutes?: number) => setItems([...draft!.items, newProgramItem(kind, label, minutes)]);
  const duplicateItem = (index: number) => {
    const items = [...draft!.items];
    items.splice(index + 1, 0, duplicateProgramItem(items[index]));
    setItems(items);
  };

  // 3. API call functions
  const loadDraft = async (): Promise<void> => {
    try {
      if (id) {
        const program = await programApi.getById(id);
        setSavedProgram(program);
        setDraft(toDraft(program));
        return;
      }
      const programs = await programApi.getList();
      const source = programs.find((p) => p.id === searchParams.get('copy'));
      setDraft({
        date: nextFreeSunday(programs.map((p) => p.date)),
        title: '',
        startTime: source?.startTime ?? DEFAULT_START,
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
      const payload = { ...draft, startTime: draft.startTime || undefined, published, items: cleanProgramItems(draft.items) };
      const saved = isNew ? await programApi.create(payload) : await programApi.update(id!, payload);
      setSavedProgram(saved);
      setDraft(toDraft(saved));
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

  const timeline = programTimeline(draft.startTime, draft.items);

  return (
    <div>
      <div className="page-head program-noprint">
        <div>
          <Link to="/chuong-trinh" className="program-back"><FiArrowLeft /> Tất cả chương trình</Link>
          <h2>{isNew ? 'Chương trình mới' : `Chương trình ${formatDate(draft.date)}`}</h2>
          <p className="page-sub">Điền từng mục theo thứ tự buổi nhóm — kéo ☰ để đổi chỗ. Thánh Ca chỉ cần số bài, rồi chọn đoạn và thứ tự hát.</p>
        </div>
      </div>

      <div className="program-workspace program-noprint">
        <div>
          <ol className="program-items">
            {draft.items.map((item, index) => (
              <ProgramItemCard
                key={item.id}
                item={item}
                index={index}
                startsAt={timeline.starts[index]}
                isFirst={index === 0}
                isLast={index === draft.items.length - 1}
                isDragging={dragIndex === index}
                onChange={(next) => setItem(index, next)}
                onMove={(dir) => moveItem(index, index + dir)}
                onRemove={() => setItems(draft.items.filter((_, i) => i !== index))}
                onDuplicate={() => duplicateItem(index)}
                onDragStart={() => setDragIndex(index)}
                onDragEnter={() => {
                  if (dragIndex === null || dragIndex === index) return;
                  moveItem(dragIndex, index);
                  setDragIndex(index);
                }}
                onDragEnd={() => setDragIndex(null)}
              />
            ))}
          </ol>

          <div className="card program-add">
            <div className="program-add-title">Thêm nhanh</div>
            <div className="program-add-row">
              {PROGRAM_ITEM_PRESETS.map((preset) => (
                <button key={preset.label} type="button" className="btn btn-outline btn-sm" onClick={() => addItem(preset.kind, preset.label, preset.minutes)}>
                  + {preset.label}
                </button>
              ))}
            </div>
            <div className="program-add-row">
              {(Object.keys(PROGRAM_ITEM_KIND_LABELS) as ProgramItemKind[]).map((kind) => (
                <button key={kind} type="button" className="btn btn-ghost btn-sm" onClick={() => addItem(kind)}>
                  + {PROGRAM_ITEM_KIND_LABELS[kind]} trống
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="card program-aside">
          <div className="field">
            <label className="field-label">Ngày *</label>
            <input type="date" className="input" value={draft.date} onChange={(e) => update({ date: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Giờ bắt đầu</label>
            <input type="time" className="input" value={draft.startTime} onChange={(e) => update({ startTime: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Tiêu đề</label>
            <input className="input" placeholder="Trống: “Chúa Nhật dd/mm/yyyy”" value={draft.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="program-summary-box">
            <FiClock />
            <span>
              {draft.items.length} mục · {timeline.totalMinutes} phút
              {timeline.end && <> · kết thúc ~<b>{timeline.end}</b></>}
            </span>
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
          <button type="button" className="btn btn-outline" onClick={() => window.print()}><FiPrinter /> In chương trình</button>
          {!isNew && <button type="button" className="btn btn-danger" onClick={remove}>Xoá chương trình</button>}
          <p className="cell-muted program-hint">
            OpenPresenter tải bản đã công bố qua <code>{SYNC_URL}</code>
          </p>
        </aside>
      </div>

      <ProgramPrintSheet
        date={draft.date}
        title={draft.title}
        startTime={draft.startTime || undefined}
        items={draft.items}
        starts={timeline.starts}
        end={timeline.end}
        totalMinutes={timeline.totalMinutes}
      />
    </div>
  );
};

export default ProgramEditorScreen;
