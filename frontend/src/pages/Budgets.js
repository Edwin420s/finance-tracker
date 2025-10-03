import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { budgetsAPI } from '../api/budgets';
import BudgetForm from '../components/Budgets/BudgetForm';
import toast from 'react-hot-toast';

const Budgets = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const { data, isLoading, isError } = useQuery(['budgets'], async () => {
    const res = await budgetsAPI.getBudgets();
    return res.data?.data || [];
  });

  const createMutation = useMutation(budgetsAPI.createBudget, {
    onSuccess: () => {
      toast.success('Budget created');
      setShowForm(false);
      queryClient.invalidateQueries(['budgets']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create budget'),
  });

  const updateMutation = useMutation(({ id, payload }) => budgetsAPI.updateBudget(id, payload), {
    onSuccess: () => {
      toast.success('Budget updated');
      setEditingBudget(null);
      setShowForm(false);
      queryClient.invalidateQueries(['budgets']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update budget'),
  });

  const deleteMutation = useMutation(budgetsAPI.deleteBudget, {
    onSuccess: () => {
      toast.success('Budget deleted');
      queryClient.invalidateQueries(['budgets']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete budget'),
  });

  const onSubmit = (values) => {
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget._id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  if (isLoading) return <div className="p-6 text-text-primary">Loading budgets...</div>;
  if (isError) return <div className="p-6 text-accent-error">Failed to load budgets</div>;

  const budgets = data || [];

  return (
    <div className="p-6 text-text-primary">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <button
          onClick={() => { setEditingBudget(null); setShowForm(true); }}
          className="px-4 py-2 rounded-md bg-accent-primary text-white hover:opacity-90"
        >
          + New Budget
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-primary-medium border border-border-color rounded-lg p-4">
          <BudgetForm
            defaultValues={editingBudget || undefined}
            onCancel={() => { setEditingBudget(null); setShowForm(false); }}
            onSubmit={onSubmit}
            loading={createMutation.isLoading || updateMutation.isLoading}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const percent = Math.min(100, Math.round(((b.spent || 0) / b.amount) * 100));
          const barColor = percent < 70 ? 'bg-green-500' : percent < 100 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={b._id} className="bg-primary-medium border border-border-color rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{b.name || b.category || 'Budget'}</h3>
                  <p className="text-text-secondary text-sm">{b.period || 'monthly'}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary">Limit</div>
                  <div className="text-xl font-semibold">${b.amount?.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-secondary">Spent</span>
                  <span className="font-medium">${(b.spent || 0).toLocaleString()} • {percent}%</span>
                </div>
                <div className="w-full h-2 bg-primary-light rounded">
                  <div className={`h-2 ${barColor} rounded`} style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => { setEditingBudget(b); setShowForm(true); }}
                  className="px-3 py-1.5 rounded-md border border-border-color hover:bg-primary-light"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(b._id)}
                  className="px-3 py-1.5 rounded-md border border-red-500 text-red-400 hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!budgets.length && (
        <div className="p-8 text-center border border-dashed border-border-color rounded-lg mt-4">
          <p className="text-text-secondary">No budgets yet. Create your first budget to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Budgets;
