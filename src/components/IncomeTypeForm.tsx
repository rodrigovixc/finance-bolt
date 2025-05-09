import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { IncomeType } from '../types';

interface IncomeTypeFormProps {
  onSubmit: () => void;
}

export function IncomeTypeForm({ onSubmit }: IncomeTypeFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Obtém o usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Dados para inserção, incluindo o user_id para atender à política RLS
      const incomeTypeData = {
        name,
        description,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('income_types')
        .insert([incomeTypeData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
        throw error;
      }

      setName('');
      setDescription('');
      onSubmit();
    } catch (error) {
      console.error('Erro ao cadastrar tipo de receita:', error);
      setError('Erro ao cadastrar tipo de receita. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Cadastrar Tipo de Entrada</h2>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Salário, Freelance..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Salário mensal da empresa X..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar Tipo de Entrada'}
      </button>
    </form>
  );
}
