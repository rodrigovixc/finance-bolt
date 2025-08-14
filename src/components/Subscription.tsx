import { useState } from 'react';
import { createSubscription } from '../lib/mercadopago';
import { supabase } from '../lib/supabase';

export function Subscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await createSubscription(user.email || '');
      
      // Redireciona para a página de pagamento do Mercado Pago
      window.location.href = response.init_point;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      setError('Erro ao processar pagamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Plano Premium</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Benefícios do plano premium:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Acesso ilimitado a todos os recursos</li>
          <li>Suporte prioritário</li>
          <li>Backup automático dos dados</li>
          <li>Relatórios avançados</li>
        </ul>
      </div>
      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-900">R$ 18,90</p>
        <p className="text-gray-600">por mês</p>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Assinar Agora'}
      </button>
      {error && (
        <p className="mt-4 text-red-500 text-center">{error}</p>
      )}
    </div>
  );
} 