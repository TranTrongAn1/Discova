import { Platform } from 'react-native';

// Platform-specific imports
let StripeProvider, CardField, initStripe, useConfirmPayment;

if (Platform.OS === 'web') {
  // Web-specific imports - use dynamic import to avoid native module issues
  const WebStripe = require('./StripeWebWrapper');
  StripeProvider = WebStripe.StripeProvider;
  CardField = WebStripe.CardField;
  initStripe = WebStripe.initStripe;
  useConfirmPayment = WebStripe.useConfirmPayment;
} else {
  // For native platforms, we'll use a different approach
  // Create a lazy-loaded wrapper to avoid webpack issues
  const createNativeStripe = () => {
    try {
      const StripeNative = require('@stripe/stripe-react-native');
      return {
        StripeProvider: StripeNative.StripeProvider,
        CardField: StripeNative.CardField,
        initStripe: StripeNative.initStripe,
        useConfirmPayment: StripeNative.useConfirmPayment,
      };
    } catch (error) {
      console.warn('Stripe React Native not available:', error);
      // Fallback to web implementation
      const WebStripe = require('./StripeWebWrapper');
      return {
        StripeProvider: WebStripe.StripeProvider,
        CardField: WebStripe.CardField,
        initStripe: WebStripe.initStripe,
        useConfirmPayment: WebStripe.useConfirmPayment,
      };
    }
  };
  
  const nativeStripe = createNativeStripe();
  StripeProvider = nativeStripe.StripeProvider;
  CardField = nativeStripe.CardField;
  initStripe = nativeStripe.initStripe;
  useConfirmPayment = nativeStripe.useConfirmPayment;
}

export { CardField, initStripe, StripeProvider, useConfirmPayment };

