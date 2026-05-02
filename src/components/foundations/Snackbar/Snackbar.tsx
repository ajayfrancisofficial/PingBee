import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { useSnackbarStore, SnackbarType } from './snackbarStore';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const Snackbar = () => {
  const { visible, message, type, duration, action, isSwipeDismissable, hide } =
    useSnackbarStore();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // Use insets.top for both platforms to avoid notch/punch-hole.
  // On Android, insets.top is 0 unless the status bar is translucent or hidden.
  // We add a minimum of 10 for better visuals.
  const targetY = Math.max(insets.top, 10) + 10;

  const translateY = useSharedValue(-150);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = 0;
      translateY.value = withTiming(targetY, { duration: 300 });
      opacity.value = withTiming(1, { duration: 200 });

      let timer: ReturnType<typeof setTimeout>;
      if (duration > 0) {
        timer = setTimeout(() => {
          hide();
        }, duration);
      }

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      translateY.value = withTiming(-150, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, duration, hide, targetY, translateY, opacity, translateX]);

  const panGesture = Gesture.Pan()
    .enabled(isSwipeDismissable)
    .onChange(event => {
      translateX.value = event.translationX;
      if (event.translationY < 0) {
        translateY.value = targetY + event.translationY;
      } else {
        translateY.value = targetY + event.translationY * 0.1;
      }
    })
    .onEnd(event => {
      const shouldDismissX =
        Math.abs(event.translationX) > 80 || Math.abs(event.velocityX) > 600;
      const shouldDismissY = event.translationY < -30 || event.velocityY < -500;

      if (shouldDismissX || shouldDismissY) {
        if (shouldDismissX) {
          translateX.value = withTiming(event.translationX > 0 ? 500 : -500, {
            duration: 200,
          });
        } else {
          translateY.value = withTiming(-150, { duration: 200 });
        }
        runOnJS(hide)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(targetY, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
      opacity: opacity.value,
    };
  });

  if (!visible && opacity.value === 0) return null;

  const getThemeColors = (t: SnackbarType) => {
    // Subtle background colors with colored icons/text for a premium, less "loud" look
    switch (t) {
      case 'success':
        return {
          bg: theme.colors.semantic.successBackground,
          icon: theme.colors.semantic.success,
          text: theme.colors.text.primary,
          action: theme.colors.semantic.success,
        };
      case 'error':
        return {
          bg: theme.colors.semantic.errorBackground,
          icon: theme.colors.semantic.error,
          text: theme.colors.text.primary,
          action: theme.colors.semantic.error,
        };
      case 'warning':
        return {
          bg: theme.colors.semantic.warningBackground,
          icon: theme.colors.semantic.warning,
          text: theme.colors.text.primary,
          action: theme.colors.semantic.warning,
        };
      case 'info':
      default:
        return {
          bg: theme.colors.semantic.infoBackground,
          icon: theme.colors.semantic.info,
          text: theme.colors.text.primary,
          action: theme.colors.semantic.info,
        };
    }
  };

  const getIcon = (t: SnackbarType, color: string) => {
    const size = theme.sizing.iconSizes.md;
    switch (t) {
      case 'success':
        return <CheckCircle size={size} color={color} />;
      case 'error':
        return <AlertCircle size={size} color={color} />;
      case 'warning':
        return <AlertTriangle size={size} color={color} />;
      case 'info':
      default:
        return <Info size={size} color={color} />;
    }
  };

  const colors = getThemeColors(type);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.bg,
            shadowColor: theme.colors.absolute.black,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon(type, colors.icon)}</View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.message,
                { color: colors.text, ...theme.typography.variants.body },
              ]}
              numberOfLines={3}
            >
              {message}
            </Text>
          </View>

          {action && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                action.onPress();
                hide();
              }}
              style={styles.actionButton}
            >
              <Text style={[styles.actionText, { color: colors.action }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderWidth: 0, // Removed border
    borderRadius: 12,
    zIndex: 9999,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
