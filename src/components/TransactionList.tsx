import { useState, useEffect } from 'react';
import { Transaction, Card, IncomeType, Category } from '../types';
import { supabase } from '../lib/supabase';
import { Trash2, Edit, DollarSign, Calendar, CreditCard, Tag } from 'lucide-react';
import { formatCurrency } from '../utils';

interface TransactionListProps {
  onDelete?: () => void;
}

export function TransactionList({ onDelete }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        { data: transactionsData, error: transactionsError },
        { data: cardsData, error: cardsError },
        { data: incomeTypesData, error: incomeTypesError },
        { data: categoriesData, error: categoriesError }
      ] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('cards').select('*'),
        supabase.from('income_types').select('*'),
        supabase.from('categories').select('*')
      ]);

      if (transactionsError) throw transactionsError;
      if (cardsError) throw cardsError;
      if (incomeTypesError) throw incomeTypesError;
      if (categoriesError) throw categoriesError;

      setTransactions(transactionsData || []);
      setCards(cardsData || []);
      setIncomeTypes(incomeTypesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      setError('Erro ao deletar transação');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cartão
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => {
            const card = cards.find(c => c.id === transaction.card_id);
            const category = categories.find(c => c.id === transaction.category_id);
            const incomeType = incomeTypes.find(i => i.id === transaction.income_type_id);

            return (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.description}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {card && (
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      {card.bank} (****{card.last_digits})
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {category && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      {category.name}
                    </div>
                  )}
                  {incomeType && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      {incomeType.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Excluir transação"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 