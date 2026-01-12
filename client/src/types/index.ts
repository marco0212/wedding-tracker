export interface User {
  id: number;
  email: string;
  name: string;
  weddingDate?: string;
  createdAt: string;
}

export interface Schedule {
  id: number;
  userId: number;
  title: string;
  category: 'venue' | 'photo' | 'dress' | 'honeymoon' | 'invitation' | 'other';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: number;
  userId: number;
  category: string;
  itemName: string;
  budgetAmount: number;
  actualAmount: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BudgetSummary {
  totalBudget: number;
  totalActual: number;
  byCategory: {
    category: string;
    budget: number;
    actual: number;
  }[];
}

export const CATEGORY_LABELS: Record<Schedule['category'], string> = {
  venue: '예식장',
  photo: '스드메',
  dress: '드레스',
  honeymoon: '신혼여행',
  invitation: '청첩장',
  other: '기타',
};

export const STATUS_LABELS: Record<Schedule['status'], string> = {
  pending: '예정',
  in_progress: '진행중',
  completed: '완료',
};
