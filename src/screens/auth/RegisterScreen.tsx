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
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  AtSign,
} from 'lucide-react-native';
import { Button } from '../../components/foundations/Button';
import { Input } from '../../components/foundations/Input';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';

export const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !username) return;
    if (password !== confirmPassword) return;

    setLoading(true);
    // Functionality will be implemented later
    setTimeout(() => {
      setLoading(false);
      console.log('Registration submitted');
      navigation.navigate('Login');
    }, 1500);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Enter your details to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  leftIcon={
                    <User
                      size={theme.sizing.iconSizes.md}
                      color={theme.colors.text.secondary}
                    />
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              leftIcon={
                <AtSign
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              }
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Mail
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

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
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
              title="Sign Up"
              onPress={handleRegister}
              isLoading={loading}
              disabled={
                !email ||
                password.length < 6 ||
                !firstName ||
                !lastName ||
                !username ||
                password !== confirmPassword
              }
              style={styles.registerButton}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.loginText}>Login</Text>
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
    row: {
      flexDirection: 'row',
    },
    registerButton: {
      marginTop: spacing.xl,
      height: sizing.buttonHeights.lg,
      borderRadius: borderRadius.lg,
    },
    footer: {
      marginTop: spacing.xl,
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    footerText: {
      ...typography.variants.body,
      color: colors.text.secondary,
    },
    loginText: {
      color: colors.brand.primary,
      fontWeight: '600',
    },
  });
