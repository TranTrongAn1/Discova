import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
const childInfo = {
  name: 'Nguyễn Văn A',
  dateOfBirth: '01/01/2020',
  gender: 'Nam',
  nickname: 'Bé A',
  height: '100 cm',
  weight: '15 kg',
  healthStatus: 'Khỏe mạnh',  
  medicalHistory: 'Không có',
  vaccinationStatus: 'Đã tiêm chủng đầy đủ',
  question: ["Bé có biết đi chưa?", "Bé có biết nói chưa?", "Bé có biết tự ăn chưa?"],
  answer: ["Bé đã biết đi", "Bé đã biết nói", "Bé có thể tự ăn một số món đơn giản"],
}
const childRecord = () => {
  return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <Text style={styles.text}>Hồ sơ của bé</Text>
      <Text style={styles.text1}>Thông tin cá nhân</Text>
      <View style={styles.infoContainer}>
      <Text style={styles.label}>
        <Text style={styles.info}>Họ và tên: </Text> {childInfo.name}
      </Text>
       <Text style={styles.label}>
        <Text style={styles.info}>Ngày Sinh: </Text> {childInfo.dateOfBirth}
        </Text>
        <Text style={styles.label}>
        <Text style={styles.info}>Giới tính:</Text> {childInfo.gender}
        </Text>
        <Text style={styles.label}>
        <Text style={styles.info}>Tên gọi ở nhà: </Text> {childInfo.nickname}
        </Text>
      </View>
      <Text style={styles.text1}>Thông tin sức khoẻ & phát triển</Text>
      <View style={styles.infoContainer}>
      <Text style={styles.label}>
        <Text style={styles.info}>Chiều cao, cân nặng: </Text> {childInfo.height} - {childInfo.weight}
      </Text>
       <Text style={styles.label}>
        <Text style={styles.info}>Tình trạng sức khỏe chung: </Text> {childInfo.healthStatus}
        </Text>
        <Text style={styles.label}>
        <Text style={styles.info}>Tiền sử bệnh lý:</Text> {childInfo.medicalHistory}
        </Text>
        <Text style={styles.label}>
        <Text style={styles.info}>Tiêm chủng đầy đủ chưa?: </Text> {childInfo.vaccinationStatus}
        </Text>
      </View>
       <Text style={styles.text1}>Hành vi & phát triển tâm lý</Text>
      <View style={styles.infoContainer}>
          {childInfo.question.map((question, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={styles.info}>Câu hỏi: {question}</Text>
              <Text style={styles.label}>Trả lời: {childInfo.answer[index]}</Text>
            </View>
          ))}
      </View>
    </View>
  </ScrollView>
  )
}

export default childRecord

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
    scrollContainer: {
      paddingBottom: 40, // So nothing is cut off at the bottom
      backgroundColor: '#fff',
    },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  text1: {
    fontSize: 20,
    color: '#A1A4B2',
    marginLeft: 10,
    marginTop: 20,
    fontWeight: 'italic',
    fontFamliy: 'Helvetica Neue',
  },
  info: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
    fontWeight: 'bold',
    marginLeft: 10,

  },
  infoContainer: {
    marginLeft: 10,
    marginTop: 10,
    padding: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  label: {
    fontFamily: 'Helvetica Neue',
    marginBottom: 20,
    color: '#333',
  },
})