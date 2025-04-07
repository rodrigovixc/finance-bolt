import { supabase } from '../lib/supabase';

export async function checkRLS() {
  try {
    // Verificar se o RLS está habilitado nas tabelas
    const { data: cardsRLS, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .limit(1);

    const { data: categoriesRLS, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    const { data: incomeTypesRLS, error: incomeTypesError } = await supabase
      .from('income_types')
      .select('*')
      .limit(1);

    const { data: transactionsRLS, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    console.log('Status do RLS:');
    console.log('Cards:', cardsRLS ? 'RLS funcionando' : 'RLS não funcionando');
    console.log('Categories:', categoriesRLS ? 'RLS funcionando' : 'RLS não funcionando');
    console.log('Income Types:', incomeTypesRLS ? 'RLS funcionando' : 'RLS não funcionando');
    console.log('Transactions:', transactionsRLS ? 'RLS funcionando' : 'RLS não funcionando');

    // Verificar se os dados têm user_id
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (userId) {
      const { data: userCards } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

      const { data: userCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      const { data: userIncomeTypes } = await supabase
        .from('income_types')
        .select('*')
        .eq('user_id', userId);

      const { data: userTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      console.log('\nDados do usuário atual:');
      console.log('Cards:', userCards?.length || 0);
      console.log('Categories:', userCategories?.length || 0);
      console.log('Income Types:', userIncomeTypes?.length || 0);
      console.log('Transactions:', userTransactions?.length || 0);
    }
  } catch (error) {
    console.error('Erro ao verificar RLS:', error);
  }
} 