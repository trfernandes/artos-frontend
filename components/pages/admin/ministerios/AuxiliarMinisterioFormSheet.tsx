import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyCheckbox from '../../../FancyCheckbox';
import FancySearchSelect from '../../../fields/FancySearchSelect';
import FancyText from '../../../FancyText';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { usePallete } from '../../../../hooks/usePallete';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import {
  DefaultAuxiliarPermissionRows,
  RecursoPermissaoEnum,
  RecursoPermissaoEnumLabel,
  RecursosPermissoesTable,
  TipoPermissaoEnum,
  TipoPermissaoEnumLabel,
} from '../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { AddAuxiliarFormData } from '../../../../domain/schemas/ministerioAdminSchema';

type PermissionMap = Record<RecursoPermissaoEnum, Set<TipoPermissaoEnum>>;

const createEmptyPermissionMap = (): PermissionMap => ({
  [RecursoPermissaoEnum.AgendaEventos]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.Escalas]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.Integrantes]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.FuncoesTemplates]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.RepertorioSetlist]: new Set<TipoPermissaoEnum>(),
});

const createDefaultPermissionMap = () => {
  const next = createEmptyPermissionMap();
  DefaultAuxiliarPermissionRows.forEach((row) => {
    next[row.recurso] = new Set(row.permissoes);
  });
  return next;
};

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  volunteers: ResponseVoluntarioDto[];
  auxiliar?: AddAuxiliarFormData | null;
  onClose: () => void;
  onSave: (payload: AddAuxiliarFormData) => void | Promise<void>;
};

export default function AuxiliarMinisterioFormSheet({
  visible,
  mode,
  volunteers,
  auxiliar,
  onClose,
  onSave,
}: Props) {
  const palette = usePallete();
  const [voluntarioId, setVoluntarioId] = useState('');
  const [permissionMap, setPermissionMap] = useState<PermissionMap>(createDefaultPermissionMap);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const nextMap = createEmptyPermissionMap();
    const rows = auxiliar?.permissoes?.length ? auxiliar.permissoes : DefaultAuxiliarPermissionRows;
    rows.forEach((row) => {
      nextMap[row.recurso] = new Set(row.permissoes ?? []);
    });
    setPermissionMap(nextMap);
    setVoluntarioId(auxiliar?.voluntarioId ?? '');
  }, [auxiliar, visible]);

  const volunteerOptions = useMemo<DropDownItemProps<string>[]>(
    () =>
      volunteers.map((item) => ({
        title: item.nome,
        value: item.id,
        left: {
          type: 'image',
          source:
            item.fotoThumbUrl || item.fotoUrl
              ? { uri: item.fotoThumbUrl || item.fotoUrl || '' }
              : undefined,
        } as any,
      })),
    [volunteers],
  );

  const togglePermission = (recurso: RecursoPermissaoEnum, permissao: TipoPermissaoEnum) => {
    setPermissionMap((current) => {
      const next = { ...current, [recurso]: new Set(current[recurso]) };
      if (next[recurso].has(permissao)) {
        next[recurso].delete(permissao);
      } else {
        next[recurso].add(permissao);
      }
      return next;
    });
  };

  const normalizedPermissions = useMemo(
    () =>
      Object.entries(permissionMap)
        .map(([recurso, permissoes]) => ({
          recurso: recurso as RecursoPermissaoEnum,
          permissoes: Array.from(permissoes),
        }))
        .filter((item) => item.permissoes.length > 0),
    [permissionMap],
  );

  const handleSave = async () => {
    const selected = volunteers.find((item) => item.id === voluntarioId);
    if (!selected) return;
    setIsSaving(true);
    try {
      await onSave({
        voluntarioId: selected.id,
        voluntarioNome: selected.nome,
        fotoUrl: selected.fotoUrl || null,
        fotoThumbUrl: selected.fotoThumbUrl || null,
        permissoes: normalizedPermissions,
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
      title={mode === 'create' ? 'Adicionar auxiliar' : 'Editar acessos do auxiliar'}
      footer={
        <FancyButton
          label={mode === 'create' ? 'Adicionar auxiliar' : 'Salvar acessos'}
          type='contained'
          icon={{
            library: mode === 'create' ? 'Feather' : 'MaterialCommunityIcons',
            name: mode === 'create' ? 'user-plus' : 'content-save-outline',
            size: 16,
          }}
          disabled={!voluntarioId}
          isLoading={isSaving}
          onPress={handleSave}
        />
      }
    >
      <View style={styles.headerBlock}>
        <FancyText type='bold' size='medium'>
          {mode === 'create' ? 'Escolha o auxiliar e os acessos' : auxiliar?.voluntarioNome}
        </FancyText>
        <FancyText size='small' color={palette.fonts.inactive}>
          Defina quais áreas do ministério esse auxiliar poderá operar.
        </FancyText>
      </View>

      <FancySearchSelect
        title='Auxiliar'
        label='Auxiliar'
        value={voluntarioId}
        onChange={(value) => setVoluntarioId(String(value))}
        listItems={volunteerOptions}
        searchPlaceholder='Buscar voluntário...'
        disabled={mode === 'edit'}
      />

      <View style={styles.groupsContainer}>
        {(Object.values(RecursoPermissaoEnum) as RecursoPermissaoEnum[]).map((recurso) => (
          <View
            key={recurso}
            style={[
              styles.groupCard,
              { borderColor: palette.border, backgroundColor: palette.backgroundColor2 },
            ]}
          >
            <FancyText type='bold' size='small'>
              {RecursoPermissaoEnumLabel[recurso]}
            </FancyText>
            <View style={styles.permissionsGrid}>
              {RecursosPermissoesTable[recurso].map((permissao) => (
                <View key={`${recurso}-${permissao}`} style={styles.permissionCell}>
                  <FancyCheckbox
                    value={permissionMap[recurso]?.has(permissao) ?? false}
                    label={TipoPermissaoEnumLabel[permissao]}
                    onChangeValue={() => togglePermission(recurso, permissao)}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 6,
  },
  groupsContainer: {
    gap: 12,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 8,
  },
  permissionCell: {
    width: '48%',
  },
});
