import { ReactNode, isValidElement } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemePalette } from '../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import FancyText from '../../FancyText';
import FancyPopup from '../../popup/FancyPopup';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

interface FancyActionButtonsProps {
  actions?: ActionButtonProps | ActionButtonProps[] | ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  actionButtonContainerStyle?: StyleProp<ViewStyle>;
}

export interface MenuActionButtonItemProps {
  label: string;
  onPress: () => void;
  icon?: CustomIconProps;
  destructive?: boolean;
  disabled?: boolean;
}

type BaseActionButtonProps = {
  icon: CustomIconProps & { backgroundColor?: string };
  size?: 'small' | 'medium';
  onPress?: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export type SimpleActionButtonProps = BaseActionButtonProps & {
  type?: 'simple'; // opcional
  options?: never; // impede passar options por engano
};

export type MenuActionButtonProps = Omit<BaseActionButtonProps, 'onPress'> & {
  type: 'menu';
  options: MenuActionButtonItemProps[];
  onPress?: never; // menu abre o menu, não executa ação direta
};

export type ActionButtonProps = SimpleActionButtonProps | MenuActionButtonProps;

export const isMenuActionButton = (a: ActionButtonProps): a is MenuActionButtonProps => (a as any).type === 'menu';

type SizeDefinition = { container: { width: number; height: number } };

const sizeMapping: Record<'small' | 'medium', SizeDefinition> = {
  small: { container: { width: 25, height: 25 } },
  medium: { container: { width: 30, height: 30 } },
};

export function FancyActionButtons({ actions, actionButtonContainerStyle, containerStyle }: FancyActionButtonsProps): ReactNode {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  function generateButton(item: ActionButtonProps, idx: number, hasLabel: boolean, iconColor: string, sizeDefinitions: SizeDefinition): ReactNode {
    const Wrapper: any = isMenuActionButton(item) ? View : TouchableOpacity;

    return (
      <Wrapper
        onPress={item.onPress}
        key={idx}
        style={[
          styles.actionButton,
          {
            minWidth: sizeDefinitions.container.width,
            height: sizeDefinitions.container.height,
            borderRadius: 999,
            backgroundColor: item.icon.backgroundColor || palette.primary,
          },
          actionButtonContainerStyle,
        ]}
      >
        <View style={[styles.actionButtonContent, { borderRadius: 999, paddingHorizontal: hasLabel ? 10 : 0 }, item.style]}>
          <DefaultIcons.Custom
            {...item.icon}
            style={[
              {
                borderWidth: 0,
                textAlign: 'left',
                lineHeight: item.icon.size || 22,
                height: '100%',
                textAlignVertical: 'center',
              },
              item.icon.style,
            ]}
            size={item.icon.size || 22}
            color={iconColor}
          />
          {hasLabel ? (
            <FancyText
              color={iconColor}
              size='extraSmall'
              type='bold'
              style={[styles.actionButtonLabel, { borderWidth: 0, paddingRight: 2, height: '100%' }]}
            >
              {item.label}
            </FancyText>
          ) : null}
        </View>
      </Wrapper>
    );
  }

  function generateButtonsComponent(buttons: ActionButtonProps[]): ReactNode {
    return buttons.map((item, idx) => {
      const hasLabel = Boolean(item.label);
      const iconColor = item.icon.color || palette.fonts.light;
      const sizeDefinitions = sizeMapping[item.size || 'medium'];

      if (isMenuActionButton(item)) {
        return (
          <FancyPopup
            showSeparator
            key={idx}
            triggerComponent={generateButton(item, idx, hasLabel, iconColor, sizeDefinitions)}
            items={item.options?.map((o) => ({ label: o.label, icon: o.icon, onPress: o.onPress }))}
          />
        );
      }
      return generateButton(item, idx, hasLabel, iconColor, sizeDefinitions);
    });
  }

  return (
    <View style={[styles.actionButtonsContainer, containerStyle]}>
      {isValidElement(actions) ? actions : Array.isArray(actions) ? generateButtonsComponent(actions) : null}
    </View>
  );
}

function createStyles(_palette: ThemePalette) {
  return StyleSheet.create({
    actionButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    actionButton: { borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
    actionButtonContent: {
      flex: 1,
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonLabel: {
      marginLeft: 4,
    },
  });
}
