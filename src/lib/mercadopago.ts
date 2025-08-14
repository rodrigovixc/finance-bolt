import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
});

export const createSubscription = async (userEmail: string) => {
  try {
    const preference = new Preference(client);
    
    const response = await preference.create({
      body: {
        items: [
          {
            title: 'Plano Premium - Bolt Finance',
            unit_price: 18.90,
            quantity: 1,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`,
        },
        auto_return: 'approved',
        notification_url: `${import.meta.env.VITE_API_URL}/api/webhook/mercadopago`,
        statement_descriptor: 'BOLT FINANCE',
      }
    });

    return response;
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    throw error;
  }
}; 