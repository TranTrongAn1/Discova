import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View, Pressable, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../(auth)/api';

const Profile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedValue] = useState(new Animated.Value(1));

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/psychologists/profile/profile/');
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err.response?.data?.detail || 'Could not fetch profile data.');
      console.error('Profile fetch failed', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleCreateProfile = () => {
    navigation.navigate('EditProfile', { profile: {} });
  };

  const animatePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const SectionCard = ({ title, children }) => {
    const [scale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.99,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={[styles.section, { transform: [{ scale }] }]}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.divider} />
            {children}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#6c63ff', '#8e8dfa', '#b0b7ff']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error || !profile) {
    return (
      <LinearGradient
        colors={['#6c63ff', '#8e8dfa', '#b0b7ff']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Text style={[styles.title, error && styles.errorText]}>
            {error || 'Welcome to'}
          </Text>
          <Text style={styles.brand}>K&M Discova</Text>
          <Text style={styles.subtitle}>
            Create a profile to connect with your audience
          </Text>
          <Animated.View style={{ transform: [{ scale: animatedValue }], width: '100%' }}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.9, shadowOpacity: 0.3 },
              ]}
              onPressIn={animatePressIn}
              onPressOut={animatePressOut}
              onPress={handleCreateProfile}
            >
              <LinearGradient
                colors={['#6c63ff', '#8e8dfa']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Create Profile</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  const educationEntries = Array.isArray(profile.education)
    ? profile.education.filter((edu) => edu.degree || edu.institution || edu.year)
    : [];
  const certificationEntries = Array.isArray(profile.certifications)
    ? profile.certifications.filter((cert) => cert.name || cert.institution || cert.year)
    : [];

  return (
    <LinearGradient
      colors={['#6c63ff', '#8e8dfa', '#b0b7ff']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: profile.profile_picture_url || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {profile.display_name || `${profile.first_name} ${profile.last_name}`}
          </Text>
          <Text style={styles.subtitle}>
            {profile.is_verified && profile.license_is_valid
              ? 'Licensed Clinical Psychologist'
              : 'Psychologist'}
          </Text>
        </View>

        <SectionCard title="About">
          <Text style={styles.text}>{profile.biography || 'No biography provided.'}</Text>
        </SectionCard>

        <SectionCard title="Education">
          {educationEntries.length > 0 ? (
            educationEntries.map((edu, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listText}>
                  ● {edu.degree || 'Degree not specified'}, {edu.institution || 'Institution not specified'}{edu.year ? `, ${edu.year}` : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No education details provided.</Text>
          )}
        </SectionCard>

        <SectionCard title="Certifications">
          {certificationEntries.length > 0 ? (
            certificationEntries.map((cert, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listText}>
                  ● {cert.name || 'Certification not specified'}, {cert.institution || 'Institution not specified'}{cert.year ? `, ${cert.year}` : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No certifications provided.</Text>
          )}
        </SectionCard>

        <SectionCard title="Experience">
          <Text style={styles.text}>
            {profile.years_of_experience
              ? `${profile.years_of_experience} years of experience`
              : 'No experience details provided.'}
          </Text>
        </SectionCard>

        <SectionCard title="Services Offered">
          {profile.services_offered && profile.services_offered.length > 0 ? (
            profile.services_offered.map((service, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listText}>● {service}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No services listed.</Text>
          )}
        </SectionCard>

        <SectionCard title="Contact">
          <View style={styles.listItem}>
            <Text style={styles.listText}>● Email: {profile.email || 'Not provided'}</Text>
          </View>
          {profile.office_address && (
            <View style={styles.listItem}>
              <Text style={styles.listText}>● Address: {profile.office_address}</Text>
            </View>
          )}
          {profile.website_url && (
            <View style={styles.listItem}>
              <Text style={styles.listText}>● Website: {profile.website_url}</Text>
            </View>
          )}
          {profile.linkedin_url && (
            <View style={styles.listItem}>
              <Text style={styles.listText}>● LinkedIn: {profile.linkedin_url}</Text>
            </View>
          )}
        </SectionCard>

        <SectionCard title="Rates">
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Hourly Rate: ${profile.hourly_rate ? parseFloat(profile.hourly_rate).toFixed(2) : 'Not provided'}
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Initial Consultation Rate: ${profile.initial_consultation_rate
                ? parseFloat(profile.initial_consultation_rate).toFixed(2)
                : 'Not provided'}
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Availability">
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Initial Consultation: {profile.offers_initial_consultation ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Online Sessions: {profile.offers_online_sessions ? 'Yes' : 'No'}
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Profile Status">
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Verification: {profile.verification_status || 'Not provided'}
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● License Valid: {profile.license_is_valid ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Marketplace Visible: {profile.is_marketplace_visible ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              ● Can Book Appointments: {profile.can_book_appointments || 'Not provided'}
            </Text>
          </View>
        </SectionCard>

        <Animated.View style={{ transform: [{ scale: animatedValue }], width: '100%' }}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.9, shadowOpacity: 0.3 },
            ]}
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            onPress={handleEditProfile}
          >
            <LinearGradient
              colors={['#6c63ff', '#8e8dfa']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6c63ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c63ff',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#6c63ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  name: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    color: '#ffffffdd',
    marginBottom: 4,
    textAlign: 'center',
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
    lineHeight: 26,
  },
  section: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 10,
  },
  listText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  button: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    marginTop: 32,
    marginBottom: 48,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 64,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
  },
  errorText: {
    color: '#ffcccc',
  },
});