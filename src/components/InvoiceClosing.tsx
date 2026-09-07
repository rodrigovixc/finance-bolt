import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Category, Transaction } from '../types';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Download, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import {
  Period,
  cardCycle,
  currentMonth,
  diffInDays,
  formatCurrency,
  formatISODate,
  lastDays,
  precedingPeriod,
  previousMonth
} from '../utils';

interface InvoiceClosingProps {
  cards: Card[];
}

interface Breakdown {
  key: string;
  label: string;
  color?: string;
  amount: number;
  previousAmount: number;
  count: number;
  percentage: number;
}

type CardFilter = 'all' | 'none' | string;
type CategoryFilter = 'all' | 'none' | string;
type TypeFilter = 'all' | 'expense' | 'income';

const SEM_CATEGORIA = 'sem-categoria';

/** Compara ignorando acentos e caixa, para "alimentacao" achar "Alimentação". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function variation(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function VariationBadge({ current, previous }: { current: number; previous: number }) {
  const delta = variation(current, previous);

  if (delta === null) {
    return <span className="text-xs text-gray-500">novo no período</span>;
  }

  if (Math.abs(delta) < 0.5) {
    return <span className="text-xs text-gray-500">estável</span>;
  }

  const worse = delta > 0;
  const Icon = worse ? TrendingUp : TrendingDown;

  return (
    <span className={`inline-flex items-center text-xs font-medium ${worse ? 'text-red-600' : 'text-green-600'}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {worse ? '+' : ''}
      {delta.toFixed(1)}%
    </span>
  );
}

export function InvoiceClosing({ cards }: InvoiceClosingProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>(() => currentMonth());
  const [cardFilter, setCardFilter] = useState<CardFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});

  const comparison = useMemo(() => precedingPeriod(period), [period]);

  useEffect(() => {
    let cancelled = false;

    const fetchPeriod = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Usuário não autenticado');

        const [categoriesResult, transactionsResult] = await Promise.all([
          supabase.from('categories').select('*').eq('user_id', user.id),
          supabase
            .from('transactions')
            .select('*')
            // Busca também o período anterior para permitir a comparação.
            .gte('date', comparison.start)
            .lte('date', period.end)
            .eq('user_id', user.id)
            .order('date', { ascending: false })
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (transactionsResult.error) throw transactionsResult.error;
        if (cancelled) return;

        setCategories(
          (categoriesResult.data || []).reduce((acc, category) => {
            acc[category.id] = category;
            return acc;
          }, {} as Record<string, Category>)
        );
        setTransactions((transactionsResult.data || []) as Transaction[]);
      } catch (err) {
        console.error('Erro ao carregar fechamento:', err);
        if (!cancelled) setError('Não foi possível carregar o fechamento do período.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (period.start <= period.end) fetchPeriod();

    return () => {
      cancelled = true;
    };
  }, [period, comparison]);

  const matchesFilters = useMemo(() => {
    const term = normalize(search);

    return (transaction: Transaction) => {
      if (cardFilter === 'none' && transaction.card_id) return false;
      if (cardFilter !== 'all' && cardFilter !== 'none' && transaction.card_id !== cardFilter) return false;

      if (categoryFilter === 'none' && transaction.category_id) return false;
      if (categoryFilter !== 'all' && categoryFilter !== 'none' && transaction.category_id !== categoryFilter) {
        return false;
      }

      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;

      if (term) {
        // A busca cobre descrição e nome da categoria, então digitar
        // "alimentação" encontra os lançamentos daquela categoria.
        const categoryName = transaction.category_id ? categories[transaction.category_id]?.name || '' : '';
        if (!normalize(`${transaction.description} ${categoryName}`).includes(term)) return false;
      }

      return true;
    };
  }, [cardFilter, categoryFilter, typeFilter, search, categories]);

  const inPeriod = useMemo(
    () => transactions.filter((t) => t.date >= period.start && t.date <= period.end && matchesFilters(t)),
    [transactions, period, matchesFilters]
  );

  const inComparison = useMemo(
    () => transactions.filter((t) => t.date >= comparison.start && t.date <= comparison.end && matchesFilters(t)),
    [transactions, comparison, matchesFilters]
  );

  const categoryOptions = useMemo(
    () => Object.values(categories).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories]
  );

  const hasActiveFilters = cardFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all' || search !== '';

  const clearFilters = () => {
    setCardFilter('all');
    setCategoryFilter('all');
    setTypeFilter('all');
    setSearch('');
  };

  const totals = useMemo(() => {
    const sum = (list: Transaction[], type: 'income' | 'expense') =>
      list.filter((t) => t.type === type).reduce((acc, t) => acc + Number(t.amount), 0);

    const income = sum(inPeriod, 'income');
    const expenses = sum(inPeriod, 'expense');

    return {
      income,
      expenses,
      balance: income - expenses,
      count: inPeriod.length,
      previousIncome: sum(inComparison, 'income'),
      previousExpenses: sum(inComparison, 'expense')
    };
  }, [inPeriod, inComparison]);

  const buildBreakdown = useCallback((
    resolve: (t: Transaction) => { key: string; label: string; color?: string } | null
  ): Breakdown[] => {
    const accumulate = (list: Transaction[]) =>
      list
        .filter((t) => t.type === 'expense')
        .reduce((acc: Record<string, { amount: number; count: number; label: string; color?: string }>, t) => {
          const resolved = resolve(t);
          if (!resolved) return acc;
          const entry = acc[resolved.key] || { amount: 0, count: 0, label: resolved.label, color: resolved.color };
          entry.amount += Number(t.amount);
          entry.count += 1;
          acc[resolved.key] = entry;
          return acc;
        }, {});

    const current = accumulate(inPeriod);
    const previous = accumulate(inComparison);
    const total = Object.values(current).reduce((acc, entry) => acc + entry.amount, 0);

    return Object.entries(current)
      .map(([key, entry]) => ({
        key,
        label: entry.label,
        color: entry.color,
        amount: entry.amount,
        previousAmount: previous[key]?.amount || 0,
        count: entry.count,
        percentage: total > 0 ? (entry.amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [inPeriod, inComparison]);

  const byCategory = useMemo(
    () =>
      buildBreakdown((t) => {
        const category = t.category_id ? categories[t.category_id] : undefined;
        return {
          key: t.category_id || SEM_CATEGORIA,
          label: category?.name || 'Sem categoria',
          color: category?.color
        };
      }),
    [buildBreakdown, categories]
  );

  const byCard = useMemo(
    () =>
      buildBreakdown((t) => {
        if (!t.card_id) return { key: 'sem-cartao', label: 'Sem cartão / dinheiro' };
        const card = cards.find((c) => c.id === t.card_id);
        return { key: t.card_id, label: card ? `${card.bank} (${card.last_digits})` : 'Cartão removido' };
      }),
    [buildBreakdown, cards]
  );

  const biggestExpenses = useMemo(
    () =>
      inPeriod
        .filter((t) => t.type === 'expense')
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10),
    [inPeriod]
  );

  // Gargalos: categorias que concentram gasto (>=15% do total) ou que cresceram
  // mais de 25% em relação ao período anterior.
  const bottlenecks = useMemo(
    () =>
      byCategory.filter((entry) => {
        const delta = variation(entry.amount, entry.previousAmount);
        return entry.percentage >= 15 || (delta !== null && delta >= 25) || (delta === null && entry.percentage >= 10);
      }),
    [byCategory]
  );

  const days = period.start <= period.end ? diffInDays(period.start, period.end) : 0;

  const exportCsv = () => {
    const rows = [
      ['Data', 'Descrição', 'Tipo', 'Categoria', 'Cartão', 'Valor'],
      ...inPeriod.map((t) => {
        const card = cards.find((c) => c.id === t.card_id);
        return [
          formatISODate(t.date),
          t.description,
          t.type === 'income' ? 'Receita' : 'Despesa',
          (t.category_id && categories[t.category_id]?.name) || '',
          card ? `${card.bank} (${card.last_digits})` : '',
          Number(t.amount).toFixed(2).replace('.', ',')
        ];
      })
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `fechamento_${period.start}_a_${period.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const presetClass = 'px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div className="space-y-6">
      {/* Seleção do período */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="closing-start" className="block text-sm font-medium text-gray-700 mb-1">
              Data inicial
            </label>
            <input
              id="closing-start"
              data-testid="closing-start"
              type="date"
              value={period.start}
              onChange={(e) => setPeriod((prev) => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="closing-end" className="block text-sm font-medium text-gray-700 mb-1">
              Data final
            </label>
            <input
              id="closing-end"
              data-testid="closing-end"
              type="date"
              value={period.end}
              onChange={(e) => setPeriod((prev) => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="closing-card" className="block text-sm font-medium text-gray-700 mb-1">
              Cartão
            </label>
            <select
              id="closing-card"
              data-testid="closing-card"
              value={cardFilter}
              onChange={(e) => setCardFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="none">Sem cartão / dinheiro</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.bank} ({card.last_digits})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="closing-category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="closing-category"
              data-testid="closing-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="none">Sem categoria</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="closing-type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="closing-type"
              data-testid="closing-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tudo</option>
              <option value="expense">Só despesas</option>
              <option value="income">Só receitas</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="closing-search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="closing-search"
                data-testid="closing-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Descrição ou categoria..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={exportCsv}
            disabled={inPeriod.length === 0}
            className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className={presetClass} onClick={() => setPeriod(currentMonth())}>
            Mês atual
          </button>
          <button className={presetClass} onClick={() => setPeriod(previousMonth())}>
            Mês anterior
          </button>
          <button className={presetClass} onClick={() => setPeriod(lastDays(30))}>
            Últimos 30 dias
          </button>
          <button className={presetClass} onClick={() => setPeriod(lastDays(90))}>
            Últimos 90 dias
          </button>
          {cards
            .filter((card) => typeof card.due_date === 'number')
            .map((card) => (
              <button key={card.id} className={presetClass} onClick={() => setPeriod(cardCycle(card.due_date!))}>
                Fatura {card.bank} (venc. {card.due_date})
              </button>
            ))}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2" data-testid="closing-active-filters">
            <span className="text-sm text-gray-500">Filtros ativos:</span>
            {categoryFilter !== 'all' && (
              <button
                onClick={() => setCategoryFilter('all')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {categoryFilter === 'none' ? 'Sem categoria' : categories[categoryFilter]?.name || 'Categoria'}
                <X className="w-3 h-3" />
              </button>
            )}
            {cardFilter !== 'all' && (
              <button
                onClick={() => setCardFilter('all')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {cardFilter === 'none'
                  ? 'Sem cartão'
                  : (() => {
                      const card = cards.find((c) => c.id === cardFilter);
                      return card ? `${card.bank} (${card.last_digits})` : 'Cartão';
                    })()}
                <X className="w-3 h-3" />
              </button>
            )}
            {typeFilter !== 'all' && (
              <button
                onClick={() => setTypeFilter('all')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {typeFilter === 'expense' ? 'Só despesas' : 'Só receitas'}
                <X className="w-3 h-3" />
              </button>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                "{search}"
                <X className="w-3 h-3" />
              </button>
            )}
            <button onClick={clearFilters} className="text-xs text-gray-500 underline hover:text-gray-700">
              limpar tudo
            </button>
          </div>
        )}

        {period.start > period.end ? (
          <p className="text-sm text-red-600">A data inicial precisa ser anterior à data final.</p>
        ) : (
          <p className="text-sm text-gray-500">
            {formatISODate(period.start)} a {formatISODate(period.end)} · {days} dia{days === 1 ? '' : 's'} ·
            comparando com {formatISODate(comparison.start)} a {formatISODate(comparison.end)}
          </p>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Resumo do fechamento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total de Despesas</h3>
              <p className="mt-2 text-3xl font-bold text-red-600" data-testid="closing-expenses">
                {formatCurrency(totals.expenses)}
              </p>
              <div className="mt-1">
                <VariationBadge current={totals.expenses} previous={totals.previousExpenses} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total de Receitas</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
              <div className="mt-1">
                <VariationBadge current={totals.income} previous={totals.previousIncome} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Saldo do Período</h3>
              <p
                className={`mt-2 text-3xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                data-testid="closing-balance"
              >
                {formatCurrency(totals.balance)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Lançamentos</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totals.count}</p>
              <p className="mt-1 text-xs text-gray-500">
                média de {formatCurrency(days > 0 ? totals.expenses / days : 0)}/dia em despesas
              </p>
            </div>
          </div>

          {/* Gargalos identificados */}
          {categoryFilter === 'all' && bottlenecks.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Gargalos do período</h3>
              </div>
              <div className="space-y-3">
                {bottlenecks.map((entry) => {
                  const delta = variation(entry.amount, entry.previousAmount);
                  return (
                    <div key={entry.key} className="flex items-start justify-between border-l-4 border-amber-400 pl-4">
                      <div>
                        <p className="font-medium text-gray-900">{entry.label}</p>
                        <p className="text-sm text-gray-600">
                          {entry.percentage.toFixed(1)}% das despesas do período
                          {delta !== null && delta >= 25 && ` · cresceu ${delta.toFixed(1)}% vs. período anterior`}
                          {delta === null && ' · não existia no período anterior'}
                        </p>
                      </div>
                      <p className="font-semibold text-red-600 whitespace-nowrap">{formatCurrency(entry.amount)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Despesas por categoria */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Despesas por categoria</h3>
              {categoryFilter === 'all' && byCategory.length > 1 && (
                <span className="text-xs text-gray-500">clique numa categoria para ver os lançamentos</span>
              )}
            </div>
            {byCategory.length === 0 ? (
              <p className="text-gray-500">
                Nenhuma despesa {hasActiveFilters ? 'para os filtros aplicados' : 'no período selecionado'}.
              </p>
            ) : (
              <div className="space-y-4">
                {byCategory.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => {
                      const target = entry.key === SEM_CATEGORIA ? 'none' : entry.key;
                      setCategoryFilter((prev) => (prev === target ? 'all' : target));
                    }}
                    title={`Ver os lançamentos de ${entry.label}`}
                    className="w-full text-left rounded-md p-2 -m-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-gray-900">
                        {entry.label}
                        <span className="ml-2 text-xs text-gray-500">
                          {entry.count} lançamento{entry.count === 1 ? '' : 's'}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <VariationBadge current={entry.amount} previous={entry.previousAmount} />
                        <span className="font-semibold text-gray-900">{formatCurrency(entry.amount)}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor: entry.color || '#3B82F6'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{entry.percentage.toFixed(1)}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Despesas por cartão */}
          {cardFilter === 'all' && byCard.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas por cartão</h3>
              <div className="space-y-2">
                {byCard.map((entry) => (
                  <div key={entry.key} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-900">{entry.label}</span>
                    <span className="flex items-center gap-3">
                      <VariationBadge current={entry.amount} previous={entry.previousAmount} />
                      <span className="font-semibold text-gray-900">{formatCurrency(entry.amount)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maiores despesas */}
          {biggestExpenses.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Maiores despesas do período</h3>
              <div className="space-y-2">
                {biggestExpenses.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatISODate(transaction.date)}
                        {transaction.category_id && categories[transaction.category_id]
                          ? ` · ${categories[transaction.category_id].name}`
                          : ''}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600 whitespace-nowrap">
                      {formatCurrency(Number(transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lançamentos do período */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lançamentos do período ({inPeriod.length})</h3>
            {inPeriod.length === 0 ? (
              <p className="text-gray-500">
                Nenhum lançamento {hasActiveFilters ? 'para os filtros aplicados' : 'no período selecionado'}.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cartão</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inPeriod.map((transaction) => {
                      const card = cards.find((c) => c.id === transaction.card_id);
                      return (
                        <tr key={transaction.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                            {formatISODate(transaction.date)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{transaction.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {(transaction.category_id && categories[transaction.category_id]?.name) || '—'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {card ? `${card.bank} (${card.last_digits})` : '—'}
                          </td>
                          <td
                            className={`px-4 py-2 whitespace-nowrap text-sm text-right font-medium ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
