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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('income_types')
        .insert([{ name, description }]);

      if (error) throw error;

      setName('');
      setDescription('');
      onSubmit();
    } catch (error) {
      console.error('Erro ao cadastrar tipo de entrada:', error);
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
        <label className="block text-sm font-medium text-gray-700">
          Nome
        </label>
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
        <label className="block text-sm font-medium text-gray-700">
          Descrição (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Salário mensal da empresa X..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

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