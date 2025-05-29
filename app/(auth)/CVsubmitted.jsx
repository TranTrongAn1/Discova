import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const UploadCV = () => {
  const [cvFile, setCvFile] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setCvFile(file);
        console.log('Selected file:', file);
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Lỗi', 'Không thể chọn file.');
    }
  };

  const submitCV = () => {
    if (!cvFile) {
      Alert.alert('Chưa chọn CV', 'Vui lòng chọn file CV (PDF) trước khi gửi.');
      return;
    }

    // TODO: Upload logic (e.g. Firebase, your backend API)
    Alert.alert('Đã gửi!', 'CV của bạn đã được gửi thành công.');
    console.log('Uploading file:', cvFile);
    router.push('/congratulations')
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nộp CV</Text>

      <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
        <Ionicons name="document-attach-outline" size={20} color="#4f46e5" />
        <Text style={styles.pickText}>Chọn file PDF</Text>
      </TouchableOpacity>

      {cvFile && (
        <View style={styles.fileBox}>
          <Ionicons name="document-text-outline" size={20} color="#555" />
          <Text style={styles.fileName}>{cvFile.name}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={submitCV}>
        <Text style={styles.submitText}>Gửi CV</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UploadCV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#4f46e5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  pickText: {
    color: '#4f46e5',
    marginLeft: 8,
    fontWeight: '600',
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
