import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError('Erro ao fazer logout');
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        data-testid="user-menu"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <UserIcon className="h-6 w-6" />
        <span className="text-sm font-medium">{user.email}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          data-testid="user-menu-dropdown"
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
        >
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>

          <div className="px-4 py-2">
            {error && (
              <div className="text-red-600 text-sm mb-2">
                {error}
              </div>
            )}

            <button
              data-testid="user-menu-logout"
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{loading ? 'Saindo...' : 'Sair'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
 
 
 