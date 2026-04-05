import { StaticParamList } from '@react-navigation/native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { Platform } from 'react-native';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { YouStack } from './YouStack';

export const BottomTabNavigator = createNativeBottomTabNavigator({
  initialRouteName: 'Chats',
  screens: {
    Status: {
      screen: StatusScreen,
      options: {
        tabBarIcon: () =>
          Platform.select({
            ios: { type: 'sfSymbol', name: 'circle.dashed' },
            android: {
              type: 'image',
              source: require('../assets/images/tab_status.png'),
            },
            default: undefined as any,
          }),
      },
    },
    Calls: {
      screen: CallsScreen,
      options: {
        tabBarIcon: ({ focused }) =>
          Platform.select({
            ios: {
              type: 'sfSymbol',
              name: focused ? 'phone.fill' : 'phone',
            },
            android: {
              type: 'image',
              source: focused
                ? require('../assets/images/tab_calls_filled.png')
                : require('../assets/images/tab_calls.png'),
            },
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
            android: {
              type: 'image',
              source: focused
                ? require('../assets/images/tab_chats_filled.png')
                : require('../assets/images/tab_chats.png'),
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
            android: {
              type: 'image',
              source: focused
                ? require('../assets/images/tab_you_filled.png')
                : require('../assets/images/tab_you.png'),
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

export type BottomTabParamList = StaticParamList<typeof BottomTabNavigator>;
