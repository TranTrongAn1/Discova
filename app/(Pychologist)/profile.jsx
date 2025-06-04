import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../(auth)/api';

const Profile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/psychologists/profile/profile/');
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data. Please try again.');
        setLoading(false);
        Alert.alert('Error', err.response?.data?.detail || 'Could not fetch profile data.');
        console.error('Profile fetch failed', err);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <Text>{error || 'No profile data available.'}</Text>
        <Button title="Try Again" onPress={() => fetchProfile()} />
      </View>
    );
  }

  // Ensure education and certifications are arrays, with fallback
  const educationEntries = Array.isArray(profile.education)
    ? profile.education.filter((edu) => edu.degree || edu.institution || edu.year)
    : [];
  const certificationEntries = Array.isArray(profile.certifications)
    ? profile.certifications.filter((cert) => cert.name || cert.institution || cert.year)
    : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: profile.profile_picture_url || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>
        {profile.display_name || `${profile.first_name} ${profile.last_name}`}
      </Text>
      <Text style={styles.title}>
        {profile.is_verified && profile.license_is_valid
          ? 'Licensed Clinical Psychologist'
          : 'Psychologist'}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>{profile.biography || 'No biography provided.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {educationEntries.length > 0 ? (
          educationEntries.map((edu, index) => (
            <Text key={index} style={styles.text}>
              {`${edu.degree || 'Degree not specified'}, ${edu.institution || 'Institution not specified'}${edu.year ? `, ${edu.year}` : ''}`}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No education details provided.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {certificationEntries.length > 0 ? (
          certificationEntries.map((cert, index) => (
            <Text key={index} style={styles.text}>
              {`${cert.name || 'Certification not specified'}, ${cert.institution || 'Institution not specified'}${cert.year ? `, ${cert.year}` : ''}`}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No certifications provided.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.text}>
          {profile.years_of_experience
            ? `${profile.years_of_experience} years of experience`
            : 'No experience details provided.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services Offered</Text>
        {profile.services_offered && profile.services_offered.length > 0 ? (
          <Text style={styles.text}>{profile.services_offered.join(', ')}</Text>
        ) : (
          <Text style={styles.text}>No services listed.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.text}>Email: {profile.email || 'Not provided'}</Text>
        {profile.office_address && (
          <Text style={styles.text}>Address: {profile.office_address}</Text>
        )}
        {profile.website_url && (
          <Text style={styles.text}>Website: {profile.website_url}</Text>
        )}
        {profile.linkedin_url && (
          <Text style={styles.text}>LinkedIn: {profile.linkedin_url}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rates</Text>
        <Text style={styles.text}>
          Hourly Rate: $
          {profile.hourly_rate ? parseFloat(profile.hourly_rate).toFixed(2) : 'Not provided'}
        </Text>
        <Text style={styles.text}>
          Initial Consultation Rate: $
          {profile.initial_consultation_rate
            ? parseFloat(profile.initial_consultation_rate).toFixed(2)
            : 'Not provided'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <Text style={styles.text}>
          Initial Consultation: {profile.offers_initial_consultation ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.text}>
          Online Sessions: {profile.offers_online_sessions ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Status</Text>
        <Text style={styles.text}>
          Verification: {profile.verification_status || 'Not provided'}
        </Text>
        <Text style={styles.text}>
          License Valid: {profile.license_is_valid ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.text}>
          Marketplace Visible: {profile.is_marketplace_visible ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.text}>
          Can Book Appointments: {profile.can_book_appointments || 'Not provided'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <Button title="Edit Profile" onPress={handleEditProfile} color="#6c63ff" />
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
});