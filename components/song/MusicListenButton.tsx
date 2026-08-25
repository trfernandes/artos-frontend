import { useState } from 'react';
import { Linking, Pressable, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyText from '../FancyText';
import YoutubePlayerSheet from './YoutubePlayerSheet';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { detectMusicLinkService, extractYoutubeVideoId } from '../../utils/musicLinkUtils';

type Props = {
  url?: string | null;
  title?: string;
};

export default function MusicListenButton({ url, title }: Props) {
  const palette = usePallete();
  const [youtubeVisible, setYoutubeVisible] = useState(false);

  const trimmedUrl = url?.trim() || '';
  const hasUrl = trimmedUrl.length > 0;
  const service = hasUrl ? detectMusicLinkService(trimmedUrl) : null;
  const youtubeVideoId = service === 'youtube' ? extractYoutubeVideoId(trimmedUrl) : null;

  const icon: keyof typeof MaterialCommunityIcons.glyphMap =
    service === 'youtube' && youtubeVideoId
      ? 'youtube'
      : service === 'spotify'
        ? 'spotify'
        : 'play-circle-outline';

  const color =
    service === 'youtube' && youtubeVideoId
      ? palette.primary
      : hasUrl
        ? palette.secondary
        : palette.icons.inactive2;

  const caption =
    service === 'youtube' && youtubeVideoId
      ? null
      : service === 'spotify'
        ? 'Abre no Spotify'
        : hasUrl
          ? 'Abre externamente'
          : 'Sem link';

  const handlePress = () => {
    if (!hasUrl) return;
    if (service === 'youtube' && youtubeVideoId) {
      setYoutubeVisible(true);
      return;
    }
    void Linking.openURL(trimmedUrl);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        disabled={!hasUrl}
        hitSlop={12}
        accessibilityRole='button'
        accessibilityLabel={hasUrl ? 'Ouvir música' : 'Sem link cadastrado para esta música'}
        style={styles.container}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: ColorUtils.withAlpha(color, 0.12),
              borderColor: ColorUtils.withAlpha(color, 0.24),
            },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={14} color={color} />
        </View>
        {caption ? (
          <FancyText
            size='extraSmall'
            type='medium'
            color={palette.fonts.inactive}
            numberOfLines={1}
          >
            {caption}
          </FancyText>
        ) : null}
      </Pressable>

      {service === 'youtube' && youtubeVideoId ? (
        <YoutubePlayerSheet
          visible={youtubeVisible}
          onClose={() => setYoutubeVisible(false)}
          videoId={youtubeVideoId}
          title={title}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
