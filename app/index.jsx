import { Image, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import Frame from '../assets/images/Frame.png';
import Logo from '../assets/images/Logo.png';
import { Button } from '@react-navigation/elements';
import { Link, router } from 'expo-router';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image source={Frame} style={styles.image} resizeMode="cover" />
      <Image source={Logo} style={styles.logo} resizeMode="cover" />
      <Text style={styles.Text}> Kết nối yêu thương </Text>
      <Text style={styles.Text2}> Đồng hành cùng con, vững bước tương lai {"\n"}
        Bắt đầu hành trình của bạn ngay hôm nay! 
      </Text>
      <TouchableOpacity style={styles.Button} activeOpacity={0.8} onPress={() => {}}>
        <Text style={styles.buttonText}>THAM GIA NGAY</Text>
      </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.Text3}>ĐÃ CÓ TÀI KHOẢN? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>
        </View>
    </View>
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
