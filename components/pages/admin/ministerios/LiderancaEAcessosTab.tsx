import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import FancySectionHeader from '../../../cards/Horizontal/FancySectionHeader';
import FancyButton from '../../../buttons/FancyButton';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { AppImages } from '../../../../assets/app_images';
import AddLiderancaFormSheet from './AddLiderancaFormSheet';
import AuxiliarMinisterioFormSheet from './AuxiliarMinisterioFormSheet';
import {
  AddAuxiliarFormData,
  AddLiderFormData,
  AddMinisterioFormData,
} from '../../../../domain/schemas/ministerioAdminSchema';
import { RecursoPermissaoEnumLabel } from '../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { useIgrejaVoluntariosCrud } from '../../../../hooks/useIgrejaVoluntariosCrud';
import { OrderDirection, Operator, ValueType } from '../../../../domain/utils/query_utils';
import FancyLoading from '../../../FancyLoading';
import { useMinisteriosCrud } from '../../../../hooks/useMinisteriosCrud';
import { useMinisterioVoluntariosCrud } from '../../../../hooks/useMinisterioVoluntariosCrud';
import { useAuth } from '../../../../contexts/AuthContext';
import { MinisterioAcessosRepository } from '../../../../domain/services/MinisterioAcessosRepository';
import { useLoading } from '../../../../contexts/LoadingContext';
import {
  VoluntarioHierarquiaEnum,
  VoluntarioHierarquiaEnumMap,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import { FancyAlert } from '../../../modal/FancyAlert';
import { MinisterioVoluntarioStatusEnum } from '../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { MinisterioVoluntarioStatusEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import VoluntarioSummarySheet from '../../common/VoluntarioSummarySheet';

type Props =
  | {
      mode: 'add';
    }
  | {
      mode: 'edit';
      ministerioId: string;
    };

const summarizePermissions = (
  permissions: AddAuxiliarFormData['permissoes'] | ResponseMinisterioVoluntarioDto['permissoes'],
) => {
  const labels = (permissions ?? []).map((item) => RecursoPermissaoEnumLabel[item.recurso]);
  return labels.length > 0 ? labels.join(' • ') : 'Sem acessos delegados';
};

const getCardImageSource = (item: {
  voluntario?: { fotoThumbUrl?: string; fotoUrl?: string; nome?: string };
  fotoThumbUrl?: string | null;
  fotoUrl?: string | null;
}) =>
  item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl || item.fotoThumbUrl || item.fotoUrl
    ? {
        uri:
          item.voluntario?.fotoThumbUrl ||
          item.voluntario?.fotoUrl ||
          item.fotoThumbUrl ||
          item.fotoUrl ||
          '',
      }
    : AppImages.emptyProfile;

const toAuxiliarFormData = (member: ResponseMinisterioVoluntarioDto): AddAuxiliarFormData => ({
  id: member.id,
  voluntarioId: member.voluntarioId,
  voluntarioNome: member.voluntario?.nome || '',
  fotoUrl: member.voluntario?.fotoUrl || null,
  fotoThumbUrl: member.voluntario?.fotoThumbUrl || null,
  permissoes: member.permissoes ?? [],
});

const normalizeHierarchy = (hierarquia?: string | number | null) => {
  if (hierarquia === null || hierarquia === undefined) return VoluntarioHierarquiaEnum.Voluntario;
  return VoluntarioHierarquiaEnumMap[String(hierarquia)] ?? VoluntarioHierarquiaEnum.Voluntario;
};

const sortVolunteersByName = <T extends { nome?: string | null }>(items: T[]) =>
  [...items].sort((a, b) =>
    (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR', { sensitivity: 'base' }),
  );

const sortMembersByName = <
  T extends { voluntarioNome?: string | null; voluntario?: { nome?: string | null } | null },
>(
  items: T[],
) =>
  [...items].sort((a, b) =>
    (a.voluntarioNome ?? a.voluntario?.nome ?? '').localeCompare(
      b.voluntarioNome ?? b.voluntario?.nome ?? '',
      'pt-BR',
      {
        sensitivity: 'base',
      },
    ),
  );

export default function LiderancaEAcessosTab(props: Props) {
  if (props.mode === 'add') {
    return <LiderancaEAcessosAddTab />;
  }

  return <LiderancaEAcessosEditTab ministerioId={props.ministerioId} />;
}

function SectionContainer({
  title,
  buttonLabel,
  onPress,
  children,
}: {
  title: string;
  buttonLabel: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <FancySectionHeader
          title={title}
          containerStyle={{ marginLeft: 0, flex: 1, marginBottom: 0 }}
        />
        <FancyButton
          accessibilityLabel={buttonLabel}
          type='contained'
          mode='icon'
          size={38}
          icon={{ library: 'Feather', name: 'plus', size: 24 }}
          onPress={onPress}
          containerStyle={styles.sectionAddButton}
        />
      </View>
      {children}
    </View>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  const palette = usePallete();
  return (
    <View style={[styles.emptyState, { backgroundColor: palette.backgroundColor2 }]}>
      <FancyText type='semiBold' size='small'>
        {title}
      </FancyText>
      <FancyText size='small' color={palette.fonts.inactive}>
        {subtitle}
      </FancyText>
    </View>
  );
}

function LiderancaEAcessosAddTab() {
  const palette = usePallete();
  const form = useFormContext<AddMinisterioFormData>();
  const watchedNome = useWatch({ control: form.control, name: 'nome' });
  const [leaderModalVisible, setLeaderModalVisible] = useState(false);
  const [auxiliarModalVisible, setAuxiliarModalVisible] = useState(false);
  const [editingAuxiliar, setEditingAuxiliar] = useState<AddAuxiliarFormData | null>(null);
  const [selectedVoluntario, setSelectedVoluntario] = useState<any | null>(null);

  const lideresFieldArray = useFieldArray({
    control: form.control,
    name: 'lideres',
    keyName: 'fieldId',
  });

  const auxiliaresFieldArray = useFieldArray({
    control: form.control,
    name: 'auxiliares',
    keyName: 'fieldId',
  });

  const { data: igrejaVoluntarios, isLoading } = useIgrejaVoluntariosCrud({
    autoFetch: true,
    initialParams: { orderBy: [{ path: 'nome', direction: OrderDirection.ASC }] },
  });

  const lideres = form.watch('lideres') ?? [];
  const auxiliares = form.watch('auxiliares') ?? [];
  const sortedLideres = useMemo(() => sortMembersByName(lideres), [lideres]);
  const sortedAuxiliares = useMemo(() => sortMembersByName(auxiliares), [auxiliares]);

  const liderVolunteerIds = useMemo(
    () => new Set(lideres.map((item) => item.voluntarioId)),
    [lideres],
  );
  const auxiliarVolunteerIds = useMemo(
    () => new Set(auxiliares.map((item) => item.voluntarioId)),
    [auxiliares],
  );

  const eligibleLeaderVolunteers = useMemo(
    () =>
      sortVolunteersByName(
        (igrejaVoluntarios ?? []).filter(
          (item) => !liderVolunteerIds.has(item.id) && !auxiliarVolunteerIds.has(item.id),
        ),
      ),
    [auxiliarVolunteerIds, igrejaVoluntarios, liderVolunteerIds],
  );

  const eligibleAuxiliarVolunteers = useMemo(
    () =>
      sortVolunteersByName(
        (igrejaVoluntarios ?? []).filter(
          (item) => !auxiliarVolunteerIds.has(item.id) && !liderVolunteerIds.has(item.id),
        ),
      ),
    [auxiliarVolunteerIds, igrejaVoluntarios, liderVolunteerIds],
  );

  const handleSaveAuxiliar = useCallback(
    async (payload: AddAuxiliarFormData) => {
      const index = auxiliares.findIndex((item) => item.voluntarioId === payload.voluntarioId);
      if (index >= 0) {
        auxiliaresFieldArray.update(index, payload);
      } else {
        auxiliaresFieldArray.append(payload);
      }
    },
    [auxiliares, auxiliaresFieldArray],
  );

  if (isLoading) {
    return <FancyLoading />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.contextCard, { backgroundColor: palette.backgroundColor2 }]}>
        <FancyText type='semiBold' size='extraSmall' color={palette.fonts.inactive}>
          Ministério
        </FancyText>
        <FancyText type='bold' size='medium'>
          {watchedNome || 'Novo ministério'}
        </FancyText>
      </View>

      <SectionContainer
        title='Líderes'
        buttonLabel='Adicionar líder'
        onPress={() => setLeaderModalVisible(true)}
      >
        {sortedLideres.length ? (
          <View style={styles.cards}>
            {sortedLideres.map((item) => (
              <FancyCard.Image
                key={item.voluntarioId}
                type='image'
                props={{
                  title: item.voluntarioNome,
                  subtitle: 'Acesso total ao ministério',
                  source: getCardImageSource(item),
                  centerContainerStyle: styles.personCardCenter,
                  onPress: () =>
                    setSelectedVoluntario({
                      nome: item.voluntarioNome,
                      email: null,
                      telefone: null,
                      fotoUrl: item.fotoUrl,
                      fotoThumbUrl: item.fotoThumbUrl,
                      papelLabel: 'Líder',
                      ministerioLabel: watchedNome || 'Novo ministério',
                    }),
                  actionButtons: [
                    {
                      icon: {
                        library: 'MaterialIcons',
                        name: 'delete',
                        size: 18,
                        backgroundColor: '#F05A4F',
                      },
                      onPress: () => {
                        if (lideres.length <= 1) {
                          FancyAlert.alert(
                            'Líder obrigatório',
                            'O ministério precisa de ao menos um líder. Adicione outro líder antes de remover este.',
                            [{ text: 'Entendi', style: 'cancel' }],
                          );
                          return;
                        }
                        lideresFieldArray.remove(
                          lideres.findIndex((lider) => lider.voluntarioId === item.voluntarioId),
                        );
                      },
                    },
                  ],
                }}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title='Nenhum líder definido'
            subtitle='Adicione ao menos um líder para a gestão do ministério.'
          />
        )}
      </SectionContainer>

      <SectionContainer
        title='Auxiliares'
        buttonLabel='Adicionar auxiliar'
        onPress={() => {
          setEditingAuxiliar(null);
          setAuxiliarModalVisible(true);
        }}
      >
        {sortedAuxiliares.length ? (
          <View style={styles.cards}>
            {sortedAuxiliares.map((item) => (
              <FancyCard.Image
                key={item.voluntarioId}
                type='image'
                props={{
                  title: item.voluntarioNome,
                  subtitle: summarizePermissions(item.permissoes),
                  source: getCardImageSource(item),
                  centerContainerStyle: styles.personCardCenter,
                  onPress: () =>
                    setSelectedVoluntario({
                      nome: item.voluntarioNome,
                      email: null,
                      telefone: null,
                      fotoUrl: item.fotoUrl,
                      fotoThumbUrl: item.fotoThumbUrl,
                      papelLabel: 'Auxiliar',
                      ministerioLabel: watchedNome || 'Novo ministério',
                      permissionSummary: summarizePermissions(item.permissoes),
                    }),
                  actionButtons: [
                    {
                      icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                      onPress: () => {
                        setEditingAuxiliar(item);
                        setAuxiliarModalVisible(true);
                      },
                    },
                    {
                      icon: {
                        library: 'MaterialIcons',
                        name: 'delete',
                        size: 18,
                        backgroundColor: '#F05A4F',
                      },
                      onPress: () =>
                        auxiliaresFieldArray.remove(
                          auxiliares.findIndex(
                            (auxiliar) => auxiliar.voluntarioId === item.voluntarioId,
                          ),
                        ),
                    },
                  ],
                }}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title='Nenhum auxiliar configurado'
            subtitle='Adicione auxiliares para delegar acessos operacionais sem transformar todo mundo em líder.'
          />
        )}
      </SectionContainer>

      <AddLiderancaFormSheet
        visible={leaderModalVisible}
        volunteers={eligibleLeaderVolunteers}
        onClose={() => setLeaderModalVisible(false)}
        onSave={(data) => {
          lideresFieldArray.append({ ...data, hierarquia: VoluntarioHierarquiaEnum.Lider });
        }}
      />

      <AuxiliarMinisterioFormSheet
        visible={auxiliarModalVisible}
        mode={editingAuxiliar ? 'edit' : 'create'}
        auxiliar={editingAuxiliar}
        volunteers={
          editingAuxiliar
            ? (igrejaVoluntarios ?? []).filter((item) => item.id === editingAuxiliar.voluntarioId)
            : eligibleAuxiliarVolunteers
        }
        onClose={() => {
          setAuxiliarModalVisible(false);
          setEditingAuxiliar(null);
        }}
        onSave={handleSaveAuxiliar}
      />
      <VoluntarioSummarySheet
        visible={!!selectedVoluntario}
        onClose={() => setSelectedVoluntario(null)}
        data={selectedVoluntario}
      />
    </ScrollView>
  );
}

function LiderancaEAcessosEditTab({ ministerioId }: { ministerioId: string }) {
  const palette = usePallete();
  const { igrejaAtiva } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [leaderModalVisible, setLeaderModalVisible] = useState(false);
  const [auxiliarModalVisible, setAuxiliarModalVisible] = useState(false);
  const [editingAuxiliar, setEditingAuxiliar] = useState<AddAuxiliarFormData | null>(null);
  const [selectedVoluntario, setSelectedVoluntario] = useState<any | null>(null);

  const { data: igrejaVoluntarios, isLoading: isLoadingVoluntarios } = useIgrejaVoluntariosCrud({
    autoFetch: true,
    initialParams: { orderBy: [{ path: 'nome', direction: OrderDirection.ASC }] },
  });

  const ministerioQuery = useMemo(
    () => ({
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
      relations: ['voluntarios', 'voluntarios.voluntario', 'voluntarios.permissoes'],
    }),
    [ministerioId],
  );

  const {
    data: ministerioData,
    isLoading: isLoadingMinisterio,
    isError,
    refetch,
  } = useMinisteriosCrud({
    autoFetch: true,
    initialParams: ministerioQuery,
    muteMessages: true,
  });

  const { add: addVoluntario, update: updateVoluntario } = useMinisterioVoluntariosCrud({
    autoFetch: false,
    muteMessages: true,
  });

  const currentMinisterio = ministerioData?.[0];
  const memberships = currentMinisterio?.voluntarios ?? [];
  const lideres = memberships.filter(
    (item) => normalizeHierarchy(item.hierarquia) === VoluntarioHierarquiaEnum.Lider,
  );
  const auxiliares = memberships.filter(
    (item) => normalizeHierarchy(item.hierarquia) === VoluntarioHierarquiaEnum.Auxiliar,
  );
  const sortedLideres = useMemo(() => sortMembersByName(lideres), [lideres]);
  const sortedAuxiliares = useMemo(() => sortMembersByName(auxiliares), [auxiliares]);

  const ministryMembers = useMemo<ResponseVoluntarioDto[]>(
    () =>
      sortVolunteersByName(
        memberships
          .filter(
            (item) => item.voluntario && item.status !== MinisterioVoluntarioStatusEnum.Inativo,
          )
          .map((item) => item.voluntario!)
          .filter(
            (item, index, array) =>
              array.findIndex((candidate) => candidate.id === item.id) === index,
          ),
      ),
    [memberships],
  );

  const availableVolunteerPool = useMemo<ResponseVoluntarioDto[]>(
    () =>
      ministryMembers.length ? ministryMembers : sortVolunteersByName(igrejaVoluntarios ?? []),
    [igrejaVoluntarios, ministryMembers],
  );

  // Liderança pode ser promovida a partir de QUALQUER voluntário ativo da igreja
  // (inclusive admins que ainda não são membros do ministério). handleAddLeader já
  // cria o vínculo quando o escolhido não é membro. Não restringir a ministryMembers.
  const churchVolunteerPool = useMemo<ResponseVoluntarioDto[]>(
    () => sortVolunteersByName(igrejaVoluntarios ?? []),
    [igrejaVoluntarios],
  );

  const leaderVolunteerIds = useMemo(
    () => new Set(lideres.map((item) => item.voluntarioId)),
    [lideres],
  );
  const auxiliarVolunteerIds = useMemo(
    () => new Set(auxiliares.map((item) => item.voluntarioId)),
    [auxiliares],
  );

  const eligibleLeaderVolunteers = useMemo(
    () =>
      churchVolunteerPool.filter(
        (item) => !leaderVolunteerIds.has(item.id) && !auxiliarVolunteerIds.has(item.id),
      ),
    [auxiliarVolunteerIds, churchVolunteerPool, leaderVolunteerIds],
  );

  const eligibleAuxiliarVolunteers = useMemo(
    () =>
      sortVolunteersByName(
        availableVolunteerPool.filter(
          (item) => !auxiliarVolunteerIds.has(item.id) && !leaderVolunteerIds.has(item.id),
        ),
      ),
    [auxiliarVolunteerIds, availableVolunteerPool, leaderVolunteerIds],
  );

  const refetchAll = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleAddLeader = useCallback(
    async (payload: AddLiderFormData) => {
      const existing = memberships.find((item) => item.voluntarioId === payload.voluntarioId);
      showLoading('Salvando...');
      try {
        if (existing) {
          await updateVoluntario?.({
            id: existing.id,
            data: { hierarquia: Number(VoluntarioHierarquiaEnum.Lider) as any },
          });
        } else {
          await addVoluntario?.({
            ministerioId,
            voluntarioId: payload.voluntarioId,
            hierarquia: Number(VoluntarioHierarquiaEnum.Lider) as any,
          });
        }
        await refetchAll();
      } finally {
        hideLoading();
      }
    },
    [
      addVoluntario,
      hideLoading,
      memberships,
      ministerioId,
      refetchAll,
      showLoading,
      updateVoluntario,
    ],
  );

  const handleRemoveLeader = useCallback(
    async (item: ResponseMinisterioVoluntarioDto) => {
      if (lideres.length <= 1) {
        FancyAlert.alert(
          'Líder obrigatório',
          'O ministério precisa de ao menos um líder. Adicione outro líder antes de remover este.',
          [{ text: 'Entendi', style: 'cancel' }],
        );
        return;
      }
      FancyAlert.alert('Remover liderança', 'Deseja remover esse líder da gestão do ministério?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            showLoading('Salvando...');
            try {
              await updateVoluntario?.({
                id: item.id,
                data: { hierarquia: Number(VoluntarioHierarquiaEnum.Voluntario) as any },
              });
              await refetchAll();
            } finally {
              hideLoading();
            }
          },
        },
      ]);
    },
    [hideLoading, lideres.length, refetchAll, showLoading, updateVoluntario],
  );

  const handleSaveAuxiliar = useCallback(
    async (payload: AddAuxiliarFormData) => {
      showLoading('Salvando...');
      try {
        const existing = memberships.find((item) => item.voluntarioId === payload.voluntarioId);
        if (!existing) {
          await addVoluntario?.({
            ministerioId,
            voluntarioId: payload.voluntarioId,
            hierarquia: Number(VoluntarioHierarquiaEnum.Auxiliar) as any,
          });
        }

        if (editingAuxiliar) {
          await MinisterioAcessosRepository.updateAuxiliar(
            igrejaAtiva!.id,
            ministerioId,
            payload.voluntarioId,
            {
              permissoes: payload.permissoes,
            },
          );
        } else {
          await MinisterioAcessosRepository.addAuxiliar(igrejaAtiva!.id, ministerioId, {
            voluntarioId: payload.voluntarioId,
            permissoes: payload.permissoes,
          });
        }

        await refetchAll();
      } finally {
        hideLoading();
      }
    },
    [
      addVoluntario,
      editingAuxiliar,
      hideLoading,
      igrejaAtiva,
      memberships,
      ministerioId,
      refetchAll,
      showLoading,
    ],
  );

  const handleRemoveAuxiliar = useCallback(
    async (item: ResponseMinisterioVoluntarioDto) => {
      FancyAlert.alert(
        'Remover auxiliar',
        'Deseja remover esse auxiliar e manter o voluntário no ministério?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              showLoading('Salvando...');
              try {
                await MinisterioAcessosRepository.removeAuxiliar(
                  igrejaAtiva!.id,
                  ministerioId,
                  item.id,
                );
                await refetchAll();
              } finally {
                hideLoading();
              }
            },
          },
        ],
      );
    },
    [hideLoading, igrejaAtiva, ministerioId, refetchAll, showLoading],
  );

  if (isLoadingVoluntarios || isLoadingMinisterio) {
    return <FancyLoading />;
  }

  if (isError) {
    return (
      <View style={{ paddingTop: 10 }}>
        <EmptyState
          title='Não foi possível carregar liderança e acessos'
          subtitle='Atualize a tela e tente novamente.'
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.contextCard, { backgroundColor: palette.backgroundColor2 }]}>
        <FancyText type='semiBold' size='extraSmall' color={palette.fonts.inactive}>
          Ministério
        </FancyText>
        <FancyText type='bold' size='medium'>
          {currentMinisterio?.nome}
        </FancyText>
      </View>

      <SectionContainer
        title='Líderes'
        buttonLabel='Adicionar líder'
        onPress={() => setLeaderModalVisible(true)}
      >
        {sortedLideres.length ? (
          <View style={styles.cards}>
            {sortedLideres.map((item) => (
              <FancyCard.Image
                key={item.id}
                type='image'
                props={{
                  title: item.voluntario?.nome,
                  subtitle: 'Acesso total ao ministério',
                  source: getCardImageSource(item),
                  centerContainerStyle: styles.personCardCenter,
                  onPress: () =>
                    setSelectedVoluntario({
                      nome: item.voluntario?.nome || '-',
                      email: item.voluntario?.email || null,
                      telefone: item.voluntario?.telefone || null,
                      fotoUrl: item.voluntario?.fotoUrl || null,
                      fotoThumbUrl: item.voluntario?.fotoThumbUrl || null,
                      papelLabel: 'Líder',
                      statusLabel: MinisterioVoluntarioStatusEnumLabel[item.status],
                      ministerioLabel: currentMinisterio?.nome || null,
                    }),
                  actionButtons: [
                    {
                      icon: {
                        library: 'MaterialIcons',
                        name: 'delete',
                        size: 18,
                        backgroundColor: '#F05A4F',
                      },
                      onPress: () => void handleRemoveLeader(item),
                    },
                  ],
                }}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title='Nenhum líder definido'
            subtitle='Adicione ao menos um líder para a gestão do ministério.'
          />
        )}
      </SectionContainer>

      <SectionContainer
        title='Auxiliares'
        buttonLabel='Adicionar auxiliar'
        onPress={() => {
          setEditingAuxiliar(null);
          setAuxiliarModalVisible(true);
        }}
      >
        {sortedAuxiliares.length ? (
          <View style={styles.cards}>
            {sortedAuxiliares.map((item) => (
              <FancyCard.Image
                key={item.id}
                type='image'
                props={{
                  title: item.voluntario?.nome,
                  subtitle: summarizePermissions(item.permissoes),
                  source: getCardImageSource(item),
                  centerContainerStyle: styles.personCardCenter,
                  onPress: () =>
                    setSelectedVoluntario({
                      nome: item.voluntario?.nome || '-',
                      email: item.voluntario?.email || null,
                      telefone: item.voluntario?.telefone || null,
                      fotoUrl: item.voluntario?.fotoUrl || null,
                      fotoThumbUrl: item.voluntario?.fotoThumbUrl || null,
                      papelLabel: 'Auxiliar',
                      statusLabel: MinisterioVoluntarioStatusEnumLabel[item.status],
                      ministerioLabel: currentMinisterio?.nome || null,
                      permissionSummary: summarizePermissions(item.permissoes),
                    }),
                  actionButtons: [
                    {
                      icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                      onPress: () => {
                        setEditingAuxiliar(toAuxiliarFormData(item));
                        setAuxiliarModalVisible(true);
                      },
                    },
                    {
                      icon: {
                        library: 'MaterialIcons',
                        name: 'delete',
                        size: 18,
                        backgroundColor: '#F05A4F',
                      },
                      onPress: () => void handleRemoveAuxiliar(item),
                    },
                  ],
                }}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title='Nenhum auxiliar configurado'
            subtitle='Adicione auxiliares para delegar acessos operacionais sem transformar todo mundo em líder.'
          />
        )}
      </SectionContainer>

      <AddLiderancaFormSheet
        visible={leaderModalVisible}
        volunteers={eligibleLeaderVolunteers}
        onClose={() => setLeaderModalVisible(false)}
        onSave={handleAddLeader}
      />

      <AuxiliarMinisterioFormSheet
        visible={auxiliarModalVisible}
        mode={editingAuxiliar ? 'edit' : 'create'}
        auxiliar={editingAuxiliar}
        volunteers={
          editingAuxiliar
            ? availableVolunteerPool.filter((item) => item.id === editingAuxiliar.voluntarioId)
            : eligibleAuxiliarVolunteers
        }
        onClose={() => {
          setAuxiliarModalVisible(false);
          setEditingAuxiliar(null);
        }}
        onSave={handleSaveAuxiliar}
      />
      <VoluntarioSummarySheet
        visible={!!selectedVoluntario}
        onClose={() => setSelectedVoluntario(null)}
        data={selectedVoluntario}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
    gap: 20,
  },
  contextCard: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionAddButton: {
    width: 38,
    height: 38,
  },
  cards: {
    gap: 10,
  },
  personCardCenter: {
    gap: 2,
  },
  emptyState: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 6,
  },
});
