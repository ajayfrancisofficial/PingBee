import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import ChatsScreen from '../screens/ChatsScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { BottomTabParamList } from '../types/navigation';

export const BottomTabNavigator = createNativeBottomTabNavigator<BottomTabParamList>({
  screens: {
    Chats: {
      screen: ChatsScreen,
      options: {
        // title: 'Chats',
      },
    },
    Status: {
      screen: StatusScreen,
      options: {}
    },
    Calls: {
      screen: CallsScreen,
    },
  },
});
