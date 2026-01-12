import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { scheduleApi, budgetApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Schedule, BudgetSummary } from '../types';
import { STATUS_LABELS } from '../types';
import Layout from '../components/Layout';

const COLORS = ['#f472b6', '#fb923c', '#a78bfa', '#34d399', '#60a5fa', '#fbbf24'];

export default function Dashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      scheduleApi.getAll(),
      budgetApi.getSummary(),
    ]).then(([schedulesRes, summaryRes]) => {
      setSchedules(schedulesRes.data);
      setBudgetSummary(summaryRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const statusCounts = {
    pending: schedules.filter((s) => s.status === 'pending').length,
    in_progress: schedules.filter((s) => s.status === 'in_progress').length,
    completed: schedules.filter((s) => s.status === 'completed').length,
  };

  const completionRate = schedules.length > 0
    ? Math.round((statusCounts.completed / schedules.length) * 100)
    : 0;

  const upcomingSchedules = schedules
    .filter((s) => s.status !== 'completed' && s.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {user?.name}님!
          </h1>
          <p className="text-gray-600">결혼 준비 현황을 확인하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">전체 진행률</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold text-pink-600">{completionRate}%</span>
              <span className="text-gray-500 text-sm mb-1">
                ({statusCounts.completed}/{schedules.length})
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-600 h-2 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">예산 현황</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {budgetSummary?.totalActual.toLocaleString()}원
              </span>
              <span className="text-gray-500 text-sm ml-2">
                / {budgetSummary?.totalBudget.toLocaleString()}원
              </span>
            </div>
            <div className="mt-2 text-sm">
              {budgetSummary && budgetSummary.totalBudget > 0 && (
                <span className={budgetSummary.totalActual > budgetSummary.totalBudget ? 'text-red-600' : 'text-green-600'}>
                  {budgetSummary.totalActual > budgetSummary.totalBudget ? '예산 초과' : '예산 내'}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">일정 현황</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{STATUS_LABELS.pending}</span>
                <span className="font-medium">{statusCounts.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{STATUS_LABELS.in_progress}</span>
                <span className="font-medium">{statusCounts.in_progress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{STATUS_LABELS.completed}</span>
                <span className="font-medium">{statusCounts.completed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">다가오는 일정</h2>
              <Link to="/schedules" className="text-sm text-pink-600 hover:text-pink-500">
                전체 보기
              </Link>
            </div>
            {upcomingSchedules.length === 0 ? (
              <p className="text-gray-500 text-sm">예정된 일정이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <li key={schedule.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{schedule.title}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        schedule.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {STATUS_LABELS[schedule.status]}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(schedule.dueDate!).toLocaleDateString('ko-KR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">카테고리별 비용</h2>
              <Link to="/budgets" className="text-sm text-pink-600 hover:text-pink-500">
                전체 보기
              </Link>
            </div>
            {budgetSummary && budgetSummary.byCategory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetSummary.byCategory}
                      dataKey="actual"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {budgetSummary.byCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">등록된 비용이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
