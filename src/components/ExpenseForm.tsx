import React, { useState } from 'react';
import { Receipt, CreditCard } from 'lucide-react';
import { Card } from '../types';

interface ExpenseFormProps {
  cards: Card[];
  onSubmit: (expense: {
    cardId: string;
    amount: number;
    date: string;
    description: string;
    totalInstallments: number;
    remainingInstallments: number;
  }) => void;
}

export function ExpenseForm({ cards, onSubmit }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    cardId: '',
    amount: '',
    date: '',
    description: '',
    totalInstallments: '1',
    remainingInstallments: '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      totalInstallments: Number(formData.totalInstallments),
      remainingInstallments: Number(formData.remainingInstallments),
    });
    setFormData({
      cardId: '',
      amount: '',
      date: '',
      description: '',
      totalInstallments: '1',
      remainingInstallments: '1',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Receipt className="w-5 h-5" />
        Registrar Gasto
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cartão</label>
        <select
          name="cardId"
          value={formData.cardId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Selecione um cartão</option>
          {cards.map(card => (
            <option key={card.id} value={card.id}>
              {card.bank} (**** {card.lastDigits})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Valor</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Total de Parcelas</label>
          <input
            type="number"
            name="totalInstallments"
            value={formData.totalInstallments}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Parcelas Restantes</label>
          <input
            type="number"
            name="remainingInstallments"
            value={formData.remainingInstallments}
            onChange={handleChange}
            min="1"
            max={formData.totalInstallments}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Registrar Gasto
      </button>
    </form>
  );
}