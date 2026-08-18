import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CustomIconProps } from '../FancyIcons';
import { ThemePalette } from '../../constants/colors';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import FancyList, { FancyListProps } from '../list/FancyList';
import FancySeparator from '../FancySeparator';
import FancyListEmpty from '../list/FancyListEmpty';
import FancyContainer from '../FancyContainer';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface FancyContainerListProps<ItemT> extends Pick<
  FancyListProps<ItemT>,
  'data' | 'renderItem' | 'containerStyle' | 'contentContainerStyle' | 'keyExtractor'
> {
  title: string;
  buttons?: { icon: CustomIconProps; onPress?: () => void; tone?: 'default' | 'destructive' }[];
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showDivider?: boolean;
  virtualized?: boolean;
  disabled?: boolean;
}

export default function FancyContainerList<ItemT>({
  showDivider = false,
  virtualized = true,
  title,
  buttons,
  data,
  disabled = false,
  renderItem,
  containerStyle,
  contentContainerStyle,
}: FancyContainerListProps<ItemT>) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const items = Array.from(data ?? []);
  const hasItems = items.length > 0;

  return (
    <FancyContainer
      containerStyle={[
        styles.container,
        // quando virtualizado, o card preenche o espaço do pai (flex) para a lista rolar dentro;
        // quando não-virtualizado (embutido em um scroll externo), dimensiona por conteúdo
        virtualized && styles.flexFill,
        containerStyle,
        disabled ? { opacity: 0.6, pointerEvents: 'none' } : { pointerEvents: 'auto' },
      ]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <FancyText size={'medium'} type='bold' style={[styles.headerTitle, { opacity: 0.6 }]}>
            {title}
          </FancyText>
        </View>

        {buttons && (
          <View style={styles.headerButtonsContainer}>
            {buttons.map((button, index) => (
              <FancyButton
                key={index}
                mode='icon'
                type='contained'
                icon={{ ...button.icon, color: palette.icons.light }}
                onPress={button.onPress}
                containerStyle={{
                  minHeight: 25,
                  height: 25,
                  minWidth: 25,
                  width: 25,
                  backgroundColor:
                    button.tone === 'destructive' ? palette.error : palette.buttons.active,
                }}
                iconStyle={button.icon.style}
              />
            ))}
          </View>
        )}
      </View>
      <FancySeparator />
      <View
        style={[styles.contentContainer, virtualized && styles.flexFill, contentContainerStyle]}
      >
        {virtualized ? (
          <FancyList<ItemT>
            data={items}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContentStyle, contentContainerStyle]}
            containerStyle={[styles.listContainerStyle, containerStyle]}
            ItemSeparatorComponent={() =>
              showDivider && <FancySeparator style={{ marginTop: 10, borderWidth: 0 }} />
            }
          />
        ) : hasItems ? (
          <View style={containerStyle}>
            <View style={[styles.listContentStyle, contentContainerStyle]}>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  {renderItem ? React.createElement(renderItem as any, { item, index }) : null}
                  {showDivider && index < items.length - 1 ? (
                    <FancySeparator style={{ marginTop: 10, borderWidth: 0 }} />
                  ) : null}
                </React.Fragment>
              ))}
            </View>
          </View>
        ) : (
          <FancyListEmpty />
        )}
      </View>
    </FancyContainer>
  );
}

const DESIGN_MODE = 0;

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor,
      borderColor: palette.border,
      ...palette.shadows[300],
      borderRadius: 10,
    },
    flexFill: { flex: 1 },
    headerContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: DESIGN_MODE,
      borderColor: 'coral',
      gap: 10,
      flexDirection: 'row',
    },
    headerTitleContainer: {
      flex: 1,
      borderWidth: DESIGN_MODE,
      borderColor: 'pink',
      justifyContent: 'center',
    },
    headerTitle: { borderWidth: 0, borderColor: 'red' },
    headerButtonsContainer: {
      gap: 5,
      flexDirection: 'row',
      borderWidth: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    contentContainer: {
      borderWidth: DESIGN_MODE,
      borderColor: 'greenyellow',
      gap: 10,
    },
    listContentStyle: {
      gap: 10,
      borderWidth: 0,
      borderColor: 'magenta',
      paddingBottom: 10,
      paddingHorizontal: 10,
    },
    listContainerStyle: { borderWidth: 0, borderColor: 'gold', flex: 1 },
    divider: { height: 0.3, borderTopWidth: 1, borderColor: palette.border },
  });
}
