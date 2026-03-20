import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../foundations/Input';
import { Button } from '../foundations/Button';
import { ThemeSwitch } from './ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export type AuthFormType = 'login' | 'register';

interface AuthFormProps {
  type: AuthFormType;
}

const CONFIG = {
  login: {
    title: 'Welcome Back',
    submitLabel: 'Login',
    footerLabel: "Don't have an account? Register",
    footerRoute: 'Register',
  },
  register: {
    title: 'Create Account',
    submitLabel: 'Sign Up',
    footerLabel: 'Already have an account? Login',
    footerRoute: null, // go back
  },
};

const edges: Edges = Platform.select({ ios: ['top'], default: [] });

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const setLoggedIn = useAuthStore(state => state.setLoggedIn);
  const theme = useAppTheme();
  console.log('🚀 ~ AuthForm ~ theme:', theme);
  const styles = makeStyles(theme);

  const config = CONFIG[type];

  useEffect(() => {
    console.log(`${type}Screen mounted`);
  }, [type]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (type === 'login') {
        await authApi.login(email, password);
        setLoggedIn(true);
      } else {
        await authApi.register(email, password);
        navigation.goBack();
      }
    } catch (e) {
      console.warn(`${type} failed`, e);
    } finally {
      setLoading(false);
    }
  };

  const handleFooterPress = () => {
    if (config.footerRoute) {
      navigation.navigate(config.footerRoute);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      {/* Theme toggle */}
      <View style={styles.topBar}>
        <ThemeSwitch />
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>{config.title}</Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder={
            type === 'login' ? 'Enter your password' : 'Create a password'
          }
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={config.submitLabel}
          onPress={handleSubmit}
          isLoading={loading}
          style={styles.submitButton}
        />

        <Button
          title={config.footerLabel}
          variant="text"
          onPress={handleFooterPress}
        />
      </View>
    </SafeAreaView>
  );
};

const makeStyles = ({ colors, spacing, typography }: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.backgrounds.default,
    },
    topBar: {
      alignItems: 'flex-end',
    },
    form: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text.primary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    submitButton: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
  });
