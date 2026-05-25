import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  NavigationProp,
  type StaticScreenProps,
} from '@react-navigation/native';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { authService } from '../../services/Auth/authService';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { snackbar } from '../../components/foundations/Snackbar';

export type ResetPasswordScreenParams = { userId: number };
type Props = StaticScreenProps<ResetPasswordScreenParams>;

export const ResetPasswordScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (!val) {
      setConfirmError('Please confirm your password');
    } else if (val !== password) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError('');
    }
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 6 || password !== confirmPassword) {
      return;
    }
    setLoading(true);

    try {
      await authService.resetPassword(userId, password);
      snackbar.show({
        message: 'Your password has been reset successfully.',
        type: 'success',
      });
      // Reset navigation stack to Welcome -> Login so that back navigation behaves correctly
      navigation.reset({
        index: 1,
        routes: [{ name: 'Welcome' }, { name: 'Login' }],
      });
    } catch (error) {
      // Error handled by API client
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    password &&
    confirmPassword &&
    !passwordError &&
    !confirmError &&
    password === confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft
            size={theme.sizing.iconSizes.base}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <ThemeSwitch />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/appLogos/pingbee_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Please enter your new password below. Ensure it is at least 6
              characters long.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="New Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              error={passwordError}
              leftIcon={
                <Lock
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye
                      size={theme.sizing.iconSizes.md}
                      color={theme.colors.text.secondary}
                    />
                  ) : (
                    <EyeOff
                      size={theme.sizing.iconSizes.md}
                      color={theme.colors.text.secondary}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              error={confirmError}
              leftIcon={
                <Lock
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye
                      size={theme.sizing.iconSizes.md}
                      color={theme.colors.text.secondary}
                    />
                  ) : (
                    <EyeOff
                      size={theme.sizing.iconSizes.md}
                      color={theme.colors.text.secondary}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              isLoading={loading}
              disabled={!isFormValid}
              style={styles.resetButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = ({
  colors,
  spacing,
  typography,
  borderRadius,
  sizing,
}: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      minHeight: sizing.xxxl,
    },
    backButton: {
      padding: spacing.xs,
      marginLeft: -spacing.xs,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.variants.heading2,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    description: {
      ...typography.variants.body,
      color: colors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.sm,
    },
    form: {
      flex: 1,
    },
    resetButton: {
      marginTop: spacing.lg,
      height: sizing.buttonHeights.lg,
      borderRadius: borderRadius.lg,
    },
  });
