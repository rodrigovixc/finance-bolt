import { useEffect, useState } from 'react';
import { Card, Transaction, IncomeType, Category } from '../types';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  ComposedChart,
  Area,
  Legend
} from 'recharts';
import { Receipt, CreditCard, Calendar, Tag } from 'lucide-react';
import { formatCurrency } from '../utils';

interface DailyBalance {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}

interface InstallmentExpense {
  id: string;
  description: string;
  amount: number;
  remainingAmount: number;
  installments: {
    total: number;
    current: number;
  };
  remainingInstallments: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCard, setExpensesByCard] = useState<{ name: string; amount: number }[]>([]);
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [installmentExpenses, setInstallmentExpenses] = useState<InstallmentExpense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'expenses'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtém o usuário autenticado
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar cartões filtrados pelo usuário
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id);
      if (cardsError) {
        setLoading(false);
        return;
      }
      setCards(cardsData as Card[]);

      // Buscar categorias filtradas pelo usuário
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      if (categoriesError) {
        setLoading(false);
        return;
      }
      const categoriesMap = (categoriesData || []).reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {} as Record<string, Category>);
      setCategories(categoriesMap);

      // Buscar transações filtradas pelo usuário
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) {
        setLoading(false);
        return;
      }
      setTransactions(transactionsData as Transaction[]);

      // Calcular total de receitas e despesas
      let income = 0;
      let expenseSum = 0;
      (transactionsData as Transaction[]).forEach((transaction) => {
        if (transaction.type === 'income') {
          income += transaction.amount;
        } else {
          expenseSum += transaction.amount;
        }
      });
      setTotalIncome(income);
      setTotalExpenses(expenseSum);
      setBalance(income - expenseSum);

      // Agrupar despesas por cartão
      const cardExpenses = (transactionsData as Transaction[])
        .filter((t) => t.type === 'expense' && t.card_id)
        .reduce((acc: Record<string, number>, curr) => {
          const cardId = curr.card_id!;
          acc[cardId] = (acc[cardId] || 0) + curr.amount;
          return acc;
        }, {});

      const cardExpensesArray = Object.entries(cardExpenses)
        .map(([cardId, amount]) => {
          const card = cardsData?.find((c) => c.id === cardId);
          return {
            name: card ? `${card.bank} (${card.last_digits})` : 'Cartão não encontrado',
            amount
          };
        })
        .filter((expense) => expense.name !== 'Cartão não encontrado');
      setExpensesByCard(cardExpensesArray);

      // Calcular saldo diário
      const dailyBalancesMap = (transactionsData as Transaction[]).reduce(
        (acc: Record<string, { income: number; expense: number }>, curr) => {
          const dateStr = new Date(curr.date).toLocaleDateString('pt-BR');
          if (!acc[dateStr]) {
            acc[dateStr] = { income: 0, expense: 0 };
          }
          if (curr.type === 'income') {
            acc[dateStr].income += curr.amount;
          } else {
            acc[dateStr].expense += curr.amount;
          }
          return acc;
        },
        {}
      );

      const dailyBalancesArray = Object.entries(dailyBalancesMap)
        .map(([date, { income, expense }]) => ({
          date,
          income,
          expense,
          balance: income - expense
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDailyBalances(dailyBalancesArray);

      // Agrupar despesas por categoria
      const categoryExp = (transactionsData as Transaction[])
        .filter((t) => t.type === 'expense' && t.category_id)
        .reduce((acc: Record<string, number>, curr) => {
          const catId = curr.category_id!;
          acc[catId] = (acc[catId] || 0) + curr.amount;
          return acc;
        }, {});
      const totalCatExpenses = Object.values(categoryExp).reduce((sum, amt) => sum + amt, 0);
      const categoryExpensesArray = Object.entries(categoryExp).map(([catId, amount]) => ({
        category: categoriesMap[catId]?.name || 'Sem categoria',
        amount,
        percentage: (amount / totalCatExpenses) * 100
      }));
      setCategoryExpenses(categoryExpensesArray);

      // Agrupar despesas parceladas
      const installmentExpenses = (transactionsData as Transaction[])
        .filter((t) => t.type === 'expense' && t.installments)
        .map((t) => ({
          id: t.id,
          description: t.description,
          amount: t.amount * (t.installments?.total || 1),
          remainingAmount: t.amount * ((t.installments?.total || 1) - (t.installments?.current || 0)),
          installments: {
            total: t.installments?.total || 1,
            current: t.installments?.current || 1
          },
          remainingInstallments: (t.installments?.total || 1) - (t.installments?.current || 1)
        }));
      setInstallmentExpenses(installmentExpenses);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Saldo Total</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(balance)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total de Receitas</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total de Despesas</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {/* Abas para diferentes visualizações */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'expenses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Despesas
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de gastos por cartão */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos por Cartão</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCard}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {expensesByCard.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de gastos por categoria */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Entradas e Saídas</h3>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedMonth(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span className="font-medium">
                  {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedMonth(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de entradas e saídas do mês */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Entradas e Saídas do Mês</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Entradas',
                            value: transactions
                              .filter((t) => {
                                const dt = new Date(t.date);
                                return (
                                  dt.getMonth() === selectedMonth.getMonth() &&
                                  dt.getFullYear() === selectedMonth.getFullYear() &&
                                  t.type === 'income'
                                );
                              })
                              .reduce((sum, t) => sum + t.amount, 0)
                          },
                          {
                            name: 'Saídas',
                            value: transactions
                              .filter((t) => {
                                const dt = new Date(t.date);
                                return (
                                  dt.getMonth() === selectedMonth.getMonth() &&
                                  dt.getFullYear() === selectedMonth.getFullYear() &&
                                  t.type === 'expense'
                                );
                              })
                              .reduce((sum, t) => sum + t.amount, 0)
                          }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de saldo acumulado */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Saldo Acumulado</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={transactions
                        .filter((t) => {
                          const dt = new Date(t.date);
                          return (
                            dt.getMonth() === selectedMonth.getMonth() &&
                            dt.getFullYear() === selectedMonth.getFullYear()
                          );
                        })
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .reduce((acc: { date: string; balance: number }[], t) => {
                          const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
                          const newBalance = t.type === 'income' ? lastBalance + t.amount : lastBalance - t.amount;
                          acc.push({
                            date: new Date(t.date).toLocaleDateString('pt-BR'),
                            balance: newBalance
                          });
                          return acc;
                        }, [])}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="balance" stroke="#3B82F6" name="Saldo" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Histórico de Transações */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Transações</h3>
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
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category_id && categories[transaction.category_id]?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes por Categoria</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Porcentagem
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryExpenses.map((expense) => (
                      <tr key={expense.category}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas à Vista</h3>
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
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions
                      .filter(
                        (t) =>
                          t.type === 'expense' &&
                          (!t.installments || t.installments.total === 1)
                      )
                      .map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.category_id && categories[transaction.category_id]?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas Parceladas</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Restante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parcelas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parcelas Restantes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {installmentExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(expense.remainingAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.installments.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.remainingInstallments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
