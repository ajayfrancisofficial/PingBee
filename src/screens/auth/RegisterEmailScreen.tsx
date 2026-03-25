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
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { authApi } from '../../api/auth';

export const RegisterEmailScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleRegister = async () => {
    if (!email || !password || !name) return;
    setLoading(true);
    try {
      await authApi.register(email, password);
      // Navigate back or to login
      console.log('Registered successfully');
    } catch (e) {
      console.warn('Registration failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
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
            <Image
              source={require('../../assets/images/pingbee_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Join PingBee today!
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={20} color={theme.colors.text.secondary} />}
            />

            <Input
              label="Email Address"
              placeholder="example@pingbee.app"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={theme.colors.text.secondary} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={theme.colors.text.secondary} />}
            />

            <Button
              title="Sign Up"
              onPress={handleRegister}
              isLoading={loading}
              disabled={!email || password.length < 6 || !name}
              style={styles.registerButton}
            />
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
    registerButton: {
      marginTop: spacing.xl,
      height: 56,
      borderRadius: borderRadius.lg,
    },
  });
