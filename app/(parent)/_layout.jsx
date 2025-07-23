import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParentLayout() {
  const insets = useSafeAreaInsets();
  
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
                backgroundColor: focused ? '#6c63ff' : 'transparent',
                width: 50,
                height: 50,
                borderRadius: 15,
                marginBottom: 15,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: focused ? '#6c63ff' : 'transparent',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: focused ? 0.3 : 0,
                shadowRadius: 4,
                elevation: focused ? 4 : 0,
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
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 110 : 100,
          paddingTop: 15,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom + 10, 30) : Math.max(insets.bottom + 10, 20),
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
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home',   }}/>
      <Tabs.Screen name="chat" options={{ title: 'Chat',   }}/>
      <Tabs.Screen name="calendar" options={{ title: 'Book',   }}/>
      <Tabs.Screen name="communication" options={{ title: 'Community',   }}/>
      <Tabs.Screen name="(profile)" options={{ title: 'Profile', unmountOnBlur: true }}/>
    </Tabs>
  );
}
