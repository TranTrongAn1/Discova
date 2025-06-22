import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api, { checkPsychologistProfile } from '../(auth)/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enhanced FormField component with better styling
const FormField = React.memo(({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default', icon }) => (
  <View style={styles.formField}>
    <View style={styles.labelContainer}>
      {icon && <Ionicons name={icon} size={20} color="#6c63ff" style={styles.fieldIcon} />}
      <Text style={styles.formLabel}>{label}</Text>
    </View>
    <TextInput
      style={[styles.formInput, multiline && styles.formInputMultiline]}
      value={value || ''}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType={multiline ? 'default' : 'next'}
      blurOnSubmit={!multiline}
    />
  </View>
));

const Profile = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedValue] = useState(new Animated.Value(1));
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Animated spinner
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    biography: '',
    years_of_experience: '',
    license_number: '',
    license_issuing_authority: '',
    license_expiry_date: '',
    office_address: '',
    website_url: '',
    linkedin_url: '',
    hourly_rate: '',
    initial_consultation_rate: '',
    offers_initial_consultation: true,
    offers_online_sessions: true,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = await AsyncStorage.getItem('access_token');
      const userType = await AsyncStorage.getItem('user_type');

      console.log('=== PROFILE DEBUG START ===');
      console.log('Token exists:', !!token);
      console.log('User type:', userType);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');

      if (!token) {
        console.log('No token found - user not authenticated');
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching psychologist profile...');
      const profileData = await checkPsychologistProfile();

      if (profileData) {
        console.log('Profile found:', profileData);
        console.log('Profile keys:', Object.keys(profileData));
        
        // Check verification status
        if (profileData.verification_status === 'Pending') {
          // User needs to pay first
          Alert.alert(
            'Payment Required',
            'You need to complete the registration payment before creating your profile.',
            [
              { 
                text: 'Pay Now', 
                onPress: () => router.replace('/(auth)/psychologistPayment') 
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          setLoading(false);
          return;
        }
        
        if (profileData.verification_status === 'Rejected') {
          Alert.alert(
            'Verification Rejected',
            'Your verification has been rejected. Please contact support.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          setLoading(false);
          return;
        }
        
        setProfile(profileData);
        setProfilePhoto(profileData.profile_picture_url);
        // Pre-fill form with existing data
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          biography: profileData.biography || '',
          years_of_experience: profileData.years_of_experience?.toString() || '',
          license_number: profileData.license_number || '',
          license_issuing_authority: profileData.license_issuing_authority || '',
          license_expiry_date: profileData.license_expiry_date || '',
          office_address: profileData.office_address || '',
          website_url: profileData.website_url || '',
          linkedin_url: profileData.linkedin_url || '',
          hourly_rate: profileData.hourly_rate || '',
          initial_consultation_rate: profileData.initial_consultation_rate || '',
          offers_initial_consultation: profileData.offers_initial_consultation ?? true,
          offers_online_sessions: profileData.offers_online_sessions ?? true,
        });
      } else {
        console.log('No profile found - user needs to create one');
        setProfile(null); // Explicitly set to null to show create profile screen
      }

      setLoading(false);
      console.log('=== PROFILE DEBUG END ===');
    } catch (err) {
      console.error('Profile fetch failed:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      setLoading(false);

      // Only show error alert for actual errors, not for missing profiles
      if (err.response?.status !== 404) {
        const errorMessage = err.response?.data?.detail || 'Could not fetch profile data.';
        console.error('Setting error:', errorMessage);
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } else {
        // 404 means no profile exists - this is normal, not an error
        console.log('404 error - no profile exists, showing create profile screen');
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const profileData = {
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || null,
        initial_consultation_rate: parseFloat(formData.initial_consultation_rate) || null,
      };

      console.log('Saving profile data:', profileData);

      const response = await api.patch('/api/psychologists/profile/update_profile/', profileData);

      console.log('Profile saved successfully:', response.data);

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);

      // Refresh profile data
      await fetchProfile();

    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        biography: profile.biography || '',
        years_of_experience: profile.years_of_experience?.toString() || '',
        license_number: profile.license_number || '',
        license_issuing_authority: profile.license_issuing_authority || '',
        license_expiry_date: profile.license_expiry_date || '',
        office_address: profile.office_address || '',
        website_url: profile.website_url || '',
        linkedin_url: profile.linkedin_url || '',
        hourly_rate: profile.hourly_rate || '',
        initial_consultation_rate: profile.initial_consultation_rate || '',
        offers_initial_consultation: profile.offers_initial_consultation ?? true,
        offers_online_sessions: profile.offers_online_sessions ?? true,
      });
    }
  };

  const handleCreateProfile = () => {
    navigation.navigate('EditProfile', { profile: {} });
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

  // Photo upload functions - File upload approach
  const pickImageAndUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your media library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
      formData.append('upload_preset', 'converts');

      try {
        setUploadingPhoto(true);
        const res = await fetch('https://api.cloudinary.com/v1_1/du7snch3r/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        
        // Update profile with the new image URL
        await updateProfilePhotoUrl(data.secure_url);
      } catch (err) {
        console.error('Upload failed:', err);
        Alert.alert('❌ Error', 'Failed to upload image');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const updateProfilePhotoUrl = async (photoUrl) => {
    try {
      setUploadingPhoto(true);
      
      // Validate URL format
      if (!photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
        Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
        return;
      }
      
      console.log('Updating profile photo URL:', photoUrl);
      
      const response = await api.patch('/api/psychologists/profile/update_profile/', {
        profile_picture_url: photoUrl
      });

      console.log('Profile photo URL updated successfully:', response.data);
      
      // Update local state
      setProfilePhoto(photoUrl);
      
      if (profile) {
        setProfile(prev => ({
          ...prev,
          profile_picture_url: photoUrl
        }));
      }

      Alert.alert('Success', 'Profile photo URL updated successfully!');
    } catch (error) {
      console.error('Error updating photo URL:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update photo URL. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContent}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              { transform: [{ rotate: spin }] }
            ]}
          />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  // Show create profile screen if no profile exists
  if (!profile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="person-add" size={60} color="#6c63ff" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to K&M Discova</Text>
            <Text style={styles.welcomeSubtitle}>
              Create your professional profile to connect with families and start your journey as a trusted psychologist
          </Text>
          </View>
          
          <Animated.View style={{ transform: [{ scale: animatedValue }], width: '100%' }}>
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                pressed && { opacity: 0.9 },
              ]}
              onPressIn={animatePressIn}
              onPressOut={animatePressOut}
              onPress={handleCreateProfile}
            >
              <LinearGradient
                colors={['#6c63ff', '#8e8dfa']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add-circle" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.createButtonText}>Create Your Profile</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Show error screen if there was an actual error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.errorContent}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <Ionicons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.profileAvatarContainer} 
              onPress={pickImageAndUpload}
              disabled={uploadingPhoto}
              activeOpacity={0.7}
            >
              {(profilePhoto || profile.profile_picture_url) ? (
                <Image 
                  source={{ 
                    uri: (() => {
                      // Check if profilePhoto is valid
                      if (typeof profilePhoto === 'string' && profilePhoto !== '[object Object]' && profilePhoto.startsWith('http')) {
                        return profilePhoto;
                      }
                      // Check if profile.profile_picture_url is valid
                      if (typeof profile.profile_picture_url === 'string' && 
                          profile.profile_picture_url !== '[object Object]' && 
                          profile.profile_picture_url.startsWith('http')) {
                        return profile.profile_picture_url;
                      }
                      // Check if it's an object with URL properties
                      if (typeof profile.profile_picture_url === 'object' && profile.profile_picture_url !== null) {
                        return profile.profile_picture_url.url || profile.profile_picture_url.uri || profile.profile_picture_url.src;
                      }
                      return null;
                    })()
                  }} 
                  style={styles.profileAvatarImage} 
                />
              ) : (
                <View style={styles.profileAvatar}>
                  <Text style={styles.avatarText}>
                    {profile.first_name?.[0] || 'P'}{profile.last_name?.[0] || 'S'}
                  </Text>
                </View>
              )}
              {console.log('profilePhoto state:', profilePhoto)}
              {console.log('profile.profile_picture_url:', profile.profile_picture_url)}
              {console.log('profile.profile_picture_url type:', typeof profile.profile_picture_url)}
              {console.log('Final image URI:', typeof profilePhoto === 'string' ? profilePhoto : 
                           typeof profile.profile_picture_url === 'string' ? profile.profile_picture_url :
                           profile.profile_picture_url?.url || profile.profile_picture_url?.uri || profile.profile_picture_url?.src)}
              {uploadingPhoto && (
                <View style={styles.uploadOverlay}>
                  <Animated.View
                    style={[
                      styles.uploadSpinner,
                      { transform: [{ rotate: spin }] }
                    ]}
                  />
                </View>
              )}
              <View style={styles.photoUploadIndicator}>
                <Ionicons name="link" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.profileName}>
                {profile.first_name} {profile.last_name}
              </Text>
              <Text style={styles.profileTitle}>Licensed Psychologist</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#ffd700" />
                <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
              </View>
            </View>
            {!isEditing && (
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Ionicons name="create" size={20} color="#6c63ff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isEditing ? (
          // Edit Mode
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit Profile</Text>
              <Text style={styles.editSubtitle}>Update your professional information</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <FormField
                  label="First Name"
                  value={formData.first_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
                  placeholder="Enter your first name"
                  icon="person"
                />

                <FormField
                  label="Last Name"
                  value={formData.last_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
                  placeholder="Enter your last name"
                  icon="person"
                />

                <FormField
                  label="Biography"
                  value={formData.biography}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, biography: text }))}
                  placeholder="Tell us about your professional background, approach, and expertise..."
                  multiline={true}
                  icon="document-text"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Professional Credentials</Text>
                <FormField
                  label="Years of Experience"
                  value={formData.years_of_experience}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, years_of_experience: text }))}
                  placeholder="Enter number of years"
                  keyboardType="numeric"
                  icon="time"
                />

                <FormField
                  label="License Number"
                  value={formData.license_number}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, license_number: text }))}
                  placeholder="Enter your license number"
                  icon="shield-checkmark"
                />

                <FormField
                  label="License Issuing Authority"
                  value={formData.license_issuing_authority}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, license_issuing_authority: text }))}
                  placeholder="Enter issuing authority"
                  icon="business"
                />

                <FormField
                  label="License Expiry Date"
                  value={formData.license_expiry_date}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, license_expiry_date: text }))}
                  placeholder="YYYY-MM-DD"
                  icon="calendar"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Contact & Location</Text>
                <FormField
                  label="Office Address"
                  value={formData.office_address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, office_address: text }))}
                  placeholder="Enter your office address"
                  multiline={true}
                  icon="location"
                />

                <FormField
                  label="Website URL"
                  value={formData.website_url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, website_url: text }))}
                  placeholder="https://your-website.com"
                  keyboardType="url"
                  icon="globe"
                />

                <FormField
                  label="LinkedIn URL"
                  value={formData.linkedin_url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, linkedin_url: text }))}
                  placeholder="https://linkedin.com/in/your-profile"
                  keyboardType="url"
                  icon="logo-linkedin"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <FormField
                  label="Hourly Rate (USD)"
                  value={formData.hourly_rate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, hourly_rate: text }))}
                  placeholder="Enter hourly rate"
                  keyboardType="decimal-pad"
                  icon="card"
                />

                <FormField
                  label="Initial Consultation Rate (USD)"
                  value={formData.initial_consultation_rate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, initial_consultation_rate: text }))}
                  placeholder="Enter consultation rate"
                  keyboardType="decimal-pad"
                  icon="card"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
          </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // View Mode
          <View style={styles.profileContent}>
            {/* About Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={24} color="#6c63ff" />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.bioText}>{profile.biography || 'No biography available.'}</Text>
            </View>

            {/* Experience & Credentials */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="school" size={24} color="#6c63ff" />
                <Text style={styles.sectionTitle}>Experience & Credentials</Text>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Experience</Text>
                  <Text style={styles.infoValue}>{profile.years_of_experience || 0} years</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>License</Text>
                  <Text style={styles.infoValue}>{profile.license_number || 'Not specified'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Authority</Text>
                  <Text style={styles.infoValue}>{profile.license_issuing_authority || 'Not specified'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Expiry</Text>
                  <Text style={styles.infoValue}>{profile.license_expiry_date || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card" size={24} color="#6c63ff" />
                <Text style={styles.sectionTitle}>Pricing</Text>
              </View>
              <View style={styles.pricingContainer}>
                <View style={styles.pricingItem}>
                  <Text style={styles.pricingLabel}>Hourly Rate</Text>
                  <Text style={styles.pricingValue}>${profile.hourly_rate || 'Not set'}</Text>
                </View>
                <View style={styles.pricingItem}>
                  <Text style={styles.pricingLabel}>Initial Consultation</Text>
                  <Text style={styles.pricingValue}>${profile.initial_consultation_rate || 'Not set'}</Text>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="call" size={24} color="#6c63ff" />
                <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
              <View style={styles.contactList}>
                {profile.office_address && (
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={20} color="#6c63ff" />
                    <Text style={styles.contactText}>{profile.office_address}</Text>
          </View>
                )}
                {profile.website_url && (
                  <View style={styles.contactItem}>
                    <Ionicons name="globe" size={20} color="#6c63ff" />
                    <Text style={styles.contactText}>{profile.website_url}</Text>
          </View>
                )}
                {profile.linkedin_url && (
                  <View style={styles.contactItem}>
                    <Ionicons name="logo-linkedin" size={20} color="#6c63ff" />
                    <Text style={styles.contactText}>{profile.linkedin_url}</Text>
          </View>
                )}
          </View>
          </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#6c63ff',
    borderBottomColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#6c63ff',
    fontWeight: '600',
  },
  welcomeContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  createButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6c63ff',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 12px rgba(108, 99, 255, 0.3)',
      },
    }),
  },
  createButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatarContainer: {
    position: 'relative',
    marginRight: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: {
    padding: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
    shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
      },
      android: {
    elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginLeft: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6c63ff',
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 12,
    flex: 1,
  },
  editContainer: {
    padding: 24,
  },
  editHeader: {
    marginBottom: 24,
  },
  editTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  editSubtitle: {
    fontSize: 16,
    color: '#718096',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  formSection: {
    marginBottom: 32,
  },
  formField: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  formInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
    backgroundColor: '#fff',
    minHeight: 50,
    ...Platform.select({
      ios: {
    shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  formInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  saveButton: {
    backgroundColor: '#6c63ff',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#fff',
    borderBottomColor: 'transparent',
  },
  photoUploadIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});