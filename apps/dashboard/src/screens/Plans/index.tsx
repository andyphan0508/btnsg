import { useEffect, useMemo, useState } from 'react';
import type { Plan } from '@btnsg/shared';
import { planApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import PlanFormModal, { type PlanFormValues } from './components/PlanFormModal';
import PlanList from './components/PlanList';

const parsePlanItems = (itemsText: string, existingPlan: Plan | null) => {
  const existingByText = new Map((existingPlan?.items ?? []).map((item) => [item.text, item]));
  return itemsText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((text) => {
      const existing = existingByText.get(text);
      return { id: existing?.id ?? crypto.randomUUID(), text, done: existing?.done ?? false };
    });
};

const PlansScreen = () => {
  // 1. State declarations
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);
  const [planListError, setPlanListError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [savePlanError, setSavePlanError] = useState<string | null>(null);

  // 2. Logic functions
  const validatePlanForm = (values: PlanFormValues): boolean => {
    if (!values.title.trim()) return false;
    return true;
  };

  const sortedPlans = useMemo(() => {
    const statusOrder: Record<Plan['status'], number> = { active: 0, draft: 1, done: 2 };
    return [...planList].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [planList]);

  // 3. API call functions
  const fetchPlanList = async (): Promise<boolean> => {
    try {
      setIsLoadingPlans(true);
      const data = await planApi.getList();
      setPlanList(data);
      return true;
    } catch (error) {
      setPlanListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const submitPlanForm = async (values: PlanFormValues): Promise<boolean> => {
    if (!validatePlanForm(values)) {
      setSavePlanError('Vui lòng nhập tên kế hoạch.');
      return false;
    }

    try {
      setIsSavingPlan(true);
      setSavePlanError(null);
      const payload = {
        title: values.title,
        goal: values.goal || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        status: values.status,
        items: parsePlanItems(values.itemsText, editingPlan),
      };
      if (editingPlan) {
        await planApi.update(editingPlan.id, payload);
      } else {
        await planApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchPlanList();
      return true;
    } catch (error) {
      setSavePlanError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingPlan(false);
    }
  };

  const togglePlanItem = async (plan: Plan, itemId: string): Promise<boolean> => {
    try {
      const updatedItems = plan.items.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      );
      await planApi.update(plan.id, { items: updatedItems });
      await fetchPlanList();
      return true;
    } catch (error) {
      setPlanListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const deletePlan = async (plan: Plan): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá kế hoạch "${plan.title}"?`);
    if (!confirmed) return false;

    try {
      await planApi.remove(plan.id);
      await fetchPlanList();
      return true;
    } catch (error) {
      setPlanListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchPlanList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setSavePlanError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setSavePlanError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Định hướng</span>
          <h2>Lên kế hoạch</h2>
          <p className="page-sub">Theo dõi tiến độ các chương trình và mục tiêu của Ban.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Kế hoạch mới
        </button>
      </div>

      {planListError && <div className="form-error" style={{ marginBottom: 14 }}>{planListError}</div>}
      {isLoadingPlans && planList.length === 0 ? (
        <LoadingState />
      ) : (
        <PlanList plans={sortedPlans} onEdit={handleOpenEdit} onDelete={deletePlan} onToggleItem={togglePlanItem} />
      )}

      <PlanFormModal
        isOpen={isFormOpen}
        editingPlan={editingPlan}
        isSaving={isSavingPlan}
        saveError={savePlanError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitPlanForm}
      />
    </div>
  );
};

export default PlansScreen;
