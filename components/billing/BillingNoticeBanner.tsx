import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ResponseIgrejaAssinaturaDto } from '../../domain/dtos/Igreja/response-igreja-assinatura.dto';
import {
  resolveBillingNoticeContent,
  shouldShowBillingNoticeBanner,
} from '../../domain/utils/billing-notice';
import { ColorUtils } from '../../utils/color_utils';

type BillingNoticeBannerProps = {
  assinatura?: ResponseIgrejaAssinaturaDto | null;
  onPress?: () => void;
  compact?: boolean;
};

export default function BillingNoticeBanner({
  assinatura,
  onPress,
  compact = false,
}: BillingNoticeBannerProps) {
  const palette = usePallete();

  if (!assinatura || !shouldShowBillingNoticeBanner(assinatura)) {
    return null;
  }

  const notice = resolveBillingNoticeContent(assinatura);
  const toneColor =
    notice.tone === 'critical'
      ? palette.error
      : notice.tone === 'warning'
        ? palette.warning
        : palette.primary;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={styles.touchable}
    >
      <LinearGradient
        colors={[palette.backgroundColor4, ColorUtils.withAlpha(toneColor, compact ? 0.08 : 0.12)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          compact ? styles.containerCompact : styles.containerRegular,
          {
            borderColor: ColorUtils.withAlpha(toneColor, 0.24),
          },
        ]}
      >
        <View
          pointerEvents='none'
          style={[
            styles.glow,
            {
              backgroundColor: ColorUtils.withAlpha(toneColor, 0.12),
            },
          ]}
        />

        <View style={styles.column}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconBadge,
                compact ? styles.iconBadgeCompact : styles.iconBadgeRegular,
                {
                  backgroundColor: ColorUtils.withAlpha(toneColor, 0.12),
                },
              ]}
            >
              {DefaultIcons.Custom({
                library: 'MaterialCommunityIcons',
                name:
                  notice.tone === 'critical'
                    ? 'alert-circle-outline'
                    : notice.tone === 'warning'
                      ? 'clock-alert-outline'
                      : 'flask-outline',
                size: compact ? 18 : 20,
                color: toneColor,
              })}
            </View>

            <View style={styles.content}>
              <FancyText
                size='extraSmall'
                type='semiBold'
                color={ColorUtils.withAlpha(palette.fonts.dark, 0.76)}
                style={styles.eyebrow}
              >
                {notice.eyebrow}
              </FancyText>
              <FancyText type='bold' size={compact ? 'small' : 'medium'}>
                {notice.title}
              </FancyText>
              <FancyText
                size={compact ? 'extraSmall' : 'small'}
                type='medium'
                color={ColorUtils.withAlpha(palette.fonts.dark, 0.8)}
                style={styles.body}
              >
                {notice.body}
              </FancyText>
            </View>
          </View>

          {onPress && assinatura.canManageBilling ? (
            <FancyButton
              label='Gerenciar assinatura'
              onPress={onPress}
              type={compact ? 'outlined' : 'contained'}
              icon={{
                library: 'MaterialCommunityIcons',
                name: 'credit-card-fast-outline',
                size: 16,
                color: compact ? toneColor : palette.fonts.light,
              }}
              containerStyle={[
                styles.ctaButton,
                compact ? styles.ctaButtonCompact : styles.ctaButtonRegular,
                compact
                  ? {
                      borderColor: ColorUtils.withAlpha(toneColor, 0.4),
                    }
                  : {
                      backgroundColor: toneColor,
                      borderColor: toneColor,
                    },
              ]}
              labelStyle={compact ? { color: toneColor } : undefined}
            />
          ) : !assinatura.canManageBilling ? (
            <FancyText
              size={compact ? 'extraSmall' : 'small'}
              type='semiBold'
              color={ColorUtils.withAlpha(palette.fonts.dark, 0.65)}
            >
              Fale com o administrador da igreja
            </FancyText>
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  container: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  containerRegular: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  containerCompact: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    top: -78,
    right: -52,
  },
  column: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  iconBadgeRegular: {
    width: 42,
    height: 42,
  },
  iconBadgeCompact: {
    width: 36,
    height: 36,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: {
    lineHeight: 18,
  },
  ctaButton: {
    minHeight: 34,
    alignSelf: 'stretch',
  },
  ctaButtonRegular: {
    paddingHorizontal: 14,
  },
  ctaButtonCompact: {
    paddingHorizontal: 12,
  },
});
