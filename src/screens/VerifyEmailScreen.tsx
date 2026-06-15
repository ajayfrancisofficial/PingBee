import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react-native';
import { Button } from '../components/foundations/Button';
import { Input } from '../components/foundations/Input';
import { ThemeSwitch } from '../components/common/ThemeSwitch';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import { AppTheme } from '../theme';

export const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const currentEmail = useUserStore(state => state.email);
  const isVerified = useUserStore(state => state.isVerified);

  const {
    email,
    setEmail,
    code,
    setCode,
    emailError,
    codeError,
    isSending,
    isVerifying,
    codeSent,
    cooldown,
    handleSendCode,
    handleVerify,
    handleResend,
  } = useVerifyEmail(currentEmail);

  const onVerifyPress = async () => {
    const success = await handleVerify();
    if (success) {
      navigation.goBack();
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text.replace(/[^0-9]/g, ''));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
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
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/appLogos/pingbee_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.description}>
              {codeSent ? (
                <>
                  A 6-digit code was sent to{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </>
              ) : isVerified ? (
                'Your email is verified. Enter a new email address below to change it.'
              ) : (
                'Enter your email to receive a verification code.'
              )}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
              leftIcon={
                <Mail
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
            />

            {/* Send / Resend Code Button */}
            {!codeSent ? (
              <Button
                title="Send Code"
                onPress={handleSendCode}
                isLoading={isSending}
                disabled={
                  !email ||
                  !!emailError ||
                  (isVerified && email === currentEmail)
                }
                style={styles.actionButton}
              />
            ) : (
              <View style={styles.resendContainer}>
                {cooldown > 0 ? (
                  <Text style={styles.cooldownText}>
                    Resend code in {cooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={isSending}
                    style={isSending ? styles.disabledOpacity : undefined}
                  >
                    {isSending ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.brand.primary}
                      />
                    ) : (
                      <Text style={styles.resendText}>Resend Code</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Code Input + Verify — shown only after code is sent */}
            {codeSent && (
              <>
                <Input
                  label="6-Digit Verification Code"
                  value={code}
                  onChangeText={handleCodeChange}
                  maxLength={6}
                  keyboardType="number-pad"
                  error={codeError}
                  leftIcon={
                    <KeyRound
                      size={theme.sizing.iconSizes.md}
                      color={theme.colors.text.secondary}
                    />
                  }
                />

                <Button
                  title="Verify Code"
                  onPress={onVerifyPress}
                  isLoading={isVerifying}
                  disabled={code.length !== 6}
                  style={styles.actionButton}
                />
              </>
            )}
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
    flex: {
      flex: 1,
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
    emailHighlight: {
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    form: {
      flex: 1,
    },
    actionButton: {
      marginTop: spacing.sm,
      height: sizing.buttonHeights.lg,
      borderRadius: borderRadius.lg,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
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
    disabledOpacity: {
      opacity: 0.5,
    },
  });
