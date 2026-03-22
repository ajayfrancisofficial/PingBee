import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { YouScreen } from '../screens/YouScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { YouStackParamList } from '../types/navigation';
import { Search } from 'lucide-react-native';

export const YouScreenStack = createNativeStackNavigator<YouStackParamList>({
  screens: {
    You: {
      screen: YouScreen,
      options: ({ route, theme }) => ({
        headerLeft: () => <Search size={24} color={theme.colors.text} />,
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
    headerLargeTitleEnabled: false,
  },
});
