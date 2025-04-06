export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  card_id?: string
}

export interface Card {
  id: string
  bank: string
  last_digits: string
  name: string
  user_id: string
}

export interface IncomeType {
  id: string
  name: string
  description: string
  user_id: string
} 
 
 
 