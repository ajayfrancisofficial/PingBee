import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { Platform } from 'react-native';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { YouScreen } from '../screens/YouScreen';
import { BottomTabParamList } from '../types/navigation';

export const BottomTabNavigator =
  createNativeBottomTabNavigator<BottomTabParamList>({
    screens: {
      Status: {
        screen: StatusScreen,
        options: {
          tabBarIcon: () =>
            Platform.select({
              ios: { type: 'sfSymbol', name: 'circle.dashed' },
              default: undefined as any,
            }),
        },
      },
      Calls: {
        screen: CallsScreen,
        options: {
          tabBarIcon: ({ focused }) =>
            Platform.select({
              ios: { type: 'sfSymbol', name: focused ? 'phone.fill' : 'phone' },
              default: undefined as any,
            }),
        },
      },
      Chats: {
        screen: ChatsScreen,
        options: {
          tabBarIcon: ({ focused }) =>
            Platform.select({
              ios: {
                type: 'sfSymbol',
                name: focused ? 'message.fill' : 'message',
              },
              default: undefined as any,
            }),
          tabBarBadge: 1,
          //use unread mssges count
        },
      },
      You: {
        screen: YouScreen,
        options: {
          title: 'You',
          tabBarIcon: ({ focused }) =>
            Platform.select({
              ios: {
                type: 'sfSymbol',
                name: focused ? 'person.fill' : 'person',
              },
              default: undefined as any,
            }),
        },
      },
    },
    screenOptions: { headerShown: true, tabBarLabelVisibilityMode: 'selected' },
  });
