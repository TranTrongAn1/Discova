import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://kmdiscova.id.vn/',
});

let hasRedirectedToWelcome = false; // to avoid repeated redirects

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Token ${token}`;

      // Redirect to welcome only once
      if (!hasRedirectedToWelcome && router?.replace) {
        hasRedirectedToWelcome = true;
        setTimeout(() => {
          router.replace('/welcome');
        }, 0); // Delay to avoid interfering with request
      }

    } else {
      router.replace('/login');
      console.warn('⚠️ No access token found');

      // Optional: redirect to login if no token
      // if (!router.canGoBack?.()) {
      //   router.replace('/login');
      // }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function checkPsychologistProfile() {
  const response = await api.get('/api/psychologists/profile/profile/');
  return response.data;
}

export async function createBasicPsychologistProfile() {
  try {
    console.log('Creating basic psychologist profile...');

    // Get current date and add 1 year for license expiry
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
    const expiryDateString = expiryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Generate a unique license number using timestamp and random component
    const timestamp = Date.now();
    const randomComponent = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const uniqueLicenseNumber = `TEMP-${timestamp}-${randomComponent}`;

    const profileData = {
      first_name: 'New',
      last_name: 'Psychologist',
      license_number: uniqueLicenseNumber,
      license_issuing_authority: 'Temporary Authority',
      license_expiry_date: expiryDateString,
      years_of_experience: 1,
      offers_initial_consultation: true,
      offers_online_sessions: true,
      office_address: 'Temporary Office Address - To be updated'
    };

    console.log('Sending profile data:', profileData);

    const response = await api.post('/api/psychologists/profile/', profileData);
    console.log('Basic profile created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating basic profile:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

export async function getPricing() {
  const response = await api.get('/api/payments/pricing/');
  return response.data;
}

export async function getExistingRegistrationOrders() {
  try {
    console.log('Checking for existing registration orders...');
    const response = await api.get('/api/payments/orders/');
    console.log('Existing orders:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting existing orders:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

export async function createRegistrationOrder(currency = 'USD', provider = 'stripe') {
  try {
    console.log('Creating registration order with:', { currency, provider });
    const response = await api.post('/api/payments/orders/create_registration_order/', {
      currency,
      provider
    });
    console.log('Registration order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating registration order:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

export async function initiatePayment(orderId, successUrl, cancelUrl, provider = 'stripe') {
  try {
    console.log('Initiating payment with:', { orderId, successUrl, cancelUrl, provider });
    const response = await api.post(`/api/payments/orders/${orderId}/initiate_payment/`, {
      success_url: successUrl,
      cancel_url: cancelUrl,
      provider
    });
    console.log('Payment initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

export async function checkPaymentStatus(orderId) {
  try {
    console.log('Checking payment status for order:', orderId);
    const response = await api.get(`/api/payments/orders/${orderId}/status/`);
    console.log('Payment status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
}

export async function clearTokens() {
  try {
    console.log('Clearing authentication tokens...');
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_type');
    await AsyncStorage.removeItem('user_id');
    console.log('Tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

export default api;