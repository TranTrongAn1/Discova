import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import React from 'react';
import psychologists from '../(Pychologist)/pyschcologists';
const Profile = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Image */}
      <Image
        source={{ uri: psychologists[0].img }}
        style={styles.avatar}
      />

      {/* Name & Title */}
      <Text style={styles.name}>Dr. World Cup</Text>
      <Text style={styles.title}>Licensed Clinical Psychologist</Text>

      {/* Section: Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <Text style={styles.text}>Ph.D. in Clinical Psychology, Harvard University</Text>
        <Text style={styles.text}>M.A. in Psychology, UCLA</Text>
      </View>

      {/* Section: Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.text}>10+ years in individual and group therapy</Text>
      </View>

      {/* Section: Specializations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations</Text>
        <Text style={styles.text}>Anxiety, Depression, Trauma Recovery, CBT, Couples Therapy</Text>
      </View>

      {/* Section: Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.text}>Email: emilycarter@example.com</Text>
        <Text style={styles.text}>Phone: (555) 123-4567</Text>
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  title: {
    fontSize: 16,
    color: '#6c63ff',
    marginBottom: 20,
  },
  section: {
    alignSelf: 'stretch',
    marginBottom: 20,
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
