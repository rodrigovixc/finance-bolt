import { CreditCard, Trash2 } from 'lucide-react';
import { Card } from '../types';
import { supabase } from '../lib/supabase';

interface CardListProps {
  cards: Card[];
  onDelete: (id: string) => void;
}

export function CardList({ cards, onDelete }: CardListProps) {
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (!error) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-medium">{card.bank}</h3>
              <p className="text-sm text-gray-500">Final {card.last_digits}</p>
            </div>
          </div>
          <button
            onClick={() => handleDelete(card.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
} 
 
 
 