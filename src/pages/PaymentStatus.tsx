import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');

  useEffect(() => {
    const updateUserSubscription = async () => {
      if (status === 'approved') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: user.id,
              status: 'active',
              plan: 'premium',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
      }
    };

    updateUserSubscription();
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        {status === 'approved' ? (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Pagamento Aprovado!</h2>
            <p className="text-gray-700 mb-4">
              Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos premium.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Ir para o Dashboard
            </button>
          </>
        ) : status === 'pending' ? (
          <>
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Pagamento Pendente</h2>
            <p className="text-gray-700 mb-4">
              Seu pagamento está sendo processado. Assim que for confirmado, sua assinatura será ativada.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Voltar para o Dashboard
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Pagamento Não Aprovado</h2>
            <p className="text-gray-700 mb-4">
              Ocorreu um problema com seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
} 