import React from 'react';
import { Platform } from 'react-native';

// Default fallback components
const DefaultStripeProvider = ({ children }) => {
  return React.createElement('div', { 'data-stripe-provider': 'fallback' }, children);
};

const DefaultCardField = () => {
  return React.createElement('div', { 'data-stripe-card-field': 'fallback' });
};

const DefaultInitStripe = () => Promise.resolve();
const DefaultUseConfirmPayment = () => ({ confirmPayment: () => Promise.resolve() });

// Platform-specific imports
let StripeProvider = DefaultStripeProvider;
let CardField = DefaultCardField;
let initStripe = DefaultInitStripe;
let useConfirmPayment = DefaultUseConfirmPayment;

if (Platform.OS === 'web') {
  // Web-specific imports
  try {
    const { loadStripe } = require('@stripe/stripe-js');
    const stripePromise = loadStripe('pk_test_51RW4q4Rq8N8jdwzZXus9YjEnUhdkk3TZIll62vHWM7CBwRaqIRnmjPDKXWx1ytsJ6RrHurL77M4yo0uMjMXVdZV400DQhwWn35');
    
    // Create a simple StripeProvider for web
    StripeProvider = ({ children, publishableKey }) => {
      return React.createElement('div', { 'data-stripe-provider': 'web' }, children);
    };
    
    CardField = () => React.createElement('div', { 'data-stripe-card-field': 'web' });
    initStripe = () => Promise.resolve();
    useConfirmPayment = () => ({ confirmPayment: () => Promise.resolve() });
  } catch (error) {
    console.warn('Stripe web not available:', error);
    // Keep default fallback components
  }
} else {
  // For native platforms
  try {
    const StripeNative = require('@stripe/stripe-react-native');
    if (StripeNative.StripeProvider) {
      StripeProvider = StripeNative.StripeProvider;
    }
    if (StripeNative.CardField) {
      CardField = StripeNative.CardField;
    }
    if (StripeNative.initStripe) {
      initStripe = StripeNative.initStripe;
    }
    if (StripeNative.useConfirmPayment) {
      useConfirmPayment = StripeNative.useConfirmPayment;
    }
  } catch (error) {
    console.warn('Stripe React Native not available:', error);
    // Keep default fallback components
  }
}

// Ensure all exports are defined
export {
    CardField,
    initStripe,
    StripeProvider,
    useConfirmPayment
};

