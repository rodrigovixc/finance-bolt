import { supabase } from '../lib/supabase';

export async function clearTransactions() {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .neq('id', ''); // Isso força a deleção de todas as transações do usuário atual

  if (error) {
    console.error('Erro ao limpar transações:', error);
    throw error;
  }

  return true;
} 