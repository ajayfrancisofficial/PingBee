import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  LayoutRectangle,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  /** Visually mark this item as the active/selected one */
  isActive?: boolean;
}

interface MenuProps {
  /** The element that opens the menu when pressed */
  trigger: React.ReactNode;
  items: MenuItem[];
  /** Alignment of the popup relative to the trigger. Defaults to 'right'. */
  align?: 'left' | 'right';
}

export const Menu: React.FC<MenuProps> = ({ trigger, items, align = 'right' }) => {
  const theme = useAppTheme();
  const styles = makeStyles(theme);

  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

  const open = () => {
    triggerRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setTriggerLayout({ x: px, y: py, width, height });
      setVisible(true);
    });
  };

  const close = () => setVisible(false);

  const menuLeft =
    triggerLayout
      ? align === 'right'
        ? triggerLayout.x + triggerLayout.width - 180 // right-align: push left by menu width
        : triggerLayout.x
      : 0;

  const menuTop = triggerLayout ? triggerLayout.y + triggerLayout.height + 8 : 0;

  return (
    <>
      {/* Trigger wrapper — measures position */}
      <TouchableOpacity onPress={open} activeOpacity={0.7}>
        <View ref={triggerRef} collapsable={false}>
          {trigger}
        </View>
      </TouchableOpacity>

      {/* Popup overlay */}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menu, { top: menuTop, left: menuLeft }]}>
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.7}
                    onPress={() => {
                      item.onPress();
                      close();
                    }}
                    style={[
                      styles.menuItem,
                      index < items.length - 1 && styles.menuItemBorder,
                      item.isActive && styles.menuItemActive,
                    ]}
                  >
                    {item.icon && <View style={styles.menuItemIcon}>{item.icon}</View>}
                    <Text
                      style={[
                        styles.menuItemLabel,
                        item.isActive && styles.menuItemLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.isActive && <View style={styles.activeIndicator} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
    },
    menu: {
      position: 'absolute',
      width: 180,
      backgroundColor: colors.backgrounds.elevated,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borders.light,
      paddingVertical: spacing.xs,
      // Elevation / Shadow
      shadowColor: colors.absolute.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    menuItemBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borders.separator,
    },
    menuItemActive: {
      backgroundColor: colors.surfaces.secondary,
    },
    menuItemIcon: {
      marginRight: spacing.sm,
    },
    menuItemLabel: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.text.primary,
      fontWeight: typography.weights.regular,
    },
    menuItemLabelActive: {
      color: colors.brand.primary,
      fontWeight: typography.weights.semiBold,
    },
    activeIndicator: {
      width: 7,
      height: 7,
      borderRadius: 9999,
      backgroundColor: colors.brand.primary,
    },
  });
