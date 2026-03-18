import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import ChatScreen from '../screens/ChatScreen';
import { AppStackParamList } from '../types/navigation';

export const AppStack = createNativeStackNavigator<AppStackParamList>({
  screens: {
    BottomTabs: {
      screen: BottomTabNavigator,
      options: {
        headerShown: false,
      },
    },
    Chat: {
      screen: ChatScreen,
      options: ({ route }) => ({
        title: route.params.name,
        headerBackTitle: 'Chats',
      }),
    },
  },
});

