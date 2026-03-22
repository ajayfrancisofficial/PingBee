import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { YouScreen } from '../screens/YouScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { YouStackParamList } from '../types/navigation';
import { Search, QrCode } from 'lucide-react-native';
import { sizing } from '../theme/sizing';
import { ThemeSwitch } from '../components/common/ThemeSwitch';

export const YouStack = createNativeStackNavigator<YouStackParamList>({
  screens: {
    You: {
      screen: YouScreen,
      options: ({ route, theme }) => ({
        headerLeft: () => (
          <Search
            size={sizing.iconSizes.base}
            color={theme.colors.primary}
            onPress={() => {
              console.log('search header preesed in youScreen');
            }}
          />
        ),
        headerRight: () => <ThemeSwitch />,
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
