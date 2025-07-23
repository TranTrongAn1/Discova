import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../(auth)/api';
const SubmitChildProfile = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    gender: '',
    date_of_birth: '',
    height_cm: '',
    weight_kg: '',
    health_status: '',
    medical_history: '',
    vaccination_status: false,
    emotional_issues: '',
    social_behavior: '',
    developmental_concerns: '',
    family_peer_relationship: '',
    has_seen_psychologist: false,
    has_received_therapy: false,
    parental_goals: '',
    activity_tips: '',
    parental_notes: '',
    primary_language: '',
    school_grade_level: '',
    profile_picture_url: '',
    consent_forms_signed: {},
  });

  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [childId, setChildId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const pickImageAndUpload = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.status !== 'granted') {
    Alert.alert('Permission required', 'Please allow access to your media library');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Perfect 1:1 aspect ratio
    quality: 1, // Good quality
    base64: false,
    allowsMultipleSelection: false,
  });

  if (!result.canceled) {
    const image = result.assets[0];
    // Resize to 736x736
    const manipulated = await ImageManipulator.manipulateAsync(
      image.uri,
      [{ resize: { width: 736, height: 736 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    console.log('Resized child image:', manipulated.uri);
    
    const formData = new FormData();
    formData.append('file', {
      uri: manipulated.uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });
    formData.append('upload_preset', 'converts'); // Use your Cloudinary preset

    try {
      console.log('Uploading child image to Cloudinary...');
      const res = await fetch('https://api.cloudinary.com/v1_1/du7snch3r/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('Child Cloudinary response:', data);
      
      if (data.secure_url) {
        console.log('Setting child image URL:', data.secure_url);
        setForm((prev) => ({ ...prev, profile_picture_url: data.secure_url }));
        setHasUnsavedChanges(true);
        
        // Generate face embedding for child profile
        console.log('Generating face embedding for child...');
        try {
          const embeddingResponse = await api.post('/api/parents/profile/generate-face-embedding/', {
            force_regenerate: true
          });
          console.log('Child face embedding generation response:', embeddingResponse.data);
        } catch (embeddingError) {
          console.error('Child face embedding generation failed:', embeddingError);
        }
        
        Alert.alert('✅ Image uploaded successfully', 'Please click "Save Changes" to save the image');
      } else {
        console.error('No secure_url in child response:', data);
        Alert.alert('❌ Error', 'Image upload failed - no URL returned');
      }
    } catch (err) {
      console.error('Child upload failed:', err);
      Alert.alert('❌ Error', 'Image upload failed');
    }
  }
};
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found');
          return;
        }

        const res = await api.get(`/api/children/profile/my_children/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        // Handle different possible response structures
        let children = [];
        if (res.data.children) {
          children = res.data.children;
        } else if (res.data.results) {
          children = res.data.results;
        } else if (Array.isArray(res.data)) {
          children = res.data;
        }

        if (children.length > 0) {
          // Find the first child with valid data (not corrupted)
          let validChild = null;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const firstName = child.first_name;
            const lastName = child.last_name;

            // Check if this child has valid data (not API endpoints)
            if (firstName && lastName &&
                !firstName.includes('/api/') &&
                !lastName.includes('/api/') &&
                firstName !== '/api/children/profile/' &&
                lastName !== '/api/children/profile/') {
              validChild = child;
              break;
            }
          }

          if (validChild) {
            // Clean the child data to remove any API endpoints or unwanted fields
            const cleanChild = {};
            Object.keys(validChild).forEach(key => {
              const value = validChild[key];
              // Check if it's an API endpoint or corrupted data
              if (typeof value === 'string' && (
                value.startsWith('http') && value.includes('api') ||
                value === '/api/children/profile/' ||
                value.includes('/api/children/profile/')
              )) {
                cleanChild[key] = '';
              } else {
                cleanChild[key] = value;
              }
            });

            setForm(cleanChild);
            setChildId(cleanChild.id);
            setMode('view');
          } else {
            setMode('create');
          }
        } else {
          setMode('create');
        }
              } catch (err) {
          console.error('Error fetching child profile:', err);
          // Reset form to prevent old corrupted data from persisting
          setForm({
            first_name: '',
            last_name: '',
            nickname: '',
            gender: '',
            date_of_birth: '',
            height_cm: '',
            weight_kg: '',
            health_status: '',
            medical_history: '',
            vaccination_status: false,
            emotional_issues: '',
            social_behavior: '',
            developmental_concerns: '',
            family_peer_relationship: '',
            has_seen_psychologist: false,
            has_received_therapy: false,
            parental_goals: '',
            activity_tips: '',
            parental_notes: '',
            primary_language: '',
            school_grade_level: '',
            profile_picture_url: '',
            consent_forms_signed: {},
          });
          setMode('create');
        }
    };
    fetchProfile();
  }, []);


  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setHasUnsavedChanges(true);
  };
        const handleSubmit = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            console.warn('No token found');
            return;
          }

          const payload = { ...form };

                  if (mode === 'edit') {
          await api.patch(`/api/children/profile/${childId}/`, payload, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          Alert.alert('Success', 'Profile updated.');
          setMode('view');
          setHasUnsavedChanges(false);
        } else {
          await api.post('/api/children/profile/', payload, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          Alert.alert('Success', 'Profile created!');
          setMode('view');
          setHasUnsavedChanges(false);
        }
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Could not submit profile.');
        }
      };

        const renderField = (label, key, isNumeric = false, isBool = false) => {
        let displayLabel = label;
        if (key === 'date_of_birth') {
          displayLabel += ' (YYYY-MM-DD)';  // Add format hint to label
        }

        // Helper function to safely get field value
        const getFieldValue = (fieldKey) => {
          const value = form[fieldKey];

          if (value === null || value === undefined || value === '') {
            return '';
          }
          // Check if it's an API endpoint or corrupted data
          if (typeof value === 'string' && (
            value.startsWith('http') && value.includes('api') ||
            value === '/api/children/profile/' ||
            value.includes('/api/children/profile/')
          )) {
            return '';
          }
          return value.toString();
        };

        if (mode === 'view') {
          const fieldValue = getFieldValue(key);
          return (
            <View style={styles.readOnlyField}>
              <Text style={styles.label}>{displayLabel}</Text>
              <Text style={styles.value}>{fieldValue || '—'}</Text>
            </View>
          );
        }
        return (
          <>
            <Text style={styles.label}>{displayLabel}</Text>
            <TextInput
              style={styles.input}
              value={getFieldValue(key)}
              onChangeText={(text) => {
                // Remove special formatting for date_of_birth
                handleChange(key, isBool ? text === 'true' : isNumeric ? Number(text) : text);
              }}
              keyboardType={isNumeric ? 'numeric' : 'default'}
              placeholder={key === 'date_of_birth' ? 'YYYY-MM-DD' : ''}
            />
          </>
        );
      };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {mode === 'view' ? 'Child Profile' : mode === 'edit' ? 'Edit Profile' : 'Create Child Profile'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mode === 'create' && (
          <View style={styles.createPrompt}>
            <Text style={styles.createPromptTitle}>No child profile found</Text>
            <Text style={styles.createPromptText}>
              You need to create a child profile before you can view and edit information.
              Please fill in the information below to create your first profile.
            </Text>
          </View>
        )}

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.imageUploadButton} onPress={pickImageAndUpload}>
            {form.profile_picture_url ? (
              <Image
                source={{ uri: form.profile_picture_url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>+</Text>
              </View>
            )}
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Add Image</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.fieldGroup}>
              {renderField('First Name', 'first_name')}
              {renderField('Last Name', 'last_name')}
              {renderField('Nickname', 'nickname')}
              {renderField('Gender', 'gender')}
              {renderField('Date of Birth', 'date_of_birth')}
            </View>
          </View>

          {/* Physical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Physical Information</Text>
            <View style={styles.fieldGroup}>
              {renderField('Height (cm)', 'height_cm', true)}
              {renderField('Weight (kg)', 'weight_kg', true)}
              {renderField('Health Status', 'health_status')}
            </View>
          </View>

          {/* Medical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.fieldGroup}>
              {renderField('Medical History', 'medical_history')}
              {renderField('Emotional Issues', 'emotional_issues')}
              {renderField('Social Behavior', 'social_behavior')}
              {renderField('Developmental Concerns', 'developmental_concerns')}
            </View>
          </View>

          {/* Social & Educational */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social & Educational</Text>
            <View style={styles.fieldGroup}>
              {renderField('Family/Peer Relationship', 'family_peer_relationship')}
              {renderField('Primary Language', 'primary_language')}
              {renderField('Current Grade Level', 'school_grade_level')}
            </View>
          </View>

          {/* Goals & Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals & Notes</Text>
            <View style={styles.fieldGroup}>
              {renderField('Parental Goals', 'parental_goals')}
              {renderField('Activity Tips', 'activity_tips')}
              {renderField('Other Notes', 'parental_notes')}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {mode === 'view' ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.editButton} onPress={() => setMode('edit')}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            {hasUnsavedChanges && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>
              {mode === 'create' ? 'Create Profile' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SubmitChildProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9ff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  backButtonText: {
    fontSize: 15,
    color: '#6c63ff',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  createPrompt: {
    backgroundColor: '#f8f9ff',
    padding: 20,
    borderRadius: 16,
    margin: 24,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  createPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 8,
  },
  createPromptText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 22,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageUploadButton: {
    position: 'relative',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#e8eaff',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8eaff',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 32,
    color: '#6c63ff',
    fontWeight: '300',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#6c63ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#6c63ff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldGroup: {
    gap: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#4a5568',
    fontSize: 14,
  },
  value: {
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    color: '#2d3748',
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#2d3748',
  },
  readOnlyField: {
    marginBottom: 8,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6c63ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flex: 1,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6c63ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flex: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
