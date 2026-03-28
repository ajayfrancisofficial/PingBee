import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { KeyRound, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { AuthStackParamList } from '../../types/navigation';

export const VerificationScreen = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Verification'>>();
  const { phoneNumber } = route.params;
  const setLoggedIn = useAuthStore(state => state.setLoggedIn);
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true);
    try {
      // Use authApi.login with PhoneLoginRequest
      await authApi.login({
        type: 'phoneLogin',
        phoneNumber,
        code,
      });
      setLoggedIn(true);
    } catch (e) {
      console.warn('Verification failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(30);
      // Implement resend logic
      console.log('Resending code...');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View />
        )}
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
            <View style={styles.iconContainer}>
              <KeyRound size={40} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.description}>
              Please enter the 6-digit code sent to your phone number.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              style={styles.codeInput}
            />

            <Button
              title="Verify"
              onPress={handleVerify}
              isLoading={loading}
              disabled={code.length < 6}
              style={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                <Text
                  style={[
                    styles.resendLink,
                    timer > 0 && styles.resendDisabled,
                  ]}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
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
      minHeight: 48,
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
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaces.secondary,
      justifyContent: 'center',
      alignItems: 'center',
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
      paddingHorizontal: spacing.md,
    },
    form: {
      flex: 1,
    },
    codeInput: {
      fontSize: 32,
      letterSpacing: 8,
      height: 64,
    },
    verifyButton: {
      marginTop: spacing.xl,
      height: 56,
      borderRadius: borderRadius.lg,
    },
    resendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    resendText: {
      ...typography.variants.body,
      color: colors.text.secondary,
    },
    resendLink: {
      ...typography.variants.bodyMedium,
      color: colors.brand.primary,
      fontWeight: '600',
    },
    resendDisabled: {
      color: colors.text.tertiary,
    },
  });
