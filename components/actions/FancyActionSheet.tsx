import { Pressable, StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../modal/FancyBottomSheetModal';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';

export type FancyActionSheetItem = {
  label: string;
  icon?: CustomIconProps;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type FancyActionSheetProps = {
  visible: boolean;
  title?: string;
  actions: FancyActionSheetItem[];
  onClose: () => void;
};

export default function FancyActionSheet({
  visible,
  title = 'Opções',
  actions,
  onClose,
}: FancyActionSheetProps) {
  const palette = usePallete();

  const handleActionPress = (action: FancyActionSheetItem) => {
    if (action.disabled) return;
    onClose();
    requestAnimationFrame(() => {
      action.onPress();
    });
  };

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title={title}>
      <View style={styles.content}>
        {actions.map((action) => {
          const color = action.destructive ? palette.error : palette.fonts.dark;
          return (
            <Pressable
              key={action.label}
              onPress={() => handleActionPress(action)}
              disabled={action.disabled}
              style={[styles.actionRow, action.disabled && styles.actionRowDisabled]}
              accessibilityRole='button'
              accessibilityLabel={action.label}
            >
              {action.icon ? (
                <DefaultIcons.Custom
                  {...action.icon}
                  size={action.icon.size ?? 18}
                  color={action.icon.color ?? color}
                />
              ) : (
                <View style={styles.iconPlaceholder} />
              )}
              <FancyText
                type='semiBold'
                size='small'
                color={color}
                style={styles.actionLabel}
                numberOfLines={1}
              >
                {action.label}
              </FancyText>
            </Pressable>
          );
        })}
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 2,
    marginTop: -6,
    marginBottom: -16,
  },
  actionRow: {
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionRowDisabled: {
    opacity: 0.4,
  },
  iconPlaceholder: {
    width: 18,
    height: 18,
  },
  actionLabel: {
    flex: 1,
  },
});
