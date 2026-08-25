import { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import FancyBottomSheetModal from '../modal/FancyBottomSheetModal';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';

type Props = {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
};

const PLAYER_WIDTH = Dimensions.get('window').width - 48;
const PLAYER_HEIGHT = (PLAYER_WIDTH * 9) / 16;

export default function YoutubePlayerSheet({ visible, onClose, videoId, title }: Props) {
  const palette = usePallete();
  const [playing, setPlaying] = useState(true);

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={() => {
        setPlaying(false);
        onClose();
      }}
      title={title || 'Ouvir no YouTube'}
    >
      <View style={styles.content}>
        {visible ? (
          <YoutubePlayer
            height={PLAYER_HEIGHT}
            width={PLAYER_WIDTH}
            play={playing}
            videoId={videoId}
            onChangeState={(state: string) => {
              if (state === 'ended' || state === 'paused') setPlaying(false);
            }}
          />
        ) : null}
        {title ? (
          <FancyText
            size='small'
            type='medium'
            color={palette.fonts.inactive}
            numberOfLines={2}
            style={styles.title}
          >
            {title}
          </FancyText>
        ) : null}
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
