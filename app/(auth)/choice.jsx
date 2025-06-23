import { router } from 'expo-router'; // Make sure you import router if you use expo-router
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Choice = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRolePress = (role) => {
    setSelectedRole((prev) => (prev === role ? null : role)); // Toggle selection
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bạn là</Text>

      <Pressable
        style={[
          styles.option,
          selectedRole === 'parent' && styles.selectedOption,
        ]}
        onPress={() => handleRolePress('parent')}
      >
        <Text style={styles.optionText}>Phụ huynh</Text>
      </Pressable>

      <Pressable
        style={[
          styles.option,
          selectedRole === 'psychologist' && styles.selectedOption,
        ]}
        onPress={() => handleRolePress('psychologist')}
      >
        <Text style={styles.optionText}>Chuyên gia tâm lý</Text>
      </Pressable>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.Button,
            !selectedRole && { opacity: 0.5 }, // Disable visual
          ]}
          activeOpacity={selectedRole ? 0.8 : 1}
          onPress={() => {
                if (selectedRole === 'parent') {
                router.replace('/(parent)/home');
                } else if (selectedRole === 'psychologist') {
                router.push('/payment');
                }
            }}
          disabled={!selectedRole} // Disable if no role selected
        >
          <Text style={styles.buttonText}>Tiếp Theo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Choice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 150,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  option: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#f2f2f2',
  },
  selectedOption: {
    backgroundColor: '#8E97FD',
    borderColor: '#8E97FD',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 60,
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  Button: {
    backgroundColor: '#8E97FD',
    borderRadius: 50,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 100,
    width: SCREEN_WIDTH - 70,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
