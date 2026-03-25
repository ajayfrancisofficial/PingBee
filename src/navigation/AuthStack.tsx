import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterEmailScreen } from '../screens/auth/RegisterEmailScreen';
import { VerificationScreen } from '../screens/auth/VerificationScreen';
import { EmailLoginScreen } from '../screens/auth/EmailLoginScreen';
import { AuthStackParamList } from '../types/navigation';

export const AuthStack = createNativeStackNavigator<AuthStackParamList>({
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
    RegisterEmail: {
      screen: RegisterEmailScreen,
      options: { headerShown: false },
    },
    Verification: {
      screen: VerificationScreen,
      options: { headerShown: false },
    },
    EmailLogin: {
      screen: EmailLoginScreen,
      options: { headerShown: false },
    },
  },
});
