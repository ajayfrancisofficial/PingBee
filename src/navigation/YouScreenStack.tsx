import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { YouScreen } from '../screens/YouScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { YouStackParamList } from '../types/navigation';
import { Text } from 'react-native';

export const YouScreenStack = createNativeStackNavigator<YouStackParamList>({
  screens: {
    You: {
      screen: YouScreen,
      options: ({ route }) => ({
        title: route.params?.name ?? 'You',
        headerTitle: 'abcd',
      }),
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Profile',
        headerBackButtonDisplayMode: 'minimal',
      },
    },
  },
  screenOptions: {
    headerShown: true,
    headerTransparent: true,
  },
});
