import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { Platform, Text, View } from 'react-native';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { YouStack } from './YouStack';
import { BottomTabParamList } from '../types/navigation';

export const BottomTabNavigator =
  createNativeBottomTabNavigator<BottomTabParamList>({
    initialRouteName: 'Chats',
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
      YouStack: {
        screen: YouStack,
        options: {
          title: 'You',
          headerShown: false,
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
    screenOptions: ({ theme }) => ({
      headerShown: true,
      tabBarLabelVisibilityMode: 'selected',
      tabBarMinimizeBehavior: 'onScrollDown',
      tabBarActiveTintColor: theme.colors.primary,
      tabBarActiveIndicatorColor: theme.colors.primary,
      tabBarRippleColor: theme.colors.primary,
      headerLargeTitleEnabled: true,
      headerTransparent: true,
      headerLargeTitleShadowVisible: true,
      headerTintColor: theme.colors.primary,
    }),
  });
