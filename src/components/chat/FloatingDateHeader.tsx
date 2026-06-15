import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { ChatDateSeparator } from './ChatDateSeparator';

interface FloatingDateHeaderProps {
  date: Date | null;
}

export const FloatingDateHeader: React.FC<FloatingDateHeaderProps> = ({ date }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [lastValidDate, setLastValidDate] = useState<Date | null>(null);
  const visibleShared = useSharedValue(0);

  useEffect(() => {
    if (date) {
      setLastValidDate(date);
    }
    visibleShared.value = withTiming(date ? 1 : 0, { duration: 250 });
  }, [date, visibleShared]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: visibleShared.value,
      transform: [
        {
          translateY: (1 - visibleShared.value) * -10,
        },
      ],
    };
  });

  if (!lastValidDate) return null;

  return (
    <Animated.View
      style={[styles.floatingHeaderContainer, animatedStyle]}
      pointerEvents="none"
    >
      <ChatDateSeparator date={lastValidDate} floating />
    </Animated.View>
  );
};

const makeStyles = ({ spacing }: AppTheme) =>
  StyleSheet.create({
    floatingHeaderContainer: {
      position: 'absolute',
      top: spacing.sm,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
  });
