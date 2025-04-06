export interface Card {
  id: string;
  bank: string;
  last_digits: string;
  created_at?: string;
  updated_at?: string;
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
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  card_id: string;
  income_type_id?: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  created_at?: string;
  updated_at?: string;
}