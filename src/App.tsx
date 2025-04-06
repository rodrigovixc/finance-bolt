import { useState, useEffect } from 'react';
import { Card, Transaction, IncomeType } from './types';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { CardForm } from './components/CardForm';
import { CardList } from './components/CardList';
import { TransactionForm } from './components/TransactionForm';
import { IncomeTypeForm } from './components/IncomeTypeForm';
import { IncomeTypeList } from './components/IncomeTypeList';
import { Auth } from './components/Auth';
import { User } from '@supabase/supabase-js';
import { CreditCard, Receipt, LayoutDashboard, Wallet, DollarSign, Tag } from 'lucide-react';
import { UserMenu } from './components/UserMenu';
import { CategoryForm } from './components/CategoryForm';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'income-types' | 'transactions' | 'categories'>('dashboard');
  const [cards, setCards] = useState<Card[]>([]);
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error('Erro ao verificar sessão:', error);
      setLoading(false);
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadCards();
      loadIncomeTypes();
    }
  }, [user]);

  const loadCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar cartões:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      return;
    }

    setCards(data || []);
  };

  const loadIncomeTypes = async () => {
    const { data, error } = await supabase
      .from('income_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao carregar tipos de entrada:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      return;
    }

    setIncomeTypes(data || []);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao fazer logout:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Bolt Finance</span>
            </div>
            <div className="flex items-center">
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            data-testid="dashboard-tab"
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            data-testid="transactions-tab"
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Receipt className="w-5 h-5 mr-2" />
            Transações
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            data-testid="cards-tab"
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Wallet className="w-5 h-5 mr-2" />
            Cartões
          </button>
          <button
            onClick={() => setActiveTab('income-types')}
            data-testid="income-types-tab"
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'income-types'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Tipos de Receita
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            data-testid="categories-tab"
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-5 h-5 mr-2" />
            Categorias
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard />
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-6">
            <CardForm onSubmit={loadCards} />
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Meus Cartões</h2>
              <CardList cards={cards} onDelete={loadCards} />
            </div>
          </div>
        )}

        {activeTab === 'income-types' && (
          <div className="space-y-6">
            <IncomeTypeForm onSubmit={loadIncomeTypes} />
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Tipos de Entrada</h2>
              <IncomeTypeList incomeTypes={incomeTypes} onDelete={loadIncomeTypes} />
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <CategoryForm />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <TransactionForm cards={cards} incomeTypes={incomeTypes} onSubmit={loadCards} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
