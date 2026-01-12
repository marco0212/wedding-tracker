import axios from 'axios';
import type { User, Schedule, Budget, AuthResponse, BudgetSummary } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

export const scheduleApi = {
  getAll: () => api.get<Schedule[]>('/schedules'),
  create: (data: Omit<Schedule, 'id' | 'userId' | 'createdAt'>) =>
    api.post<Schedule>('/schedules', data),
  update: (id: number, data: Partial<Schedule>) =>
    api.put<Schedule>(`/schedules/${id}`, data),
  delete: (id: number) => api.delete(`/schedules/${id}`),
};

export const budgetApi = {
  getAll: () => api.get<Budget[]>('/budgets'),
  create: (data: Omit<Budget, 'id' | 'userId' | 'createdAt'>) =>
    api.post<Budget>('/budgets', data),
  update: (id: number, data: Partial<Budget>) =>
    api.put<Budget>(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
  getSummary: () => api.get<BudgetSummary>('/budgets/summary'),
};

export default api;
