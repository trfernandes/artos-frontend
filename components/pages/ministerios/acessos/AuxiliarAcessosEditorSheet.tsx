import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyBottomSheetSelect from '../../../fields/FancyBottomSheetSelect';
import FancyCheckbox from '../../../FancyCheckbox';
import FancyText from '../../../FancyText';
import {
  ResponseMinisterioAcessoDto,
  ResponseMinisterioAcessoMemberDto,
} from '../../../../domain/dtos/MinisterioAcesso/ministerio-acesso.response';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import {
  RecursoPermissaoEnum,
  RecursoPermissaoEnumLabel,
  RecursosPermissoesTable,
  TipoPermissaoEnum,
  TipoPermissaoEnumLabel,
} from '../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { UpsertMinisterioAuxiliarDto } from '../../../../domain/dtos/MinisterioAcesso/ministerio-acesso.upsert';
import { usePallete } from '../../../../hooks/usePallete';

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  accessData?: ResponseMinisterioAcessoDto;
  auxiliar?: ResponseMinisterioAcessoMemberDto | null;
  onClose: () => void;
  onSave: (payload: UpsertMinisterioAuxiliarDto) => Promise<void>;
};

type PermissionMap = Record<RecursoPermissaoEnum, Set<TipoPermissaoEnum>>;

const createEmptyPermissionMap = (): PermissionMap => ({
  [RecursoPermissaoEnum.AgendaEventos]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.Escalas]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.Integrantes]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.FuncoesTemplates]: new Set<TipoPermissaoEnum>(),
  [RecursoPermissaoEnum.RepertorioSetlist]: new Set<TipoPermissaoEnum>(),
});

export default function AuxiliarAcessosEditorSheet({
  visible,
  mode,
  accessData,
  auxiliar,
  onClose,
  onSave,
}: Props) {
  const palette = usePallete();
  const [voluntarioId, setVoluntarioId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [permissionMap, setPermissionMap] = useState<PermissionMap>(createEmptyPermissionMap);

  useEffect(() => {
    if (!visible) return;
    const nextMap = createEmptyPermissionMap();
    const sourceRows =
      (auxiliar?.permissoes?.length ? auxiliar.permissoes : accessData?.pacoteAuxiliarPadrao) ?? [];
    sourceRows.forEach((row) => {
      nextMap[row.recurso] = new Set(row.permissoes ?? []);
    });
    setPermissionMap(nextMap);
    setVoluntarioId(auxiliar?.voluntarioId ?? '');
  }, [visible, auxiliar, accessData]);

  const elegiveis = accessData?.elegiveis ?? [];
  const volunteerOptions = useMemo(
    () =>
      elegiveis.map((item: ResponseVoluntarioDto) => ({
        title: item.nome,
        value: item.id,
      })),
    [elegiveis],
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
    if (!voluntarioId) return;
    setIsSaving(true);
    try {
      await onSave({
        voluntarioId,
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
      title={mode === 'create' ? 'Adicionar auxiliar' : 'Editar acessos'}
      footer={
        <FancyButton
          label={mode === 'create' ? 'Adicionar auxiliar' : 'Salvar'}
          type='contained'
          icon={{
            library: mode === 'create' ? 'Feather' : 'MaterialCommunityIcons',
            name: mode === 'create' ? 'user-plus' : 'content-save-outline',
            size: 16,
          }}
          disabled={!voluntarioId}
          isLoading={isSaving}
          onPress={handleSave}
          containerStyle={{ marginBottom: 8 }}
        />
      }
    >
      <View style={styles.headerBlock}>
        <FancyText type='bold' size='medium'>
          {mode === 'create'
            ? 'Defina o auxiliar e os acessos operacionais'
            : auxiliar?.voluntario?.nome}
        </FancyText>
        <FancyText size='small' color={palette.fonts.inactive}>
          Auxiliares ajudam na operação do ministério com acessos definidos pela liderança.
        </FancyText>
      </View>

      {mode === 'create' ? (
        <FancyBottomSheetSelect
          title='Integrante'
          label='Integrante'
          value={voluntarioId}
          onChange={(value) => setVoluntarioId(String(value))}
          listItems={volunteerOptions}
        />
      ) : (
        <View style={styles.memberSummary}>
          <FancyText type='semiBold' size='small'>
            Auxiliar
          </FancyText>
          <FancyText size='small' color={palette.fonts.inactive}>
            {auxiliar?.voluntario?.nome}
          </FancyText>
        </View>
      )}

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
            <View style={styles.permissionsList}>
              {RecursosPermissoesTable[recurso].map((permissao) => (
                <FancyCheckbox
                  key={`${recurso}-${permissao}`}
                  value={permissionMap[recurso]?.has(permissao) ?? false}
                  label={TipoPermissaoEnumLabel[permissao]}
                  onChangeValue={() => togglePermission(recurso, permissao)}
                />
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
  memberSummary: {
    gap: 4,
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
  permissionsList: {
    gap: 12,
  },
});
