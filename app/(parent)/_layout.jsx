import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'chat':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'communication':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case '(profile)':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return (
              <View
              style={{
                backgroundColor: focused ? '#8E97FD' : 'transparent',
                width: 50,
                height: 50,
                borderRadius: 15,
                marginBottom: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={focused ? 'white' : '#A0A0A0'} // <-- manual color fix
              />
            </View>
         );

        },
        tabBarActiveTintColor: '#8D86F8',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          height: 100,
          paddingTop: 30,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'home',   }}/>
      <Tabs.Screen name="chat" options={{ title: 'chat',   }}/>
      <Tabs.Screen name="calendar" options={{ title: 'đặt lịch',   }}/>
      <Tabs.Screen name="communication" options={{ title: 'cộng đồng',   }}/>
      <Tabs.Screen name="(profile)" options={{ title: 'hồ sơ', unmountOnBlur: true }}/>
    </Tabs>
  );
}
