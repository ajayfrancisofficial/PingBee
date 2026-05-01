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
import { User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/AuthStack';

export const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const setLoggedIn = useAuthStore(state => state.setLoggedIn);
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleLogin = async () => {
    if (!identifier || !password) return;
    setLoading(true);
    // Functionality will be implemented later
    setTimeout(() => {
      setLoading(false);
      setLoggedIn(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft
              size={theme.sizing.iconSizes.base}
              color={theme.colors.text.primary}
            />
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
            <Image
              source={require('../../assets/images/appLogos/pingbee_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Login</Text>
            <Text style={styles.description}>
              Welcome back! Please enter your details.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email or Username"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              leftIcon={
                <User
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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

            <Button
              title="Login"
              onPress={handleLogin}
              isLoading={loading}
              disabled={!identifier || password.length < 6}
              style={styles.loginButton}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.signUpText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
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
    },
    form: {
      flex: 1,
    },
    loginButton: {
      marginTop: spacing.xl,
      height: sizing.buttonHeights.lg,
      borderRadius: borderRadius.lg,
    },
    footer: {
      marginTop: 'auto',
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    footerText: {
      ...typography.variants.body,
      color: colors.text.secondary,
    },
    signUpText: {
      color: colors.brand.primary,
      fontWeight: '600',
    },
  });
