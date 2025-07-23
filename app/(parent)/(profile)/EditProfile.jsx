import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../(auth)/api';

const EditProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
const [imageUrl, setImageUrl] = useState('');

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
      console.log('Resized image:', manipulated.uri);
      
      const formData = new FormData();
      formData.append('file', {
        uri: manipulated.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
      formData.append('upload_preset', 'converts'); // Use your Cloudinary preset

      try {
        console.log('Uploading to Cloudinary...');
        const res = await fetch('https://api.cloudinary.com/v1_1/du7snch3r/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        console.log('Cloudinary response:', data);
        
        if (data.secure_url) {
          console.log('Setting image URL:', data.secure_url);
          setImageUrl(data.secure_url);
          
          // Generate face embedding after successful upload
          console.log('Generating face embedding...');
          await generateFaceEmbedding();
          
          Alert.alert('✅ Image uploaded successfully', 'Please click "Save Changes" to save the image');
        } else {
          console.error('No secure_url in response:', data);
          Alert.alert('❌ Error', 'Image upload failed - no URL returned');
        }
      } catch (err) {
        console.error('Upload failed:', err);
        Alert.alert('❌ Error', 'Image upload failed');
      }
    }
  };

  // Add function to generate face embedding
  const generateFaceEmbedding = async () => {
    try {
      console.log('Starting face embedding generation...');
      const response = await api.post('/api/parents/profile/generate-face-embedding/', {
        force_regenerate: true
      });
      console.log('Face embedding generation response:', response.data);
      return true;
    } catch (error) {
      console.error('Face embedding generation failed:', error);
      return false;
    }
  };

  // Populate the inputs when component mounts and params are available
useEffect(() => {
  if (params && Object.keys(params).length > 0) {
    setFirstName(String(params.first_name || ''));
    setLastName(String(params.last_name || ''));
    setPhoneNumber(String(params.phone || ''));
    setAddress1(String(params.address_line1 || ''));
    setAddress2(String(params.address_line2 || ''));
     setImageUrl(String(params.profile_picture_url || ''));
  }
}, []); // Remove params from dependency array

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await api.patch(
        'api/parents/profile/update_profile/',
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address_line1: address1,
          address_line2: address2,
          profile_picture_url: imageUrl, // Include the image URL
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      Alert.alert('✅ Success', 'Information updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      let errorMsg = 'Could not update information.';
      if (error.response?.data?.error && error.response.data.error.includes('face')) {
        errorMsg = 'Could not upload profile image. Your image is not accepted by the system. Please try again with a different image. If you still encounter an error, please contact support. (Note: You can choose any image, not necessarily a face image)';
      }
      Alert.alert('❌ Error', errorMsg);
    }
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
        
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}
            
            <TouchableOpacity onPress={pickImageAndUpload} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#a0a0a0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#a0a0a0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#a0a0a0"
            />
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>House Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter house number"
              value={address1}
              onChangeText={setAddress1}
              placeholderTextColor="#a0a0a0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address details"
              value={address2}
              onChangeText={setAddress2}
              placeholderTextColor="#a0a0a0"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  imageSection: {
    backgroundColor: '#fff',
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e8eaff',
    backgroundColor: '#f8f9ff',
    marginBottom: 16,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e8eaff',
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#6c63ff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  formSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2d3748',
  },
  saveContainer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
