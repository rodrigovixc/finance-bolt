import { IncomeType } from '../types';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface IncomeTypeListProps {
  incomeTypes: IncomeType[];
  onDelete: (id: string) => void;
}

export function IncomeTypeList({ incomeTypes, onDelete }: IncomeTypeListProps) {
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('income_types')
      .delete()
      .eq('id', id);

    if (!error) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {incomeTypes.map((type) => (
        <div
          key={type.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="font-medium">{type.name}</h3>
            {type.description && (
              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
            )}
          </div>
          <button
            onClick={() => handleDelete(type.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
} 
 
 
 