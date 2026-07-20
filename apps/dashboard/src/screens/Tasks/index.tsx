import { useEffect, useState } from 'react';
import type { Member, TaskItem, TaskStatus } from '@btnsg/shared';
import { memberApi, taskApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import TaskBoard from './components/TaskBoard';
import TaskFormModal, { type TaskFormValues } from './components/TaskFormModal';

const TasksScreen = () => {
  // 1. State declarations
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [taskListError, setTaskListError] = useState<string | null>(null);

  const [memberList, setMemberList] = useState<Member[]>([]);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isSavingTask, setIsSavingTask] = useState<boolean>(false);
  const [saveTaskError, setSaveTaskError] = useState<string | null>(null);

  // 2. Logic functions
  const validateTaskForm = (values: TaskFormValues): boolean => {
    if (!values.title.trim()) return false;
    return true;
  };

  // 3. API call functions
  const fetchTaskList = async (): Promise<boolean> => {
    try {
      setIsLoadingTasks(true);
      const data = await taskApi.getList();
      setTaskList(data);
      return true;
    } catch (error) {
      setTaskListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchMemberList = async (): Promise<boolean> => {
    try {
      const data = await memberApi.getList();
      setMemberList(data);
      return true;
    } catch {
      return false;
    }
  };

  const submitTaskForm = async (values: TaskFormValues): Promise<boolean> => {
    if (!validateTaskForm(values)) {
      setSaveTaskError('Vui lòng nhập tên công việc.');
      return false;
    }

    try {
      setIsSavingTask(true);
      setSaveTaskError(null);
      const payload = {
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
        assigneeIds: values.assigneeIds,
      };
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
      } else {
        await taskApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchTaskList();
      return true;
    } catch (error) {
      setSaveTaskError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingTask(false);
    }
  };

  const moveTask = async (task: TaskItem, status: TaskStatus): Promise<boolean> => {
    try {
      await taskApi.update(task.id, { status });
      await fetchTaskList();
      return true;
    } catch (error) {
      setTaskListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const deleteTask = async (task: TaskItem): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá công việc "${task.title}"?`);
    if (!confirmed) return false;

    try {
      await taskApi.remove(task.id);
      await fetchTaskList();
      return true;
    } catch (error) {
      setTaskListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchTaskList();
    fetchMemberList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingTask(null);
    setSaveTaskError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setSaveTaskError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Điều hành</span>
          <h2>Đầu mục công việc</h2>
          <p className="page-sub">Theo dõi các công việc của Ban theo bảng Kanban.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm công việc
        </button>
      </div>

      {taskListError && <div className="form-error" style={{ marginBottom: 14 }}>{taskListError}</div>}
      {isLoadingTasks && taskList.length === 0 ? (
        <LoadingState />
      ) : (
        <TaskBoard
          tasks={taskList}
          members={memberList}
          onEdit={handleOpenEdit}
          onDelete={deleteTask}
          onMove={moveTask}
        />
      )}

      <TaskFormModal
        isOpen={isFormOpen}
        editingTask={editingTask}
        members={memberList}
        isSaving={isSavingTask}
        saveError={saveTaskError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitTaskForm}
      />
    </div>
  );
};

export default TasksScreen;
