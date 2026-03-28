import { StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import ChatScreen from '../screens/ChatScreen';

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
  },
});

export type AppStackParamList = StaticParamList<typeof AppStack>;
