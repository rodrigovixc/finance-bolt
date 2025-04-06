import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../types';
import { CreditCard, Trash2, Edit2 } from 'lucide-react';

export function CardForm() {
  const [bank, setBank] = useState('');
  const [lastDigits, setLastDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('bank');

    if (error) {
      console.error('Erro ao buscar cartões:', error);
      return;
    }

    setCards(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update({ bank, last_digits: lastDigits })
          .eq('id', editingCard.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cards')
          .insert([{ bank, last_digits: lastDigits }]);

        if (error) throw error;
      }

      setSuccess(true);
      resetForm();
      fetchCards();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      setError('Erro ao salvar cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return;

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir cartão:', error);
      return;
    }

    fetchCards();
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setBank(card.bank);
    setLastDigits(card.last_digits);
  };

  const resetForm = () => {
    setEditingCard(null);
    setBank('');
    setLastDigits('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Cartões</h2>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                Banco
              </label>
              <input
                type="text"
                id="bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
                placeholder="Ex: Nubank, Itaú..."
              />
            </div>

            <div>
              <label htmlFor="lastDigits" className="block text-sm font-medium text-gray-700 mb-2">
                Últimos 4 dígitos
              </label>
              <input
                type="text"
                id="lastDigits"
                value={lastDigits}
                onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
                maxLength={4}
                pattern="\d{4}"
                placeholder="0000"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Cartão {editingCard ? 'atualizado' : 'cadastrado'} com sucesso!
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : editingCard ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editingCard && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{card.bank}</h3>
                  <p className="text-sm text-gray-500">Final {card.last_digits}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}