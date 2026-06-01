import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyText from '../../../../../components/FancyText';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyButton from '../../../../../components/buttons/FancyButton';
import FancySectionHeader from '../../../../../components/cards/Horizontal/FancySectionHeader';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import AuxiliarAcessosEditorSheet from '../../../../../components/pages/ministerios/acessos/AuxiliarAcessosEditorSheet';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useMinisterioAcessos } from '../../../../../hooks/useMinisterioAcessos';
import { AppImages } from '../../../../../assets/app_images';
import { usePallete } from '../../../../../hooks/usePallete';
import { ResponseLoginMinisterioDto } from '../../../../../domain/dtos/login/login.response';
import { RecursoPermissaoEnumLabel } from '../../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { ResponseMinisterioAcessoMemberDto } from '../../../../../domain/dtos/MinisterioAcesso/ministerio-acesso.response';
import VoluntarioSummarySheet from '../../../../../components/pages/common/VoluntarioSummarySheet';

const summarizePermissions = (member: ResponseMinisterioAcessoMemberDto) => {
  const labels = (member.permissoes ?? []).map((item) => RecursoPermissaoEnumLabel[item.recurso]);
  return labels.length > 0 ? labels.join(' • ') : 'Sem acessos delegados';
};

export default function MinisterioAcessosIndexPage() {
  const palette = usePallete();
  const params = useLocalSearchParams<{ ministerioId: string }>();
  const { igrejaAtiva } = useAuth();
  const ministerio = useMemo(
    () =>
      igrejaAtiva?.ministerios?.find((item) => item.id === params.ministerioId) as
        | ResponseLoginMinisterioDto
        | undefined,
    [igrejaAtiva?.ministerios, params.ministerioId],
  );

  const canManage = useMemo(() => {
    const hierarquia = ministerio?.hierarquia?.toString();
    const role = igrejaAtiva?.role?.toString()?.toUpperCase();
    return role === 'ADMIN' || hierarquia === '1';
  }, [igrejaAtiva?.role, ministerio?.hierarquia]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    addAuxiliar,
    updateAuxiliar,
    removeAuxiliar,
    isLoadingMutation,
  } = useMinisterioAcessos(igrejaAtiva?.id, params.ministerioId);

  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedAuxiliar, setSelectedAuxiliar] =
    useState<ResponseMinisterioAcessoMemberDto | null>(null);
  const [selectedVoluntario, setSelectedVoluntario] = useState<any | null>(null);

  if (!canManage) {
    router.back();
    return null;
  }

  if (isLoading) {
    return <FancyLoading />;
  }

  return (
    <FancyPageView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBlock}>
          <FancyText size='small' color={palette.fonts.inactive}>
            Auxiliares ajudam na operação do ministério com acessos definidos pela liderança.
          </FancyText>
        </View>

        <View style={[styles.contextCard, { backgroundColor: palette.backgroundColor2 }]}>
          <FancyText type='semiBold' size='extraSmall' color={palette.fonts.inactive}>
            Ministério
          </FancyText>
          <FancyText type='bold' size='medium'>
            {data?.ministerioNome ?? ministerio?.nome}
          </FancyText>
        </View>

        <View style={styles.section}>
          <FancySectionHeader title='Líderes' containerStyle={{ marginLeft: 0 }} />
          {isError ? (
            <View style={[styles.emptyState, { backgroundColor: palette.backgroundColor2 }]}>
              <FancyText type='semiBold' size='small'>
                Não foi possível carregar os acessos
              </FancyText>
              <FancyText size='small' color={palette.fonts.inactive}>
                {(error as Error | undefined)?.message ||
                  'O backend pode estar sem deploy ou o endpoint pode ter falhado.'}
              </FancyText>
              <FancyButton
                label='Tentar novamente'
                type='contained'
                onPress={() => void refetch()}
                containerStyle={{ marginTop: 8, height: 38 }}
              />
            </View>
          ) : data?.lideres?.length ? (
            <View style={styles.cards}>
              {data.lideres.map((item) => (
                <FancyCard.Image
                  key={item.id}
                  type='image'
                  props={{
                    title: item.voluntario?.nome,
                    subtitle: 'Acesso total ao ministério',
                    centerContainerStyle: styles.personCardCenter,
                    source:
                      item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl
                        ? { uri: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl }
                        : AppImages.emptyProfile,
                    onPress: () =>
                      setSelectedVoluntario({
                        nome: item.voluntario?.nome || '-',
                        email: item.voluntario?.email || null,
                        telefone: item.voluntario?.telefone || null,
                        fotoUrl: item.voluntario?.fotoUrl || null,
                        fotoThumbUrl: item.voluntario?.fotoThumbUrl || null,
                        papelLabel: 'Líder',
                      }),
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: palette.backgroundColor2 }]}>
              <FancyText type='semiBold' size='small'>
                Nenhum líder encontrado
              </FancyText>
              <FancyText size='small' color={palette.fonts.inactive}>
                Este ministério ainda não possui liderança configurada.
              </FancyText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <FancySectionHeader
              title='Auxiliares'
              containerStyle={{ marginLeft: 0, flex: 1, marginBottom: 0 }}
            />
            <FancyButton
              label='Adicionar auxiliar'
              type='contained'
              icon={{ library: 'Feather', name: 'plus', size: 16 }}
              onPress={() => {
                setEditorMode('create');
                setSelectedAuxiliar(null);
                setEditorVisible(true);
              }}
              containerStyle={{ height: 38 }}
            />
          </View>

          {data?.auxiliares?.length ? (
            <View style={styles.cards}>
              {data.auxiliares.map((item) => (
                <FancyCard.Image
                  key={item.id}
                  type='image'
                  props={{
                    title: item.voluntario?.nome,
                    subtitle: summarizePermissions(item),
                    centerContainerStyle: styles.personCardCenter,
                    source:
                      item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl
                        ? { uri: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl }
                        : AppImages.emptyProfile,
                    onPress: () =>
                      setSelectedVoluntario({
                        nome: item.voluntario?.nome || '-',
                        email: item.voluntario?.email || null,
                        telefone: item.voluntario?.telefone || null,
                        fotoUrl: item.voluntario?.fotoUrl || null,
                        fotoThumbUrl: item.voluntario?.fotoThumbUrl || null,
                        papelLabel: 'Auxiliar',
                        permissionSummary: summarizePermissions(item),
                      }),
                    actionButtons: [
                      {
                        icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                        onPress: () => {
                          setEditorMode('edit');
                          setSelectedAuxiliar(item);
                          setEditorVisible(true);
                        },
                      },
                      {
                        icon: {
                          library: 'MaterialIcons',
                          name: 'delete',
                          size: 18,
                          backgroundColor: '#F05A4F',
                        },
                        onPress: () => {
                          FancyAlert.alert(
                            'Remover auxiliar',
                            'Deseja remover a delegação deste auxiliar?',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: 'Remover',
                                style: 'destructive',
                                onPress: () => void removeAuxiliar(item.id),
                              },
                            ],
                          );
                        },
                      },
                    ],
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: palette.backgroundColor2 }]}>
              <FancyText type='semiBold' size='small'>
                Nenhum auxiliar configurado
              </FancyText>
              <FancyText size='small' color={palette.fonts.inactive}>
                Adicione auxiliares para delegar acessos operacionais sem transformar todo mundo em
                líder.
              </FancyText>
            </View>
          )}
        </View>
      </ScrollView>

      <AuxiliarAcessosEditorSheet
        visible={editorVisible}
        mode={editorMode}
        accessData={data}
        auxiliar={selectedAuxiliar}
        onClose={() => setEditorVisible(false)}
        onSave={async (payload) => {
          if (editorMode === 'create') {
            await addAuxiliar(payload);
            return;
          }
          await updateAuxiliar({
            voluntarioId: payload.voluntarioId,
            permissoes: payload.permissoes,
          });
        }}
      />

      <VoluntarioSummarySheet
        visible={!!selectedVoluntario}
        onClose={() => setSelectedVoluntario(null)}
        data={selectedVoluntario}
      />
      {isLoadingMutation && <FancyLoading />}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 6,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 20,
  },
  topBlock: {
    gap: 6,
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
