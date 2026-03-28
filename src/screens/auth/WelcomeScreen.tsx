import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/foundations/Button';
import { ThemeSwitch } from '../../components/common/ThemeSwitch';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

export const WelcomeScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleAgreeAndContinue = () => {
    navigation.navigate('Login');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://pingbee.app/privacy'); // Placeholder URL
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View />
        <ThemeSwitch />
      </View>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/pingbee_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to PingBee</Text>
          <Text style={styles.description}>
            Read our{' '}
            <Text style={styles.link} onPress={openPrivacyPolicy}>
              Privacy Policy
            </Text>{' '}
            and tap on "Agree and Continue"
          </Text>
        </View>

        <Button
          title="Agree and Continue"
          onPress={handleAgreeAndContinue}
          style={styles.button}
        />
      </View>
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
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    logoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 200,
      height: 200,
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      ...typography.variants.heading1,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    description: {
      ...typography.variants.body,
      color: colors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      lineHeight: 24,
    },
    link: {
      color: colors.brand.primary,
      textDecorationLine: 'underline',
      fontWeight: '600',
    },
    button: {
      width: '100%',
      height: 56,
      borderRadius: borderRadius.lg,
    },
  });
