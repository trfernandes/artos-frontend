import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyAvatarImage from '../../images/FancyImage';
import FancyText from '../../FancyText';
import { AppImages } from '../../../assets/app_images';
import { usePallete } from '../../../hooks/usePallete';

export type VoluntarioSummarySheetProps = {
  visible: boolean;
  onClose: () => void;
  data?: {
    nome: string;
    email?: string | null;
    telefone?: string | null;
    fotoUrl?: string | null;
    fotoThumbUrl?: string | null;
    papelLabel?: string | null;
    statusLabel?: string | null;
    ministerioLabel?: string | null;
    permissionSummary?: string | null;
  } | null;
};

export default function VoluntarioSummarySheet({ visible, onClose, data }: VoluntarioSummarySheetProps) {
  const palette = usePallete();

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title='Detalhes do voluntário'>
      <View style={[styles.profileCard, { backgroundColor: palette.primary }]}>
        <View style={styles.profileInner}>
          <FancyAvatarImage
            source={
              data?.fotoThumbUrl || data?.fotoUrl
                ? { uri: data.fotoThumbUrl || data.fotoUrl || '' }
                : AppImages.emptyProfile
            }
            size={52}
          />
          <View style={styles.profileInfo}>
            <FancyText type='bold' size='medium' color={palette.fonts.light}>
              {data?.nome || '-'}
            </FancyText>
            {!!data?.email && (
              <FancyText size='small' type='medium' color={palette.fonts.light} style={{ opacity: 0.84 }}>
                {data.email}
              </FancyText>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {!!data?.email && (
          <InfoBlock
            label='E-mail'
            value={data.email}
          />
        )}
        {!!data?.telefone && (
          <InfoBlock
            label='Telefone'
            value={data.telefone}
          />
        )}
        {!!data?.papelLabel && (
          <InfoBlock
            label='Papel'
            value={data.papelLabel}
          />
        )}

        {!!data?.permissionSummary && (
          <View style={styles.permissionsBlock}>
            <FancyText type='bold' size='small' style={styles.blockLabel}>
              Permissões
            </FancyText>
            <FancyText type='medium' size='small' style={styles.permissionsValue}>
              {data.permissionSummary}
            </FancyText>
          </View>
        )}
      </View>
    </FancyBottomSheetModal>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <FancyText type='bold' size='small' style={styles.blockLabel}>
        {label}
      </FancyText>
      <FancyText type='medium' size='small' style={styles.blockValue}>
        {value}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  content: {
    gap: 14,
  },
  infoBlock: {
    gap: 4,
  },
  blockLabel: {
    opacity: 0.72,
  },
  blockValue: {
    lineHeight: 20,
  },
  permissionsBlock: {
    gap: 6,
    paddingTop: 4,
  },
  permissionsValue: {
    lineHeight: 21,
  },
});
