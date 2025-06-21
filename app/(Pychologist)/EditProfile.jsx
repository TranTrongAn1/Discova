import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from 'react-native';
import api from '../(auth)/api';

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const profile = route.params?.profile || {};

  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    profile_picture_url: profile.profile_picture_url || '',
    license_number: profile.license_number || '',
    license_issuing_authority: profile.license_issuing_authority || '',
    license_expiry_date: profile.license_expiry_date || '2025-06-03',
    years_of_experience: profile.years_of_experience || 0,
    biography: profile.biography || '',
    education: profile.education?.length
      ? profile.education
      : [
          { degree: '', institution: '', year: '' },
          { degree: '', institution: '', year: '' },
          { degree: '', institution: '', year: '' },
        ],
    certifications: profile.certifications?.length
      ? profile.certifications
      : [
          { name: '', institution: '', year: '' },
          { name: '', institution: '', year: '' },
          { name: '', institution: '', year: '' },
        ],
    offers_initial_consultation: profile.offers_initial_consultation ?? true,
    offers_online_sessions: profile.offers_online_sessions ?? true,
    office_address: profile.office_address || '',
    website_url: profile.website_url || '',
    linkedin_url: profile.linkedin_url || '',
    hourly_rate: profile.hourly_rate ? String(profile.hourly_rate) : '',
    initial_consultation_rate: profile.initial_consultation_rate
      ? String(profile.initial_consultation_rate)
      : '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [animatedValue] = useState(new Animated.Value(1));

  const parseDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setForm({ ...form, license_expiry_date: formattedDate });
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleNestedChange = (section, index, key, value) => {
    setForm({
      ...form,
      [section]: form[section].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    });
  };


 const handleUpdate = async () => {
  if (
    !form.first_name ||
    !form.last_name ||
    !form.license_number ||
    !form.license_issuing_authority ||
    !form.license_expiry_date ||
    form.years_of_experience === '' ||
    form.years_of_experience < 0
  ) {
    Alert.alert(
      'Validation Error',
      'All required fields must be filled.',
    );
    navigation.navigate('profile');
    return;
  }


  const isValidUrl = (url) => {
    if (!url) return true;
    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    return urlPattern.test(url);
  };

  if (
    (form.profile_picture_url && !isValidUrl(form.profile_picture_url)) ||
    (form.website_url && !isValidUrl(form.website_url)) ||
    (form.linkedin_url && !isValidUrl(form.linkedin_url))
  ) {
    Alert.alert('Validation Error', 'URLs must be valid (e.g., start with http:// or https://).');
    return;
  }

  const hourlyRate = form.hourly_rate
    ? parseFloat(form.hourly_rate).toFixed(2)
    : '';
  const initialConsultationRate = form.initial_consultation_rate
    ? parseFloat(form.initial_consultation_rate).toFixed(2)
    : '';

  if (!hourlyRate || !initialConsultationRate || isNaN(hourlyRate) || isNaN(initialConsultationRate)) {
    Alert.alert('Validation Error', 'Hourly Rate and Initial Consultation Rate must be valid numbers.');
    return;
  }

  const payload = {
    ...form,
    hourly_rate: hourlyRate,
    initial_consultation_rate: initialConsultationRate,
    years_of_experience: parseInt(form.years_of_experience) || 0,
    education: form.education.filter(
      (edu) => edu.degree || edu.institution || edu.year
    ),
    certifications: form.certifications.filter(
      (cert) => cert.name || cert.institution || cert.year
    ),
    services_offered: form.services_offered || [],
  };

  try {
    const isNewProfile = !route.params?.profile || Object.keys(route.params.profile).length === 0;
    const endpoint = isNewProfile
      ? '/api/psychologists/profile/'
      : '/api/psychologists/profile/update_profile';
    const method = isNewProfile ? api.post : api.patch;

    await method(endpoint, payload);
    
    Alert.alert(
      'Thành công', 
      `Hồ sơ ${isNewProfile ? 'đã được tạo' : 'đã được cập nhật'} thành công!`,
      [
        {
          text: 'Tiếp tục',
          onPress: () => {
            if (isNewProfile) {
              // New profile created - redirect to psychologist home
              router.replace('/(Pychologist)/profile');
            } else {
              // Profile updated - go back to profile page
              router.back();
            }
          }
        }
      ]
    );
  } catch (error) {
    const errorMessage = error.response?.data?.detail || JSON.stringify(error.response?.data) || `Could not ${isNewProfile ? 'create' : 'update'} profile.`;
    Alert.alert('Error', errorMessage);
  }
};

  const animatePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const AnimatedTextInput = ({ style, ...props }) => {
    const [scale] = useState(new Animated.Value(1));

    const handleFocus = () => {
      Animated.spring(scale, {
        toValue: 1.02,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    };

    const handleBlur = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        <TextInput
          style={[style, styles.input]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#999"
          {...props}
        />
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#6c63ff', '#8e8dfa', '#b0b7ff']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Edit Your Professional Profile</Text>
          <Text style={styles.subtitle}>Craft a profile that reflects your expertise</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Personal Information</Text>
          <View style={styles.divider} />
          <AnimatedTextInput
            placeholder="First Name *"
            value={form.first_name.trim()}
            onChangeText={(text) => handleChange('first_name', text)}
          />
          <AnimatedTextInput
            placeholder="Last Name *"
            value={form.last_name.trim()}
            onChangeText={(text) => handleChange('last_name', text)}
          />
          <AnimatedTextInput
            placeholder="Profile Picture URL"
            value={form.profile_picture_url.trim()}
            onChangeText={(text) => handleChange('profile_picture_url', text)}
          />
          <AnimatedTextInput
            placeholder="Biography"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={form.biography}
            onChangeText={(text) => handleChange('biography', text)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>License</Text>
          <View style={styles.divider} />
          <AnimatedTextInput
            placeholder="License Number *"
            value={form.license_number}
            onChangeText={(text) => handleChange('license_number', text)}
          />
          <AnimatedTextInput
            placeholder="Issuing Authority *"
            value={form.license_issuing_authority}
            onChangeText={(text) => handleChange('license_issuing_authority', text)}
          />
          <Text style={styles.label}>License Expiry Date *</Text>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <LinearGradient
              colors={['#6c63ff', '#8e8dfa']}
              style={styles.dateButtonGradient}
            >
              <Text style={styles.dateButtonText}>
                {form.license_expiry_date || 'Select Date'} 📅
              </Text>
            </LinearGradient>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={parseDate(form.license_expiry_date)}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}
          <AnimatedTextInput
            placeholder="Years of Experience *"
            keyboardType="numeric"
            value={String(form.years_of_experience)}
            onChangeText={(text) =>
              handleChange('years_of_experience', parseInt(text) || 0)
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Education</Text>
          <View style={styles.divider} />
          {form.education.map((edu, index) => (
            <View key={index} style={styles.nestedContainer}>
              <AnimatedTextInput
                placeholder={`Degree ${index + 1}`}
                value={edu.degree}
                onChangeText={(text) =>
                  handleNestedChange('education', index, 'degree', text)
                }
              />
              <AnimatedTextInput
                placeholder={`Institution ${index + 1}`}
                value={edu.institution}
                onChangeText={(text) =>
                  handleNestedChange('education', index, 'institution', text)
                }
              />
              <AnimatedTextInput
                placeholder={`Year ${index + 1}`}
                keyboardType="numeric"
                value={edu.year}
                onChangeText={(text) =>
                  handleNestedChange('education', index, 'year', text)
                }
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Certifications</Text>
          <View style={styles.divider} />
          {form.certifications.map((cert, index) => (
            <View key={index} style={styles.nestedContainer}>
              <AnimatedTextInput
                placeholder={`Certification ${index + 1}`}
                value={cert.name}
                onChangeText={(text) =>
                  handleNestedChange('certifications', index, 'name', text)
                }
              />
              <AnimatedTextInput
                placeholder={`Institution ${index + 1}`}
                value={cert.institution}
                onChangeText={(text) =>
                  handleNestedChange('certifications', index, 'institution', text)
                }
              />
              <AnimatedTextInput
                placeholder={`Year ${index + 1}`}
                keyboardType="numeric"
                value={cert.year}
                onChangeText={(text) =>
                  handleNestedChange('certifications', index, 'year', text)
                }
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Availability</Text>
          <View style={styles.divider} />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Offers Initial Consultation</Text>
            <Switch
              value={form.offers_initial_consultation}
              onValueChange={(val) =>
                handleChange('offers_initial_consultation', val)
              }
              trackColor={{ false: '#ccc', true: '#6c63ff' }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Offers Online Sessions</Text>
            <Switch
              value={form.offers_online_sessions}
              onValueChange={(val) =>
                handleChange('offers_online_sessions', val)
              }
              trackColor={{ false: '#ccc', true: '#6c63ff' }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Contact & Rates</Text>
          <View style={styles.divider} />
          <AnimatedTextInput
            placeholder="Office Address"
            value={form.office_address}
            onChangeText={(text) => handleChange('office_address', text)}
          />
          <AnimatedTextInput
            placeholder="Website URL"
            value={form.website_url}
            onChangeText={(text) => handleChange('website_url', text)}
          />
          <AnimatedTextInput
            placeholder="LinkedIn URL"
            value={form.linkedin_url}
            onChangeText={(text) => handleChange('linkedin_url', text)}
          />
          <AnimatedTextInput
            placeholder="Hourly Rate ($) *"
            keyboardType="numeric"
            value={form.hourly_rate}
            onChangeText={(text) => handleChange('hourly_rate', text)}
          />
          <AnimatedTextInput
            placeholder="Initial Consultation Rate ($) *"
            keyboardType="numeric"
            value={form.initial_consultation_rate}
            onChangeText={(text) =>
              handleChange('initial_consultation_rate', text)
            }
          />
        </View>

        <Animated.View style={{ transform: [{ scale: animatedValue }], width: '100%' }}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.9, shadowOpacity: 0.3 },
            ]}
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            onPress={handleUpdate}
          >
            <LinearGradient
              colors={['#6c63ff', '#8e8dfa']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Save Profile</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default EditProfile;

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
    ...Platform.select({

      ios: {

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6

      },

      android: {

        elevation: 6,

      },

      web: {

        boxShadow: '0 4 6px rgba(0,0,0,0000.2)',

      },

    }),
    elevation: 6,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c63ff',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
    lineHeight: 26,
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    ...Platform.select({

      ios: {

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10

      },

      android: {

        elevation: 10,

      },

      web: {

        boxShadow: '0 6 10px rgba(0,0,0,0000.15)',

      },

    }),
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#6c63ff22',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9fb',
    fontSize: 16,
    color: '#333',
    ...Platform.select({

      ios: {

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2 4px rgba(0,0,0,0000.08)',

      },

    }),
    elevation: 2,
  },
  textArea: {
    height: 140,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
    fontWeight: '500',
  },
  dateButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
  nestedContainer: {
    marginBottom: 16,
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
});