import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  NavigationProp,
  type StaticScreenProps,
} from '@react-navigation/native';
import { KeyRound, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { authService } from '../../services/Auth/authService';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { snackbar } from '../../components/foundations/Snackbar';

export type VerifyOTPScreenParams = { email: string };
type Props = StaticScreenProps<VerifyOTPScreenParams>;

export const VerifyOTPScreen = ({ route }: Props) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      const response = await authService.verifyOTP(email, code);
      snackbar.show({
        message: 'OTP verified successfully.',
        type: 'success',
      });
      // Navigate to ResetPassword Screen
      navigation.navigate('ResetPassword', { userId: response.userId });
    } catch (error) {
      // Error handled by API client
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      setResendCooldown(30);
      setCode('');
      setError('');
      snackbar.show({
        message: 'A new verification code has been sent.',
        type: 'success',
      });
    } catch (error) {
      // Error handled by API client
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    setCode(cleanText);
    if (cleanText.length === 6) {
      setError('');
    }
  };

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
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.description}>
              We have sent a verification code to:{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="6-Digit Verification Code"
              value={code}
              onChangeText={handleCodeChange}
              maxLength={6}
              keyboardType="number-pad"
              placeholder="e.g. 123456"
              error={error}
              leftIcon={
                <KeyRound
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
            />

            <Button
              title="Verify Code"
              onPress={handleVerify}
              isLoading={isVerifying}
              disabled={code.length !== 6 || isResending}
              style={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
              {isResending ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.brand.primary}
                />
              ) : resendCooldown > 0 ? (
                <Text style={styles.cooldownText}>
                  Resend code in {resendCooldown}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isVerifying}
                  style={isVerifying && { opacity: 0.5 }}
                >
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
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
      lineHeight: 22,
    },
    emailText: {
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    form: {
      flex: 1,
    },
    verifyButton: {
      marginTop: spacing.lg,
      height: sizing.buttonHeights.lg,
      borderRadius: borderRadius.lg,
    },
    resendContainer: {
      marginTop: spacing.xl,
      alignItems: 'center',
    },
    resendText: {
      ...typography.variants.body,
      color: colors.brand.primary,
      fontWeight: '600',
    },
    cooldownText: {
      ...typography.variants.body,
      color: colors.text.secondary,
    },
  });
