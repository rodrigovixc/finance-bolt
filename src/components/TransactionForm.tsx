import { useState, useEffect } from 'react';
import { Card, IncomeType, Category, Transaction } from '../types';
import { supabase } from '../lib/supabase';
import { Receipt, CreditCard, DollarSign, Calendar, Type, Plus, X, FileText, Tag, Repeat } from 'lucide-react';
import { formatCurrency } from '../utils';

export function TransactionForm() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [cardId, setCardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [incomeTypeId, setIncomeTypeId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePeriod, setRecurrencePeriod] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [cardsResponse, categoriesResponse, incomeTypesResponse] = await Promise.all([
      supabase.from('cards').select('*').order('bank'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('income_types').select('*').order('name')
    ]);

    if (cardsResponse.data) setCards(cardsResponse.data);
    if (categoriesResponse.data) setCategories(categoriesResponse.data);
    if (incomeTypesResponse.data) setIncomeTypes(incomeTypesResponse.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const transactionsToCreate = [];
      const baseDate = new Date(date);
      const baseAmount = parseFloat(amount) / totalInstallments;

      for (let i = 0; i < totalInstallments; i++) {
        const transactionDate = new Date(baseDate);
        transactionDate.setMonth(transactionDate.getMonth() + i);

        const transactionData: {
          description: string;
          amount: number;
          date: string;
          type: 'income' | 'expense';
          card_id?: string;
          category_id: string | null;
          income_type_id: string | null;
          is_recurring: boolean;
          recurrence_period: string | null;
          recurrence_end_date: string | null;
          installments: {
            total: number;
            current: number;
          };
        } = {
          description: `${description} (${i + 1}/${totalInstallments})`,
          amount: baseAmount,
          date: transactionDate.toISOString().split('T')[0],
          type,
          category_id: categoryId || null,
          income_type_id: incomeTypeId || null,
          is_recurring: isRecurring,
          recurrence_period: recurrencePeriod || null,
          recurrence_end_date: recurrenceEndDate || null,
          installments: {
            total: totalInstallments,
            current: i + 1
          }
        };

        // Adiciona card_id apenas se for despesa e o campo estiver preenchido
        if (type === 'expense' && cardId) {
          transactionData.card_id = cardId;
        }

        transactionsToCreate.push(transactionData);
      }

      const { error } = await supabase
        .from('transactions')
        .insert(transactionsToCreate);

      if (error) throw error;

      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      setError('Erro ao salvar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate('');
    setType('expense');
    setCardId('');
    setCategoryId('');
    setIncomeTypeId('');
    setIsRecurring(false);
    setRecurrencePeriod('');
    setRecurrenceEndDate('');
    setTotalInstallments(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Registrar Transação</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Transação
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  type === 'expense'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  type === 'income'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Receita
              </button>
            </div>
          </div>

          {type === 'expense' ? (
            <>
              <div>
                <label htmlFor="card" className="block text-sm font-medium text-gray-700 mb-1">
                  Cartão
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="card"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um cartão</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.bank} (****{card.last_digits})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="totalInstallments" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Parcelas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Repeat className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="totalInstallments"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(Math.max(1, parseInt(e.target.value)))}
                    min="1"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Transação Recorrente
                </label>
              </div>

              {isRecurring && (
                <>
                  <div>
                    <label htmlFor="recurrencePeriod" className="block text-sm font-medium text-gray-700 mb-1">
                      Período de Recorrência
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Repeat className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="recurrencePeriod"
                        value={recurrencePeriod}
                        onChange={(e) => setRecurrencePeriod(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione o período</option>
                        <option value="monthly">Mensal</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="semiannual">Semestral</option>
                        <option value="annual">Anual</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data Final da Recorrência
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="recurrenceEndDate"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div>
              <label htmlFor="incomeType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Receita
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="incomeType"
                  value={incomeTypeId}
                  onChange={(e) => setIncomeTypeId(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um tipo</option>
                  {incomeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Ex: Supermercado, Salário..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="0,00"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Data da Primeira Parcela
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm">
            Transação cadastrada com sucesso!
          </div>
        )}

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar Transação'}
          </button>
        </div>
      </form>
    </div>
  );
} 
 