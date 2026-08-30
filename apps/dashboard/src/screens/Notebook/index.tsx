import { useEffect, useMemo, useState } from 'react';
import type { Note, NoteCategory } from '@btnsg/shared';
import { noteApi } from '../../api/resourceApi';
import { todayIsoDate } from '../../utils/format';
import LoadingState from '../../ui/LoadingState';
import NoteFilters from './components/NoteFilters';
import NoteList from './components/NoteList';
import NoteMarkdownEditor from './components/NoteMarkdownEditor';
import NoteMetaForm from './components/NoteMetaForm';
import NotePreview from './components/NotePreview';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

type ViewMode = 'list' | 'preview' | 'editor';

const parseTags = (tagsText: string): string[] => {
  return [...new Set(tagsText.split(',').map((tag) => tag.trim()).filter((tag) => tag !== ''))];
};

const NotebookScreen = () => {
  // 1. State — danh sách
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);

  // State — điều hướng list ⇄ preview ⇄ editor
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // State — form soạn
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<NoteCategory>('ghi_chu');
  const [date, setDate] = useState<string>(todayIsoDate());
  const [speaker, setSpeaker] = useState<string>('');
  const [scripture, setScripture] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // State — lưu / xoá
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // State — tìm & lọc (để đối chiếu)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // 2. Logic thuần
  const validateNote = (): string | null => {
    if (!title.trim()) return 'Vui lòng nhập tiêu đề.';
    if (!content.trim()) return 'Vui lòng nhập nội dung.';
    return null;
  };

  const resetForm = (): void => {
    setTitle('');
    setCategory('ghi_chu');
    setDate(todayIsoDate());
    setSpeaker('');
    setScripture('');
    setTagsText('');
    setContent('');
    setEditingNoteId(null);
    setSaveError(null);
  };

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return notes
      .filter((note) => categoryFilter === 'all' || note.category === categoryFilter)
      .filter((note) => !activeTag || note.tags.includes(activeTag))
      .filter((note) => {
        if (!keyword) return true;
        const haystack = [note.title, note.content, note.scripture, note.speaker, ...note.tags]
          .filter(Boolean)
          .join(' \n ')
          .toLowerCase();
        return haystack.includes(keyword);
      })
      .sort((a, b) => (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt));
  }, [notes, searchQuery, categoryFilter, activeTag]);

  // 3. API calls
  const loadNotes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setListError(null);
      const list = await noteApi.getList();
      setNotes(list);
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const openPreview = (note: Note): void => {
    setSelectedNoteId(note.id);
    setViewMode('preview');
  };

  const openNewNote = (): void => {
    resetForm();
    setSelectedNoteId(null);
    setViewMode('editor');
  };

  const openEditFromPreview = (): void => {
    if (!selectedNote) return;
    setEditingNoteId(selectedNote.id);
    setTitle(selectedNote.title);
    setCategory(selectedNote.category);
    setDate(selectedNote.date || todayIsoDate());
    setSpeaker(selectedNote.speaker || '');
    setScripture(selectedNote.scripture || '');
    setTagsText(selectedNote.tags.join(', '));
    setContent(selectedNote.content);
    setSaveError(null);
    setViewMode('editor');
  };

  const backToList = (): void => {
    resetForm();
    setSelectedNoteId(null);
    setViewMode('list');
  };

  /** Huỷ soạn: quay lại trang xem (nếu đang sửa bài có sẵn) hoặc về danh sách (nếu đang tạo mới). */
  const cancelEditor = (): void => {
    resetForm();
    setViewMode(selectedNoteId ? 'preview' : 'list');
  };

  const submitNote = async (): Promise<void> => {
    const validationError = validateNote();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const payload = {
        title: title.trim(),
        category,
        date: date || undefined,
        speaker: speaker.trim() || undefined,
        scripture: scripture.trim() || undefined,
        tags: parseTags(tagsText),
        content: content.trim(),
      };

      const saved = editingNoteId ? await noteApi.update(editingNoteId, payload) : await noteApi.create(payload);

      await loadNotes();
      resetForm();
      setSelectedNoteId(saved.id);
      setViewMode('preview');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (note: Note): Promise<void> => {
    if (!window.confirm(`Xoá "${note.title}"?`)) return;
    try {
      setDeletingNoteId(note.id);
      await noteApi.remove(note.id);
      if (selectedNoteId === note.id) backToList();
      await loadNotes();
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingNoteId(null);
    }
  };

  // 4. Effects
  useEffect(() => {
    loadNotes();
  }, []);

  // 5. Handlers
  const toggleTag = (tag: string): void => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  // 6. Render
  if (viewMode === 'editor') {
    return (
      <div>
        <div className="page-head">
          <div>
            <button type="button" className="btn btn-ghost" style={styles.backBtn} onClick={cancelEditor}>
              <FiArrowLeft /> {selectedNoteId ? 'Quay lại xem' : 'Quay lại danh sách'}
            </button>
            <span className="page-eyebrow">Tri thức</span>
            <h2>{editingNoteId ? 'Sửa ghi chép' : 'Ghi chép mới'}</h2>
          </div>
        </div>

        <div style={styles.column}>
          <NoteMetaForm
            title={title}
            category={category}
            date={date}
            speaker={speaker}
            scripture={scripture}
            tagsText={tagsText}
            onTitleChange={setTitle}
            onCategoryChange={setCategory}
            onDateChange={setDate}
            onSpeakerChange={setSpeaker}
            onScriptureChange={setScripture}
            onTagsTextChange={setTagsText}
          />

          <div className="card" style={styles.contentCard}>
            <div className="card-title">Nội dung (Markdown) *</div>
            <NoteMarkdownEditor
              value={content}
              onChange={setContent}
              placeholder={
                'Chọn văn bản rồi bấm nút định dạng ở trên, hoặc gõ Markdown trực tiếp:\n\n## Ý chính\n**đậm**, *nghiêng*, danh sách bằng dấu -\n\n> Trích dẫn câu Kinh Thánh'
              }
            />
          </div>

          {saveError && <div className="form-error">{saveError}</div>}

          <div style={styles.actionRow}>
            <button type="button" className="btn btn-outline btn-sm" onClick={cancelEditor}>
              Huỷ
            </button>
            <button type="button" className="btn btn-primary btn-sm" disabled={isSaving} onClick={submitNote}>
              {isSaving ? 'Đang lưu…' : <><FiCheck /> Lưu</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'preview') {
    return (
      <div>
        <div className="page-head">
          <div>
            <button type="button" className="btn btn-ghost" style={styles.backBtn} onClick={backToList}>
              <FiArrowLeft /> Quay lại danh sách
            </button>
          </div>
        </div>

        {selectedNote ? (
          <NotePreview note={selectedNote} onEdit={openEditFromPreview} />
        ) : (
          <LoadingState label="Đang tải ghi chép…" />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Tri thức</span>
          <h2>Sổ ghi chép</h2>
          <p className="page-sub">
            Ghi chú cá nhân và lưu trữ bài giảng bằng Markdown — gắn thẻ và câu gốc để dễ tra cứu, đối chiếu về sau.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNewNote}>
          + Ghi chép mới
        </button>
      </div>

      <div style={styles.column}>
        <NoteFilters
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          activeTag={activeTag}
          allTags={allTags}
          onSearchQueryChange={setSearchQuery}
          onCategoryFilterChange={setCategoryFilter}
          onTagClick={toggleTag}
        />

        {listError && <div className="form-error">{listError}</div>}
        {isLoading ? (
          <LoadingState />
        ) : (
          <NoteList
            notes={filteredNotes}
            totalCount={notes.length}
            deletingNoteId={deletingNoteId}
            onOpen={openPreview}
            onDelete={deleteNote}
          />
        )}
      </div>
    </div>
  );
};

export default NotebookScreen;

const styles = {
  column: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
  backBtn: { padding: '4px 10px 4px 4px', marginBottom: 8 },
  contentCard: { flex: 1 },
  actionRow: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
};
