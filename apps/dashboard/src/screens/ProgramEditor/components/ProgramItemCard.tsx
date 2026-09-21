import { useEffect, useRef, useState } from 'react';
import type { ProgramItem, ProgramItemKind, ProgramSong } from '@btnsg/shared';
import { PROGRAM_ITEM_KIND_LABELS, pastedLyricsSections } from '@btnsg/shared';
import { FiArrowDown, FiArrowUp, FiCheckCircle, FiCopy, FiLoader, FiMenu, FiTrash2 } from 'react-icons/fi';
import { hymnApi, type HymnInfo } from '../../../api/hymnApi';
import ArrangementBuilder from './ArrangementBuilder';

export const THANH_CA = 'Thánh Ca';
const SONGBOOKS = [THANH_CA, 'Biệt Thánh Ca', 'Tôn Vinh Chúa Hằng Hữu'];
const KIND_BADGE: Record<ProgramItemKind, string> = { text: 'badge-grey', bible: 'badge-blue', song: 'badge-amber', sermon: 'badge-navy' };

const isThanhCa = (song: ProgramSong) => (song.book ?? '').trim().toLowerCase() === THANH_CA.toLowerCase();

/**
 * Thánh Ca: nhập số → tự điền tên bài và lấy các đoạn lời từ thanhca.httlvn.org để chọn thứ tự hát.
 * Bài khác: dán lời (nếu OpenPresenter chưa có) — các đoạn trong lời dán dùng để chọn thứ tự hát.
 */
const SongFields = ({ song, onChange }: { song: ProgramSong; onChange: (song: ProgramSong) => void }) => {
  const [hymn, setHymn] = useState<HymnInfo | null>(null);
  const [lookup, setLookup] = useState<{ state: 'idle' | 'loading' | 'ok' | 'error'; text?: string }>({ state: 'idle' });
  const savedNumber = useRef(song.number);
  const thanhCa = isThanhCa(song);

  useEffect(() => {
    setHymn(null);
    if (!thanhCa || !song.number) return setLookup({ state: 'idle' });
    // Số đã lưu từ trước: chỉ lấy các đoạn lời, không ghi đè tên và thứ tự hát đã chọn.
    const changedByUser = song.number !== savedNumber.current;
    setLookup({ state: 'loading' });
    const timer = window.setTimeout(async () => {
      try {
        const info = await hymnApi.lookup(song.number!);
        setHymn(info);
        setLookup({ state: 'ok', text: `${THANH_CA} ${info.number}: ${info.title}` });
        if (changedByUser) {
          savedNumber.current = song.number;
          onChange({ ...song, title: info.title, arrangement: undefined });
        }
      } catch (error) {
        setLookup({ state: 'error', text: error instanceof Error ? error.message : String(error) });
      }
    }, changedByUser ? 400 : 0);
    return () => window.clearTimeout(timer);
  }, [song.number, thanhCa]);

  const pasted = thanhCa ? [] : pastedLyricsSections(song.lyrics ?? '');
  const sections = hymn?.sections ?? pasted;
  const defaultOrder = hymn?.order ?? pasted.map((s) => s.label);

  return (
    <>
      <div className="program-song-row">
        <select
          className="select"
          aria-label="Thánh ca"
          value={SONGBOOKS.includes(song.book ?? '') ? song.book : ''}
          onChange={(e) => onChange({ ...song, book: e.target.value, arrangement: undefined })}
        >
          <option value="">Không thuộc thánh ca</option>
          {SONGBOOKS.map((book) => <option key={book} value={book}>{book}</option>)}
        </select>
        <input
          className="input"
          inputMode="numeric"
          aria-label="Số bài"
          placeholder="Số bài"
          disabled={!song.book}
          value={song.number ?? ''}
          onChange={(e) => onChange({ ...song, number: e.target.value.replace(/\D/g, '') })}
        />
      </div>
      <input className="input" aria-label="Tên bài hát" placeholder="Tên bài hát" value={song.title} onChange={(e) => onChange({ ...song, title: e.target.value })} />
      {lookup.state !== 'idle' && (
        <div className={`program-lookup ${lookup.state}`}>
          {lookup.state === 'loading' ? <FiLoader /> : lookup.state === 'ok' ? <FiCheckCircle /> : null}
          {lookup.state === 'loading' ? `Đang tra ${THANH_CA} ${song.number}…` : lookup.text}
        </div>
      )}
      {!thanhCa && (
        <details open={!!song.lyrics}>
          <summary className="cell-muted program-summary">Lời bài hát — chỉ cần khi bài chưa có trong OpenPresenter</summary>
          <textarea
            className="textarea"
            rows={6}
            placeholder={'[Verse 1]\nLời phiên khúc…\n\n[Chorus]\nLời điệp khúc…\n\n(hoặc dán lời, mỗi đoạn cách nhau một dòng trống)'}
            value={song.lyrics ?? ''}
            onChange={(e) => onChange({ ...song, lyrics: e.target.value })}
          />
        </details>
      )}
      <ArrangementBuilder
        sections={sections}
        defaultOrder={defaultOrder}
        value={song.arrangement}
        onChange={(arrangement) => onChange({ ...song, arrangement })}
      />
    </>
  );
};

const BibleFields = ({ item, onChange }: { item: ProgramItem; onChange: (item: ProgramItem) => void }) => (
  <div className="program-bible-row">
    <input
      className="input"
      aria-label="Tham chiếu Kinh Thánh"
      placeholder="Tham chiếu, VD: Giăng 3:16-18 · Thi 23 · 1Gi 1:9"
      value={item.ref ?? ''}
      onChange={(e) => onChange({ ...item, ref: e.target.value })}
    />
    <label className="program-check">
      <input type="checkbox" checked={!!item.bilingual} onChange={(e) => onChange({ ...item, bilingual: e.target.checked })} />
      Song ngữ (KJV)
    </label>
  </div>
);

type ProgramItemCardProps = {
  item: ProgramItem;
  index: number;
  /** Giờ dự kiến bắt đầu mục ("HH:MM") khi chương trình có giờ bắt đầu. */
  startsAt: string | null;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  onChange: (item: ProgramItem) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
};

const ProgramItemCard = (props: ProgramItemCardProps) => {
  const { item, index, startsAt, isFirst, isLast, isDragging, onChange } = props;
  // Chỉ kéo được khi nắm tay cầm — kéo trong ô nhập vẫn là bôi đen chữ.
  const [armed, setArmed] = useState(false);

  return (
    <li
      className={`card program-item${isDragging ? ' dragging' : ''}`}
      draggable={armed}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        props.onDragStart();
      }}
      onDragEnter={props.onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={() => {
        setArmed(false);
        props.onDragEnd();
      }}
    >
      <div className="program-item-head">
        <span className="program-drag" title="Kéo để đổi thứ tự" onPointerDown={() => setArmed(true)} onPointerUp={() => setArmed(false)}>
          <FiMenu />
        </span>
        <span className="program-item-num">{index + 1}</span>
        {startsAt && <span className="program-time">{startsAt}</span>}
        <span className={`badge ${KIND_BADGE[item.kind]}`}>{PROGRAM_ITEM_KIND_LABELS[item.kind]}</span>
        <input
          className="input program-item-label"
          aria-label="Tên mục"
          placeholder="Tên mục, VD: Tôn vinh Chúa"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
        />
        <div className="program-item-actions">
          <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Nhân bản mục" title="Nhân bản" onClick={props.onDuplicate}><FiCopy /></button>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Lên" disabled={isFirst} onClick={() => props.onMove(-1)}><FiArrowUp /></button>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Xuống" disabled={isLast} onClick={() => props.onMove(1)}><FiArrowDown /></button>
          <button type="button" className="btn btn-danger btn-icon btn-sm" aria-label="Xoá mục" onClick={props.onRemove}><FiTrash2 /></button>
        </div>
      </div>

      {item.kind === 'text' && (
        <textarea
          className="textarea"
          rows={2}
          aria-label="Chữ trên màn hình"
          placeholder="Chữ hiện trên màn hình (để trống: hiện tên mục)"
          value={item.text ?? ''}
          onChange={(e) => onChange({ ...item, text: e.target.value })}
        />
      )}
      {item.kind === 'bible' && <BibleFields item={item} onChange={onChange} />}
      {item.kind === 'sermon' && (
        <>
          <div className="program-song-row program-sermon-row">
            <input className="input" aria-label="Đề tài" placeholder="Đề tài bài giảng" value={item.text ?? ''} onChange={(e) => onChange({ ...item, text: e.target.value })} />
            <input className="input" aria-label="Diễn giả" placeholder="Diễn giả" value={item.speaker ?? ''} onChange={(e) => onChange({ ...item, speaker: e.target.value })} />
          </div>
          <BibleFields item={item} onChange={onChange} />
        </>
      )}
      {item.kind === 'song' && <SongFields song={item.song ?? { title: '' }} onChange={(song) => onChange({ ...item, song })} />}

      <div className="program-meta-row">
        <input
          className="input"
          aria-label="Người phụ trách"
          placeholder="Người phụ trách"
          value={item.leader ?? ''}
          onChange={(e) => onChange({ ...item, leader: e.target.value })}
        />
        <label className="program-minutes">
          <input
            className="input"
            type="number"
            min={0}
            max={240}
            aria-label="Thời lượng (phút)"
            value={item.minutes ?? ''}
            onChange={(e) => onChange({ ...item, minutes: e.target.value ? Number(e.target.value) : undefined })}
          />
          phút
        </label>
      </div>
      <input
        className="input program-note"
        aria-label="Ghi chú cho người trình chiếu"
        placeholder="Ghi chú cho người trình chiếu (hiện trên màn hình sân khấu)"
        value={item.note ?? ''}
        onChange={(e) => onChange({ ...item, note: e.target.value })}
      />
    </li>
  );
};

export default ProgramItemCard;
