import { StaticParamList } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, User } from 'lucide-react-native';
import ChatsScreen from '../screens/ChatsScreen';
import { YouStack } from './YouStack';
import { PlatformPressable } from '@react-navigation/elements';

export const BottomTabNavigator = createBottomTabNavigator({
  initialRouteName: 'Chats',
  screens: {
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
