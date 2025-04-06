export interface Card {
  id: string;
  bank: string;
  last_digits: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  cardId: string;
  amount: number;
  date: string;
  description: string;
  totalInstallments: number;
  remainingInstallments: number;
}

export interface IncomeType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  card_id?: string;
  category_id?: string;
  income_type_id?: string;
  is_recurring?: boolean;
  recurrence_period?: string;
  recurrence_end_date?: string;
  installments?: {
    total: number;
    current: number;
  };
  created_at: string;
  updated_at: string;
}