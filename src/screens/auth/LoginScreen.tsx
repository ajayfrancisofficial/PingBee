import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mail, Globe, Phone, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const navigation = useNavigation();
  const setLoggedIn = useAuthStore(state => state.setLoggedIn);
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleLogin = async () => {
    if (phoneNumber.length < 5) return;
    setLoading(true);
    // Simulate API call for OTP request
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Verification', { phoneNumber });
    }, 1000);
  };

  const handleGoogleLogin = () => {
    // Implement Google login
    console.log('Google login');
  };

  const handleEmailLogin = () => {
    navigation.navigate('EmailLogin');
  };

  const navigateToRegister = () => {
    navigation.navigate('RegisterEmail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
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
            <Image
              source={require('../../assets/images/pingbee_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.signInText}>Sign in</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Phone Number"
              placeholder="+1 234 567 890"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              leftIcon={<Phone size={20} color={theme.colors.text.secondary} />}
            />

            <Button
              title="Login"
              onPress={handleLogin}
              isLoading={loading}
              style={styles.loginButton}
            />

            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialIconContainer}
                onPress={handleGoogleLogin}
              >
                <Globe size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialIconContainer}
                onPress={handleEmailLogin}
              >
                <Mail size={24} color={theme.colors.text.primary} />
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
    logo: {
      width: 120,
      height: 120,
      marginBottom: spacing.lg,
    },
    signInText: {
      ...typography.variants.heading2,
      color: colors.text.primary,
    },
    form: {
      flex: 1,
    },
    loginButton: {
      marginTop: spacing.lg,
      height: 56,
      borderRadius: borderRadius.lg,
    },
    separatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borders.default,
    },
    orText: {
      ...typography.variants.caption,
      color: colors.text.secondary,
      marginHorizontal: spacing.md,
      textTransform: 'uppercase',
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xl,
    },
    socialIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.borders.default,
      backgroundColor: colors.backgrounds.elevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
