import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyButton from '../buttons/FancyButton';
import FancyScrollView from '../FancyScrollView';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { DefaultIconsNames } from '../../constants/icons';

export type QuizFlatLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
  hero?: ReactNode;
  heroOverlay?: ReactNode;
  onPressBack?: () => void;
  showBackButton?: boolean;
  /** Hero ocupa todo o espaço vertical sobrando (imagem preenche o vão) em vez de altura fixa. */
  heroFlex?: boolean;
};

const BACK_BUTTON_SIZE = 40;
const TOP_BAR_SIDE_INSET = 16 + BACK_BUTTON_SIZE + 8;

export default function QuizFlatLayout({
  children,
  footer,
  hero,
  heroOverlay,
  onPressBack,
  showBackButton = true,
  heroFlex = false,
}: QuizFlatLayoutProps) {
  const Pallete = usePallete();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        {hero && (
          <View
            style={[
              styles.hero,
              heroFlex && styles.heroFlex,
              { marginLeft: -insets.left, marginRight: -insets.right },
            ]}
          >
            {hero}
          </View>
        )}

        {hero && (showBackButton || heroOverlay) && (
          <View
            style={[
              styles.topBar,
              {
                paddingTop: insets.top + 8,
                minHeight: insets.top + 8 + BACK_BUTTON_SIZE + 12,
              },
            ]}
          >
            {showBackButton && (
              <FancyButton
                mode='icon'
                icon={{ ...DefaultIconsNames['arrow-left'], color: Pallete.icons.dark, size: 18 }}
                size={BACK_BUTTON_SIZE}
                onPress={onPressBack}
                containerStyle={{
                  backgroundColor: ColorUtils.withAlpha(Pallete.backgroundColor, 0.85),
                  zIndex: 1,
                }}
              />
            )}
            {heroOverlay && (
              <View
                style={[
                  styles.heroOverlayPill,
                  {
                    backgroundColor: ColorUtils.withAlpha(Pallete.backgroundColor, 0.85),
                    top: insets.top + 8,
                  },
                ]}
              >
                {heroOverlay}
              </View>
            )}
          </View>
        )}

        <View
          style={[
            heroFlex ? styles.contentAuto : styles.content,
            {
              paddingTop: hero ? 16 : insets.top + 16,
              paddingBottom: 10,
            },
          ]}
        >
          {!hero && showBackButton && (
            <FancyButton
              type='text'
              label='Voltar'
              icon={{ ...DefaultIconsNames['arrow-left'], color: Pallete.icons.inactive, size: 18 }}
              size={28}
              onPress={onPressBack}
              containerStyle={styles.backButton}
              labelStyle={{ color: Pallete.icons.inactive }}
            />
          )}

          <FancyScrollView
            containerStyle={heroFlex ? undefined : styles.scrollWrapper}
            style={heroFlex ? undefined : styles.scrollWrapper}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!heroFlex}
          >
            {children}
          </FancyScrollView>

          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  hero: {
    width: '100%',
  },
  heroFlex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  heroOverlayPill: {
    position: 'absolute',
    left: TOP_BAR_SIDE_INSET,
    right: TOP_BAR_SIDE_INSET,
    top: 0,
    bottom: 12,
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentAuto: {
    paddingHorizontal: 24,
  },
  backButton: {
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
  },
  scrollWrapper: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  footer: {
    paddingTop: 12,
    gap: 8,
  },
});
