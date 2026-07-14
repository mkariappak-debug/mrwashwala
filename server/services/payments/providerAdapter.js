const pendingProvider = {
  name: 'PENDING_PROVIDER_SETUP',
  async createCheckoutSession({ merchantOrderId }) {
    return {
      providerConfigured: false,
      providerName: this.name,
      gatewayOrderId: '',
      checkoutUrl: '',
      publicKey: '',
      notes: {
        merchantOrderId,
        message: 'Payment provider integration is pending. Architecture is ready.',
      },
    };
  },
  async verifyClientCallback() {
    return {
      providerConfigured: false,
      verified: false,
      reason: 'Payment provider integration is pending.',
    };
  },
  async parseWebhook({ provider, eventId, eventType, payload }) {
    return {
      providerConfigured: false,
      provider: provider || this.name,
      eventId: eventId || '',
      eventType: eventType || 'UNKNOWN',
      merchantOrderId:
        payload?.merchantOrderId ||
        payload?.notes?.merchantOrderId ||
        payload?.data?.merchantOrderId ||
        '',
      paymentStatus: 'PENDING',
      payload: payload || {},
    };
  },
};

export const getPaymentProvider = () => {
  // Future: switch by process.env.PAYMENT_PROVIDER and return provider-specific adapter.
  return pendingProvider;
};
