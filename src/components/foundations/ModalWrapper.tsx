import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

export interface ModalWrapperProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  justifyContent?: 'center' | 'flex-end' | 'flex-start';
  dismissable?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  visible,
  onClose,
  children,
  animationType = 'fade',
  justifyContent = 'center',
  dismissable = true,
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleClose = () => {
    if (dismissable) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={handleClose}
      statusBarTranslucent
      allowSwipeDismissal={true}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.contentContainer, { justifyContent }]}
          pointerEvents="box-none"
        >
          {children}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
      flex: 1,
      zIndex: 1,
    },
  });
