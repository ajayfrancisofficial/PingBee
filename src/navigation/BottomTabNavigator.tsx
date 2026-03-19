import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { YouScreen } from '../screens/YouScreen';
import { BottomTabParamList } from '../types/navigation';

export const BottomTabNavigator =
  createNativeBottomTabNavigator<BottomTabParamList>({
    screens: {
      Chats: {
        screen: ChatsScreen,
        options: {},
      },
      Status: {
        screen: StatusScreen,
        options: {},
      },
      Calls: {
        screen: CallsScreen,
      },
      You: {
        screen: YouScreen,
        options: {
          title: 'You',
        },
      },
    },
  });
