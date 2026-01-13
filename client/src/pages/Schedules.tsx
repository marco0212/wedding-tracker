import { useEffect, useState } from 'react';
import { scheduleApi } from '../services/api';
import type { Schedule } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types';
import Layout from '../components/Layout';

type ScheduleCategory = Schedule['category'];
type ScheduleStatus = Schedule['status'];

const categories: ScheduleCategory[] = ['venue', 'photo', 'dress', 'honeymoon', 'invitation', 'other'];
const statuses: ScheduleStatus[] = ['pending', 'in_progress', 'completed'];

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'venue' as ScheduleCategory,
    status: 'pending' as ScheduleStatus,
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await scheduleApi.getAll();
      setSchedules(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await scheduleApi.update(editingId, formData);
      } else {
        await scheduleApi.create(formData);
      }
      await loadSchedules();
      resetForm();
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setFormData({
      title: schedule.title,
      category: schedule.category,
      status: schedule.status,
      dueDate: schedule.dueDate || '',
      notes: schedule.notes || '',
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await scheduleApi.delete(id);
      await loadSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleStatusChange = async (id: number, status: ScheduleStatus) => {
    try {
      await scheduleApi.update(id, { status });
      await loadSchedules();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'venue',
      status: 'pending',
      dueDate: '',
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
          <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            새 일정 추가
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? '일정 수정' : '새 일정'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ScheduleCategory })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduleStatus })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">예정일</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">메모</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
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

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {schedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              등록된 일정이 없습니다.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예정일</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                      {schedule.notes && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{schedule.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {CATEGORY_LABELS[schedule.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={schedule.status}
                        onChange={(e) => handleStatusChange(schedule.id, e.target.value as ScheduleStatus)}
                        className={`text-xs px-2 py-1 rounded border-0 ${
                          schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                          schedule.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.dueDate ? new Date(schedule.dueDate).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="text-pink-600 hover:text-pink-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
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
