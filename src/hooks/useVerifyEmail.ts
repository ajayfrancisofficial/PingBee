import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/Auth/authService';
import { snackbar } from '../components/foundations/Snackbar';
import { useUserStore } from '../store/userStore';

const OTP_COOLDOWN_SECONDS = 30;

interface UseVerifyEmailReturn {
  email: string;
  setEmail: (email: string) => void;
  code: string;
  setCode: (code: string) => void;
  emailError: string;
  codeError: string;
  isSending: boolean;
  isVerifying: boolean;
  codeSent: boolean;
  cooldown: number;
  handleSendCode: () => Promise<void>;
  handleVerify: () => Promise<boolean>;
  handleResend: () => Promise<void>;
}

export const useVerifyEmail = (initialEmail: string): UseVerifyEmailReturn => {
  const [email, setEmailState] = useState(initialEmail);

  const setEmail = useCallback((newEmail: string) => {
    setEmailState(newEmail);
    setEmailError('');
    setCodeSent(false);
    setCode('');
    setCodeError('');
    setCooldown(0);
  }, []);
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = useCallback((val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError('Invalid email address');
      return false;
    }
    setEmailError('');
    return true;
  }, []);

  const handleSendCode = useCallback(async () => {
    if (!validateEmail(email)) return;
    setIsSending(true);
    try {
      await authService.sendVerification({ email: email.trim() });
      setCodeSent(true);
      setCooldown(OTP_COOLDOWN_SECONDS);
      setCode('');
      setCodeError('');
      snackbar.show({
        message: 'Verification code sent to your email.',
        type: 'success',
      });
    } catch {
      // Error handled by API client interceptors
    } finally {
      setIsSending(false);
    }
  }, [email, validateEmail]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    await handleSendCode();
  }, [cooldown, handleSendCode]);

  const handleVerify = useCallback(async (): Promise<boolean> => {
    if (code.trim().length !== 6) {
      setCodeError('Please enter the 6-digit code');
      return false;
    }
    setCodeError('');
    setIsVerifying(true);
    try {
      await authService.verifyEmail({ email: email.trim(), code: code.trim() });

      // Update local store eagerly with verified email and status
      useUserStore.getState().setUser({
        email: email.trim(),
        isVerified: true,
      });

      snackbar.show({
        message: 'Email verified successfully!',
        type: 'success',
      });
      return true;
    } catch {
      // Error handled by API client interceptors
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [email, code]);

  return {
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
  };
};
