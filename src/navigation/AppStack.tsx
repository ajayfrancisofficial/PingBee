import { StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import ChatScreen from '../screens/ChatScreen';
import NewChatScreen from '../screens/NewChatScreen';

export const AppStack = createNativeStackNavigator({
  screens: {
    BottomTabs: {
      screen: BottomTabNavigator,
      options: {
        headerShown: false,
      },
    },
    Chat: {
      screen: ChatScreen,
    },
    NewChat: {
      screen: NewChatScreen,
    },
  },
  screenOptions: ({ theme }) => ({
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerShadowVisible: false,
    headerTintColor: theme.colors.primary,
  }),
});

export type AppStackParamList = StaticParamList<typeof AppStack>;
