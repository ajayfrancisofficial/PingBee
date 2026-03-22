import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { Platform, Text } from 'react-native';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { YouScreenStack } from './YouScreenStack';
import { BottomTabParamList } from '../types/navigation';
import { darkColors } from '../theme/colors';

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
        screen: YouScreenStack,
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
    screenOptions: {
      headerShown: true,
      tabBarLabelVisibilityMode: 'selected',
      tabBarMinimizeBehavior: 'onScrollDown',
      tabBarActiveTintColor: darkColors.brand.primary,
      headerLargeTitleEnabled: true,
      // headerLargeTitleShadowVisible: true,
      headerTransparent: true,
      headerLeft: () => <Text>hello</Text>,
    },
  });
