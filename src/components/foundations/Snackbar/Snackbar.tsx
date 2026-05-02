import React, { useEffect, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { useSnackbarStore, SnackbarType, SnackbarItem as SnackbarItemType } from './snackbarStore';
import { useAppTheme } from '../../../hooks/useAppTheme';

const MAX_STACK = 3; // Maximum visible snackbars in the stack

export const Snackbar = () => {
  const queue = useSnackbarStore(state => state.queue);

  // We only show the last MAX_STACK items, but we need to reverse them 
  // so the newest one is visually "at the back" or "at the top" depending on UX.
  // The user said "waiting behind the current one", so index 0 is active.
  const visibleItems = queue.slice(0, MAX_STACK);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {visibleItems.map((item, index) => (
        <SnackbarItem key={item.id} item={item} index={index} />
      ))}
    </View>
  );
};

interface SnackbarItemProps {
  item: SnackbarItemType;
  index: number;
}

const SnackbarItem = memo(({ item, index }: SnackbarItemProps) => {
  const { dismiss } = useSnackbarStore();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const targetY = Math.max(insets.top, 10) + 10;
  
  // Stacking offsets: each item behind is moved down and scaled
  const stackOffset = index * 8;
  const stackScale = 1 - index * 0.05;

  const translateY = useSharedValue(-150);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entrance / Update stacking position
    translateY.value = withTiming(targetY + stackOffset, { duration: 400 });
    opacity.value = withTiming(1 - index * 0.2, { duration: 300 });

    let timer: ReturnType<typeof setTimeout>;
    // Only start the duration timer if this snackbar is at the top of the stack (index 0)
    if (index === 0 && item.duration > 0) {
      timer = setTimeout(() => {
        handleDismiss();
      }, item.duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [index, stackOffset, targetY, item.duration]);

  const handleDismiss = () => {
    translateY.value = withTiming(-150, { duration: 300 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(dismiss)(item.id);
    });
  };

  const panGesture = Gesture.Pan()
    .enabled(item.isSwipeDismissable && index === 0) // Only top one is swipeable
    .onChange(event => {
      translateX.value = event.translationX;
      if (event.translationY < 0) {
        translateY.value = targetY + stackOffset + event.translationY;
      } else {
        translateY.value = targetY + stackOffset + event.translationY * 0.1;
      }
    })
    .onEnd(event => {
      const shouldDismissX = Math.abs(event.translationX) > 80 || Math.abs(event.velocityX) > 600;
      const shouldDismissY = event.translationY < -30 || event.velocityY < -500;

      if (shouldDismissX || shouldDismissY) {
        if (shouldDismissX) {
          translateX.value = withTiming(event.translationX > 0 ? 500 : -500, { duration: 200 });
        } else {
          translateY.value = withTiming(-150, { duration: 200 });
        }
        runOnJS(dismiss)(item.id);
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(targetY + stackOffset, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: withTiming(stackScale, { duration: 300 }) },
      ],
      opacity: opacity.value,
      zIndex: 9999 - index,
    };
  });

  const getThemeColors = (t: SnackbarType) => {
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

  const colors = getThemeColors(item.type);

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
          <View style={styles.iconContainer}>{getIcon(item.type, colors.icon)}</View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.message,
                { color: colors.text, ...theme.typography.variants.body },
              ]}
              numberOfLines={3}
            >
              {item.message}
            </Text>
          </View>

          {item.action && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                item.action?.onPress();
                handleDismiss();
              }}
              style={styles.actionButton}
            >
              <Text style={[styles.actionText, { color: colors.action }]}>
                {item.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
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
