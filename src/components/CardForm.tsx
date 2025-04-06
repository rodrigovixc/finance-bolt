import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card } from '../types';
import { supabase } from '../lib/supabase';

interface CardFormProps {
  onSubmit: (card: Omit<Card, 'id'>) => void;
}

export function CardForm({ onSubmit }: CardFormProps) {
  const [bank, setBank] = useState('');
  const [lastDigits, setLastDigits] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{ bank, last_digits: lastDigits }])
        .select()
        .single();

      if (error) throw error;

      onSubmit({ bank, lastDigits });
      setBank('');
      setLastDigits('');
    } catch (error) {
      console.error('Erro ao cadastrar cartão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Cadastrar Novo Cartão</h2>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Banco
        </label>
        <input
          type="text"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="Ex: Nubank, Itaú..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Últimos 4 dígitos
        </label>
        <input
          type="text"
          value={lastDigits}
          onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="0000"
          maxLength={4}
          pattern="\d{4}"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar Cartão'}
      </button>
    </form>
  );
}