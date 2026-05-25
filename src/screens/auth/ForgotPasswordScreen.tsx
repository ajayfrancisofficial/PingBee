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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { authService } from '../../services/Auth/authService';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { snackbar } from '../../components/foundations/Snackbar';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const validateEmail = (val: string) => {
    setEmail(val);
    if (!val) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setError('Invalid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) return;
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      snackbar.show({
        message: 'OTP verification code sent to your email.',
        type: 'success',
      });
      // Navigate to verify code screen with email param
      navigation.navigate('VerifyOTP', { email });
    } catch (error) {
      // Error handled by API client
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.description}>
              Enter your email below and we will send you a 6-digit OTP code to
              reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              leftIcon={
                <Mail
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
            />

            <Button
              title="Send OTP"
              onPress={handleSendOTP}
              isLoading={loading}
              disabled={!!error || !email}
              style={styles.sendButton}
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
    sendButton: {
      marginTop: spacing.lg,
      height: sizing.buttonHeights.lg,
      borderRadius: borderRadius.lg,
    },
  });
