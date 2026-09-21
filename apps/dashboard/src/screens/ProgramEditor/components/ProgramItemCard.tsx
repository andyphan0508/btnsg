import { useEffect, useRef, useState } from 'react';
import type { ProgramItem, ProgramItemKind, ProgramSong } from '@btnsg/shared';
import { PROGRAM_ITEM_KIND_LABELS } from '@btnsg/shared';
import { FiArrowDown, FiArrowUp, FiCheckCircle, FiLoader, FiTrash2 } from 'react-icons/fi';
import { hymnApi } from '../../../api/hymnApi';

export const THANH_CA = 'Thánh Ca';
const SONGBOOKS = [THANH_CA, 'Biệt Thánh Ca', 'Tôn Vinh Chúa Hằng Hữu'];
const KIND_BADGE: Record<ProgramItemKind, string> = { text: 'badge-grey', bible: 'badge-blue', song: 'badge-amber' };

type Lookup = { state: 'idle' | 'loading' | 'ok' | 'error'; text?: string };

/** Thánh Ca: nhập số → tự điền tên bài từ thanhca.httlvn.org. OpenPresenter map bài theo số. */
const SongFields = ({ song, onChange }: { song: ProgramSong; onChange: (song: ProgramSong) => void }) => {
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' });
  const initialNumber = useRef(song.number);
  const isThanhCa = (song.book ?? '').trim().toLowerCase() === THANH_CA.toLowerCase();

  useEffect(() => {
    // Chỉ tra khi người dùng đổi số — mở chương trình cũ không ghi đè tên đã lưu.
    if (!isThanhCa || !song.number || song.number === initialNumber.current) return;
    initialNumber.current = song.number;
    setLookup({ state: 'loading' });
    const timer = window.setTimeout(async () => {
      try {
        const title = await hymnApi.lookupTitle(song.number!);
        onChange({ ...song, title });
        setLookup({ state: 'ok', text: `${THANH_CA} ${song.number}: ${title}` });
      } catch (error) {
        setLookup({ state: 'error', text: error instanceof Error ? error.message : String(error) });
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [song.number, isThanhCa]);

  return (
    <>
      <div className="program-song-row">
        <select className="select" value={SONGBOOKS.includes(song.book ?? '') ? song.book : ''} onChange={(e) => onChange({ ...song, book: e.target.value })}>
          <option value="">Không thuộc thánh ca</option>
          {SONGBOOKS.map((book) => <option key={book} value={book}>{book}</option>)}
        </select>
        <input
          className="input"
          inputMode="numeric"
          placeholder="Số bài"
          disabled={!song.book}
          value={song.number ?? ''}
          onChange={(e) => onChange({ ...song, number: e.target.value.replace(/\D/g, '') })}
        />
      </div>
      <input className="input" placeholder="Tên bài hát" value={song.title} onChange={(e) => onChange({ ...song, title: e.target.value })} />
      {lookup.state !== 'idle' && (
        <div className={`program-lookup ${lookup.state}`}>
          {lookup.state === 'loading' ? <FiLoader /> : lookup.state === 'ok' ? <FiCheckCircle /> : null}
          {lookup.state === 'loading' ? `Đang tra ${THANH_CA} ${song.number}…` : lookup.text}
        </div>
      )}
      {!isThanhCa && (
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
    </>
  );
};

type ProgramItemCardProps = {
  item: ProgramItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (item: ProgramItem) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
};

const ProgramItemCard = ({ item, index, isFirst, isLast, onChange, onMove, onRemove }: ProgramItemCardProps) => {
  return (
    <li className="card program-item">
      <div className="program-item-head">
        <span className="program-item-num">{index + 1}</span>
        <span className={`badge ${KIND_BADGE[item.kind]}`}>{PROGRAM_ITEM_KIND_LABELS[item.kind]}</span>
        <input
          className="input program-item-label"
          aria-label="Tên mục"
          placeholder="Tên mục, VD: Tôn vinh Chúa"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
        />
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Lên" disabled={isFirst} onClick={() => onMove(-1)}><FiArrowUp /></button>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Xuống" disabled={isLast} onClick={() => onMove(1)}><FiArrowDown /></button>
        <button type="button" className="btn btn-danger btn-icon btn-sm" aria-label="Xoá mục" onClick={onRemove}><FiTrash2 /></button>
      </div>

      {item.kind === 'text' && (
        <textarea
          className="textarea"
          rows={2}
          placeholder="Chữ hiện trên màn hình (để trống: hiện tên mục)"
          value={item.text ?? ''}
          onChange={(e) => onChange({ ...item, text: e.target.value })}
        />
      )}
      {item.kind === 'bible' && (
        <input
          className="input"
          placeholder="Tham chiếu, VD: Giăng 3:16-18 · Thi 23 · 1Gi 1:9"
          value={item.ref ?? ''}
          onChange={(e) => onChange({ ...item, ref: e.target.value })}
        />
      )}
      {item.kind === 'song' && <SongFields song={item.song ?? { title: '' }} onChange={(song) => onChange({ ...item, song })} />}

      <input
        className="input program-note"
        placeholder="Ghi chú cho người trình chiếu (người hướng dẫn, lưu ý…)"
        value={item.note ?? ''}
        onChange={(e) => onChange({ ...item, note: e.target.value })}
      />
    </li>
  );
};

export default ProgramItemCard;
