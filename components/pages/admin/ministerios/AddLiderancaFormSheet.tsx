import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancySearchSelect from '../../../fields/FancySearchSelect';
import FancyText from '../../../FancyText';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { usePallete } from '../../../../hooks/usePallete';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import { AddLiderFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { VoluntarioHierarquiaEnum } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { AppImages } from '../../../../assets/app_images';

type Props = {
  visible: boolean;
  volunteers: ResponseVoluntarioDto[];
  onClose: () => void;
  onSave: (data: AddLiderFormData) => void | Promise<void>;
};

export default function AddLiderancaFormSheet({ visible, volunteers, onClose, onSave }: Props) {
  const palette = usePallete();
  const [voluntarioId, setVoluntarioId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) setVoluntarioId('');
  }, [visible]);

  const volunteerOptions = useMemo<DropDownItemProps<string>[]>(
    () =>
      volunteers.map((v) => ({
        title: v.nome,
        value: v.id,
        left: {
          type: 'image',
          source:
            v.fotoThumbUrl || v.fotoUrl
              ? { uri: v.fotoThumbUrl || v.fotoUrl || '' }
              : AppImages.emptyProfile,
        } as any,
      })),
    [volunteers],
  );

  const handleSave = async () => {
    const selected = volunteers.find((v) => v.id === voluntarioId);
    if (!selected) return;
    setIsSaving(true);
    try {
      await onSave({
        voluntarioId: selected.id,
        voluntarioNome: selected.nome,
        fotoUrl: selected.fotoUrl ?? null,
        fotoThumbUrl: selected.fotoThumbUrl ?? null,
        hierarquia: VoluntarioHierarquiaEnum.Lider,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar líder'
      footer={
        <FancyButton
          label='Adicionar líder'
          type='contained'
          icon={{ library: 'Feather', name: 'user-plus', size: 16 }}
          disabled={!voluntarioId}
          isLoading={isSaving}
          onPress={handleSave}
        />
      }
    >
      <View style={styles.header}>
        <FancyText type='bold' size='medium'>
          Escolha o líder
        </FancyText>
        <FancyText size='small' color={palette.fonts.inactive}>
          O líder terá acesso completo a todas as funcionalidades do ministério.
        </FancyText>
      </View>
      <FancySearchSelect
        title='Líder'
        label='Líder'
        value={voluntarioId}
        onChange={(value) => setVoluntarioId(String(value))}
        listItems={volunteerOptions}
        searchPlaceholder='Buscar voluntário...'
      />
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
});
