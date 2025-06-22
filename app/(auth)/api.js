import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://kmdiscova.id.vn/',
});

let hasRedirectedToWelcome = false; // to avoid repeated redirects
let lastTokenCheck = null; // to avoid repeated token checks

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (token) {
        config.headers.Authorization = `Token ${token}`;

        // Only redirect to welcome if we haven't already and we're not already on a protected route
        if (!hasRedirectedToWelcome && router?.replace) {
          try {
            const currentPath = router.pathname;
            const isOnProtectedRoute = currentPath.includes('/(Pychologist)') ||
                                      currentPath.includes('/(parent)') ||
                                      currentPath.includes('/(booking)');

            if (!isOnProtectedRoute) {
              hasRedirectedToWelcome = true;
              setTimeout(() => {
                router.replace('/welcome');
              }, 0);
            }
          } catch (redirectError) {
            console.warn('Redirect error:', redirectError);
          }
        }
      } else {
        // Only log warning occasionally to reduce spam
        const now = Date.now();
        if (!lastTokenCheck || now - lastTokenCheck > 5000) { // Log max once every 5 seconds
          console.warn('⚠️ No access token found - user not authenticated');
          lastTokenCheck = now;
        }
      }
    } catch (error) {
      console.error('API interceptor error:', error);
    }

    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication failed - clearing tokens');
      clearTokens();
      // Don't redirect here to avoid loops
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status, error.response?.data);
    }

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

    const profileData = {
      first_name: 'New',
      last_name: 'Psychologist',
      license_number: 'TEMP-LICENSE-001',
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
  const response = await api.get(`/api/payments/orders/${orderId}/status/`);
  return response.data;
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