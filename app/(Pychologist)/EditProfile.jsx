import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Platform } from 'react-native';
import api from '../(auth)/api';

const exampleData = {
  first_name: 'Alice',
  last_name: 'Nguyen',
  profile_picture_url: 'https://example.com/images/alice.jpg',
  license_number: 'PSY123456',
  license_issuing_authority: 'Vietnamese Psychological Council',
  license_expiry_date: '2027-12-31',
  years_of_experience: 8,
  biography: 'Alice Nguyen is a licensed clinical psychologist with a focus on cognitive behavioral therapy.',
  education: [
    { degree: 'B.A. in Psychology', institution: 'Hanoi University', year: '2010' },
    { degree: 'M.S. in Clinical Psychology', institution: 'Melbourne University', year: '2013' },
    { degree: 'Ph.D. in Psychology', institution: 'Stanford University', year: '2017' },
  ],
  certifications: [
    { name: 'Certified CBT Practitioner', institution: 'CBT Institute', year: '2018' },
    { name: 'Trauma-Focused Therapy Certification', institution: 'TFT Academy', year: '2019' },
    { name: 'Mental Health First Aid Certified', institution: 'MHFA Org', year: '2020' },
  ],
  offers_initial_consultation: true,
  offers_online_sessions: true,
  office_address: '123 Nguyen Van Linh, District 7, HCMC',
  website_url: 'https://www.alicenguyenpsychology.com',
  linkedin_url: 'https://www.linkedin.com/in/alicenguyen',
  hourly_rate: '120.00',
  initial_consultation_rate: '80.00',
};

const EditProfile = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    profile_picture_url: '',
    license_number: '',
    license_issuing_authority: '',
    license_expiry_date: '2025-06-03',
    years_of_experience: 0,
    biography: '',
    education: [
      { degree: '', institution: '', year: '' },
      { degree: '', institution: '', year: '' },
      { degree: '', institution: '', year: '' },
    ],
    certifications: [
      { name: '', institution: '', year: '' },
      { name: '', institution: '', year: '' },
      { name: '', institution: '', year: '' },
    ],
    offers_initial_consultation: true,
    offers_online_sessions: true,
    office_address: '',
    website_url: '',
    linkedin_url: '',
    hourly_rate: '',
    initial_consultation_rate: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const fillExampleData = () => {
    setForm(exampleData);
  };

  const handleUpdate = async () => {
    // Validate required fields
    if (
      !form.first_name ||
      !form.last_name ||
      !form.license_number ||
      !form.license_issuing_authority ||
      !form.license_expiry_date ||
      form.years_of_experience === '' ||
      form.years_of_experience < 0
    ) {
      Alert.alert('Validation Error', 'All required fields must be filled.');
      return;
    }

    // Validate URLs
    const isValidUrl = (url) => {
      if (!url) return true; // Optional fields
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

    // Validate rates
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

    // Prepare payload
    const payload = {
      ...form,
      hourly_rate: hourlyRate,
      initial_consultation_rate: initialConsultationRate,
      years_of_experience: parseInt(form.years_of_experience) || 0,
      // Filter out empty education/certification entries
      education: form.education.filter(
        (edu) => edu.degree || edu.institution || edu.year
      ),
      certifications: form.certifications.filter(
        (cert) => cert.name || cert.institution || cert.year
      ),
    };

    try {
      await api.patch('/api/psychologists/profile/update_profile', payload);
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || JSON.stringify(error.response?.data) || 'Could not create profile.';
      Alert.alert('Error', errorMessage);
      console.error('Create failed', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Personal Information</Text>

      <Button title="Fill with Example Data" onPress={fillExampleData} />

      <TextInput
        placeholder="First Name *"
        style={styles.input}
        value={form.first_name}
        onChangeText={(text) => handleChange('first_name', text)}
      />
      <TextInput
        placeholder="Last Name *"
        style={styles.input}
        value={form.last_name}
        onChangeText={(text) => handleChange('last_name', text)}
      />
      <TextInput
        placeholder="Profile Picture URL"
        style={styles.input}
        value={form.profile_picture_url}
        onChangeText={(text) => handleChange('profile_picture_url', text)}
      />
      <TextInput
        placeholder="Biography"
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        value={form.biography}
        onChangeText={(text) => handleChange('biography', text)}
      />

      <Text style={styles.header}>License</Text>
      <TextInput
        placeholder="License Number *"
        style={styles.input}
        value={form.license_number}
        onChangeText={(text) => handleChange('license_number', text)}
      />
      <TextInput
        placeholder="Issuing Authority *"
        style={styles.input}
        value={form.license_issuing_authority}
        onChangeText={(text) => handleChange('license_issuing_authority', text)}
      />
      <Text>License Expiry Date *</Text>
      <Button
        title={form.license_expiry_date || 'Select Date'}
        onPress={() => setShowDatePicker(true)}
      />
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
      <TextInput
        placeholder="Years of Experience *"
        style={styles.input}
        keyboardType="numeric"
        value={String(form.years_of_experience)}
        onChangeText={(text) =>
          handleChange('years_of_experience', parseInt(text) || 0)
        }
      />

      <Text style={styles.header}>Education</Text>
      {form.education.map((edu, index) => (
        <View key={index} style={styles.nestedContainer}>
          <TextInput
            placeholder={`Degree ${index + 1}`}
            style={styles.input}
            value={edu.degree}
            onChangeText={(text) =>
              handleNestedChange('education', index, 'degree', text)
            }
          />
          <TextInput
            placeholder={`Institution ${index + 1}`}
            style={styles.input}
            value={edu.institution}
            onChangeText={(text) =>
              handleNestedChange('education', index, 'institution', text)
            }
          />
          <TextInput
            placeholder={`Year ${index + 1}`}
            style={styles.input}
            keyboardType="numeric"
            value={edu.year}
            onChangeText={(text) =>
              handleNestedChange('education', index, 'year', text)
            }
          />
        </View>
      ))}

      <Text style={styles.header}>Certifications</Text>
      {form.certifications.map((cert, index) => (
        <View key={index} style={styles.nestedContainer}>
          <TextInput
            placeholder={`Certification ${index + 1}`}
            style={styles.input}
            value={cert.name}
            onChangeText={(text) =>
              handleNestedChange('certifications', index, 'name', text)
            }
          />
          <TextInput
            placeholder={`Institution ${index + 1}`}
            style={styles.input}
            value={cert.institution}
            onChangeText={(text) =>
              handleNestedChange('certifications', index, 'institution', text)
            }
          />
          <TextInput
            placeholder={`Year ${index + 1}`}
            style={styles.input}
            keyboardType="numeric"
            value={cert.year}
            onChangeText={(text) =>
              handleNestedChange('certifications', index, 'year', text)
            }
          />
        </View>
      ))}

      <Text style={styles.header}>Availability</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Offers Initial Consultation</Text>
        <Switch
          value={form.offers_initial_consultation}
          onValueChange={(val) =>
            handleChange('offers_initial_consultation', val)
          }
        />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Offers Online Sessions</Text>
        <Switch
          value={form.offers_online_sessions}
          onValueChange={(val) =>
            handleChange('offers_online_sessions', val)
          }
        />
      </View>

      <Text style={styles.header}>Contact & Rates</Text>
      <TextInput
        placeholder="Office Address"
        style={styles.input}
        value={form.office_address}
        onChangeText={(text) => handleChange('office_address', text)}
      />
      <TextInput
        placeholder="Website URL"
        style={styles.input}
        value={form.website_url}
        onChangeText={(text) => handleChange('website_url', text)}
      />
      <TextInput
        placeholder="LinkedIn URL"
        style={styles.input}
        value={form.linkedin_url}
        onChangeText={(text) => handleChange('linkedin_url', text)}
      />
      <TextInput
        placeholder="Hourly Rate ($) *"
        style={styles.input}
        keyboardType="numeric"
        value={form.hourly_rate}
        onChangeText={(text) => handleChange('hourly_rate', text)}
      />
      <TextInput
        placeholder="Initial Consultation Rate ($) *"
        style={styles.input}
        keyboardType="numeric"
        value={form.initial_consultation_rate}
        onChangeText={(text) =>
          handleChange('initial_consultation_rate', text)
        }
      />

      <View style={styles.buttonContainer}>
        <Button title="Save Profile" onPress={handleUpdate} color={THEME_COLOR} />
      </View>
    </ScrollView>
  );
};

export default EditProfile;

const THEME_COLOR = '#8C96FF';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  nestedContainer: {
    marginBottom: 12,
  },
});