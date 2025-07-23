import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../(auth)/api';

const RevenueDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch payments data
      console.log('Fetching payments...');
      const paymentsRes = await api.get('/api/payments/payments/');
      console.log('Payments response:', paymentsRes.data);
      
      // Handle different response structures
      let paymentsData = [];
      if (paymentsRes.data.results) {
        paymentsData = paymentsRes.data.results;
      } else if (paymentsRes.data.payments) {
        paymentsData = paymentsRes.data.payments;
      } else if (Array.isArray(paymentsRes.data)) {
        paymentsData = paymentsRes.data;
      } else {
        console.log('Unexpected payments response structure:', paymentsRes.data);
      }
      setPayments(paymentsData);

      // Try to fetch transactions data
      console.log('Fetching transactions...');
      const transactionsRes = await api.get('/api/payments/transactions/');
      console.log('Transactions response:', transactionsRes.data);
      
      // Handle different response structures
      let transactionsData = [];
      if (transactionsRes.data.results) {
        transactionsData = transactionsRes.data.results;
      } else if (transactionsRes.data.transactions) {
        transactionsData = transactionsRes.data.transactions;
      } else if (Array.isArray(transactionsRes.data)) {
        transactionsData = transactionsRes.data;
      } else {
        console.log('Unexpected transactions response structure:', transactionsRes.data);
      }
      setTransactions(transactionsData);

      // If no payments/transactions, try to fetch appointments to calculate potential revenue
      if (paymentsData.length === 0 && transactionsData.length === 0) {
        console.log('No payments found, fetching appointments...');
        try {
          const appointmentsRes = await api.get('/api/appointments/');
          console.log('Appointments response:', appointmentsRes.data);
          
          if (appointmentsRes.data.results) {
            const completedAppointments = appointmentsRes.data.results.filter(
              app => app.appointment_status === 'Completed' || app.appointment_status === 'Paid'
            );
            console.log('Completed appointments:', completedAppointments);
          }
        } catch (appointmentErr) {
          console.log('Could not fetch appointments:', appointmentErr);
        }
      }

      console.log('Processed payments data:', paymentsData);
      console.log('Processed transactions data:', transactionsData);
      console.log('Payments count:', paymentsData.length);
      console.log('Transactions count:', transactionsData.length);
    } catch (err) {
      console.error('Revenue fetch error:', err);
      console.error('Error response:', err.response?.data);
      setError('Could not load revenue data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calculate total revenue and pending payouts
  const totalRevenue = payments
    .filter(p => p.status === 'succeeded' || p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  
  const pendingPayout = payments
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  // Get recent transactions (last 10)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Ionicons name={item.status === 'succeeded' || item.status === 'paid' ? 'checkmark-circle' : 'time'} size={24} color={item.status === 'succeeded' || item.status === 'paid' ? '#27ae60' : '#f39c12'} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.description || item.order_type || 'Transaction'}</Text>
        <Text style={styles.transactionDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.status === 'succeeded' || item.status === 'paid' ? '#27ae60' : '#f39c12' }]}>+${parseFloat(item.amount).toFixed(2)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>  
      <Text style={styles.header}>My Revenue</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6c5ce7" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <Ionicons name="wallet" size={32} color="#6c5ce7" style={styles.cardIcon} />
              <Text style={styles.cardLabel}>Total Revenue</Text>
              <Text style={styles.cardValue}>${totalRevenue.toFixed(2)}</Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="time" size={32} color="#f39c12" style={styles.cardIcon} />
              <Text style={styles.cardLabel}>Pending Payout</Text>
              <Text style={styles.cardValue}>${pendingPayout.toFixed(2)}</Text>
            </View>
          </View>

          {/* Debug Info */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Payments: {payments.length}</Text>
            <Text style={styles.debugText}>Transactions: {transactions.length}</Text>
          </View>

          {/* Recent Transactions */}
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={48} color="#ccc" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No transactions found.</Text>
              <Text style={styles.emptySubtext}>Your revenue will appear here once you have completed appointments.</Text>
            </View>
          ) : (
            <FlatList
              data={recentTransactions}
              keyExtractor={item => item.transaction_id || item.payment_id || item.id}
              renderItem={renderTransaction}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    marginTop: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 5,
  },
  debugInfo: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 14,
    color: '#333',
  },
});

export default RevenueDashboard; 