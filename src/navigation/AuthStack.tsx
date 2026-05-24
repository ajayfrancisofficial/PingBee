import { StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export const AuthStack = createNativeStackNavigator({
  initialRouteName: 'Welcome',
  screens: {
    Welcome: {
      screen: WelcomeScreen,
      options: { headerShown: false },
    },
    Login: {
      screen: LoginScreen,
      options: { headerShown: false },
    },
    Register: {
      screen: RegisterScreen,
      options: { headerShown: false },
    },
  },
});

export type AuthStackParamList = StaticParamList<typeof AuthStack>;
