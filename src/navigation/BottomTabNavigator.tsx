import { StaticParamList } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CircleDashed, Phone, MessageCircle, User } from 'lucide-react-native';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { YouStack } from './YouStack';
import { PlatformPressable } from '@react-navigation/elements';

export const BottomTabNavigator = createBottomTabNavigator({
  initialRouteName: 'Chats',
  screens: {
    Status: {
      screen: StatusScreen,
      options: {
        tabBarIcon: ({ color, size, focused }) => (
          <CircleDashed
            color={color}
            size={size}
            strokeWidth={focused ? 2.5 : 2}
            fill={focused ? color : 'none'}
          />
        ),
      },
    },
    Calls: {
      screen: CallsScreen,
      options: {
        tabBarIcon: ({ color, size, focused }) => (
          <Phone
            color={color}
            size={size}
            strokeWidth={focused ? 2.5 : 2}
            fill={focused ? color : 'none'}
          />
        ),
      },
    },
    Chats: {
      screen: ChatsScreen,
      options: {
        tabBarIcon: ({ color, size, focused }) => (
          <MessageCircle
            color={color}
            size={size}
            strokeWidth={focused ? 2.5 : 2}
            fill={focused ? color : 'none'}
          />
        ),
      },
    },
    YouStack: {
      screen: YouStack,
      options: {
        title: 'You',
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <User
            color={color}
            size={size}
            strokeWidth={focused ? 2.5 : 2}
            fill={focused ? color : 'none'}
          />
        ),
      },
    },
  },
  screenOptions: ({ theme }) => ({
    headerShadowVisible: false,
    tabBarVisibilityAnimationConfig: {},
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTintColor: theme.colors.primary,
    animation: 'fade',
    tabBarButton: props => (
      <PlatformPressable {...props} android_ripple={{ color: 'transparent' }} />
    ),
  }),
});

export type BottomTabParamList = StaticParamList<typeof BottomTabNavigator>;
