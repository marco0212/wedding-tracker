import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { budgetApi } from '../services/api';
import type { Budget, BudgetSummary } from '../types';
import Layout from '../components/Layout';

const defaultCategories = ['예식장', '스드메', '혼수', '신혼여행', '청첩장', '기타'];

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    itemName: '',
    budgetAmount: 0,
    actualAmount: 0,
    isPaid: false,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        budgetApi.getAll(),
        budgetApi.getSummary(),
      ]);
      setBudgets(budgetsRes.data);
      setSummary(summaryRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await budgetApi.update(editingId, formData);
      } else {
        await budgetApi.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      category: budget.category,
      itemName: budget.itemName,
      budgetAmount: budget.budgetAmount,
      actualAmount: budget.actualAmount,
      isPaid: budget.isPaid,
      notes: budget.notes || '',
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await budgetApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  const handlePaidToggle = async (id: number, isPaid: boolean) => {
    try {
      await budgetApi.update(id, { isPaid });
      await loadData();
    } catch (error) {
      console.error('Failed to update paid status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      itemName: '',
      budgetAmount: 0,
      actualAmount: 0,
      isPaid: false,
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">비용 관리</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            새 항목 추가
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">총 예산</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summary?.totalBudget.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">총 지출</h3>
            <p className="mt-2 text-2xl font-bold text-pink-600">
              {summary?.totalActual.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">잔여 예산</h3>
            <p className={`mt-2 text-2xl font-bold ${
              (summary?.totalBudget || 0) - (summary?.totalActual || 0) < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {((summary?.totalBudget || 0) - (summary?.totalActual || 0)).toLocaleString()}원
            </p>
          </div>
        </div>

        {summary && summary.byCategory.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">카테고리별 예산 vs 지출</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                  <Legend />
                  <Bar dataKey="budget" name="예산" fill="#f472b6" />
                  <Bar dataKey="actual" name="지출" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? '항목 수정' : '새 항목'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">카테고리</label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                  <datalist id="categories">
                    {defaultCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">항목명</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">예산 (원)</label>
                  <input
                    type="number"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({ ...formData, budgetAmount: Number(e.target.value) })}
                    min={0}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">실제 지출 (원)</label>
                  <input
                    type="number"
                    value={formData.actualAmount}
                    onChange={(e) => setFormData({ ...formData, actualAmount: Number(e.target.value) })}
                    min={0}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">메모</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="isPaid" className="text-sm text-gray-700">결제 완료</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  {editingId ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              등록된 비용 항목이 없습니다.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">항목</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">예산</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">지출</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">결제</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <tr key={budget.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {budget.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{budget.itemName}</div>
                      {budget.notes && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{budget.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {budget.budgetAmount.toLocaleString()}원
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      budget.actualAmount > budget.budgetAmount ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {budget.actualAmount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={budget.isPaid}
                        onChange={(e) => handlePaidToggle(budget.id, e.target.checked)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-pink-600 hover:text-pink-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
