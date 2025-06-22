import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import moment from 'moment';

const mockClients = [
  {
    id: '1',
    name: 'Alice Johnson',
    date: '2025-05-28',
    time: '08:00',
    problem: 'Anxiety issues',
    note: 'Prefers morning sessions',
    status: 'complete',
  },
  {
    id: '2',
    name: 'Brian Lee',
    date: '2025-05-28',
    time: '10:00',
    problem: 'Stress at work',
    note: 'Needs follow-up next week',
    status: 'in_progress',
  },
  {
    id: '3',
    name: 'Carlos Rivera',
    date: '2025-05-29',
    time: '09:00',
    problem: 'Sleep disorder',
    note: 'Refer to sleep specialist',
    status: 'upcoming',
  },
];

const statusLabels = {
  all: 'All',
  complete: 'Complete',
  in_progress: 'In Progress',
  upcoming: 'Upcoming',
};

const ClientScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredClients =
    selectedStatus === 'all'
      ? mockClients
      : mockClients.filter((client) => client.status === selectedStatus);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booked Clients</Text>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {Object.keys(statusLabels).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {statusLabels[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Client List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>
              {moment(item.date).format('ddd, MMM D')} | {item.time} -{' '}
              {moment(item.time, 'HH:mm').add(1, 'hour').format('HH:mm')}
            </Text>
            <Text style={styles.label}>Problem:</Text>
            <Text style={styles.text}>{item.problem}</Text>
            <Text style={styles.label}>Note:</Text>
            <Text style={styles.text}>{item.note}</Text>
            <Text style={[styles.status,
               { color: {
                    complete: '#28a745',
                    in_progress: '#ffc107',
                    upcoming: '#17a2b8',
                  }[item.status] || '#999'
                },
            ]}>Status: {statusLabels[item.status]}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No clients in this status</Text>}
      />
    </View>
  );
};

export default ClientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  filterButtonActive: {
    backgroundColor: '#6c63ff',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#6c63ff',
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    color: '#555',
  },
  text: {
    fontSize: 14,
    color: '#444',
  },
  status: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#777',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});
