import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, TouchableOpacity, Image } from 'react-native';
import Frame from '../assets/images/Frame.png';
import Logo from '../assets/images/Logo.png';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  // Separate animations for image and content
  const imageFade = useRef(new Animated.Value(0)).current;
  const imageTranslate = useRef(new Animated.Value(-40)).current;

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(-30)).current;

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Animate image first
    Animated.parallel([
      Animated.timing(imageFade, {
        toValue: 1,
        duration: 700, // faster
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslate, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate content after slight delay
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 1000,
        delay: 200, // small delay after image
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const handleLoginPress = () => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: -200,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/login'); // Navigate AFTER animation finishes
    });
  };

    const handleRegisterPress = () => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: -200,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/register'); // Navigate AFTER animation finishes
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fade.setValue(0);
      slide.setValue(-200);

      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  return (
    <Animated.View style={[styles.container, {
      opacity: fade,
      transform: [{ translateX: slide }]
    }]}>
      <Animated.Image
        source={Frame}
        style={[
          styles.image,
          {
            opacity: imageFade,
            transform: [{ translateY: imageTranslate }],
          },
        ]}
        resizeMode="cover"
      />

      <Animated.View
        style={{
          opacity: contentFade,
          transform: [{ translateY: contentTranslate }],
        }}
      >
        <View>
          <Image source={Logo} style={styles.logo} resizeMode="cover" />
          <Text style={styles.Text}>Kết nối yêu thương</Text>
          <Text style={styles.Text2}>
            Đồng hành cùng con, vững bước tương lai{'\n'}
            Bắt đầu hành trình của bạn ngay hôm nay!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.Button}
          activeOpacity={0.8}
          onPress={handleRegisterPress}
        >
          <Text style={styles.buttonText}>THAM GIA NGAY</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.Text3}>ĐÃ CÓ TÀI KHOẢN? </Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.loginLink}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,         // ✅ Ensure no padding
    margin: 0,          // ✅ Ensure no margin
  },
  image: {
    width: SCREEN_WIDTH,  // ✅ Full screen width
    alignSelf: 'center',   // ⛔ Optional - remove if causing issues
  },
  logo: {
    alignSelf: 'center'
  },
  Text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#A1A4B2',
    textAlign: 'center',
    marginTop: 10,
  },
  Text2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#A1A4B2',
    textAlign: 'center',
    marginTop: 20,
  },
  Button: {
    backgroundColor: '#8E97FD',
    borderRadius: 50,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 30,
    width: SCREEN_WIDTH - 70, // Adjust width as needed
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    color: '#8E97FD',
    fontWeight: 'bold',
  },
  Text3: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#A1A4B2',
    textAlign: 'center',
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

});
