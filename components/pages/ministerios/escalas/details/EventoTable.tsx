import { View, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { ThemePalette } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import ListaVoluntariosTable from './ListaVoluntariosTable';
import DefaultIcons from '../../../../FancyIcons';
import { FancyAlert } from '../../../../modal/FancyAlert';
import {
  EscalaItemDataType,
  EscalaItemEquipeType as EscalaItemEquipeType,
} from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import { useMemo, useState } from 'react';
import SubstituirVoluntarioModal, { SubstituicaoConfirmDialog } from './SubstituirVoluntarioModal';
import AdicionarVoluntarioModal, {
  AdicionarVoluntarioConfirmDialog,
} from './AdicionarVoluntarioModal';
import AdicionarFuncaoModal, { AdicionarFuncaoConfirmDialog } from './AdicionarFuncaoModal';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { useAppTheme } from '../../../../../hooks/useAppTheme';

export interface EventoTableProps {
  data: EscalaItemDataType;
  viewMode?: 'view' | 'edit';
  ministerioId: string;
  escalaId: string;
  onChangeVoluntario?: (data: SubstituicaoConfirmDialog) => Promise<boolean>;
  onAddVoluntario?: (data: AdicionarVoluntarioConfirmDialog) => Promise<boolean>;
  onRemoveVoluntario?: (idEscalaItem: string) => Promise<boolean>;
  onDeleteEvento?: (eventoId: string, dataOcorrencia: string) => Promise<boolean>;
  onAdicionarFuncao?: (data: AdicionarFuncaoConfirmDialog) => Promise<boolean>;
  onExcluirFuncao?: (funcaoId: string, eventoId: string, dataOcorrencia: string) => void;
}

export default function EventoTable({
  data,
  viewMode,
  ministerioId,
  escalaId: _escalaId,
  onChangeVoluntario,
  onAddVoluntario,
  onRemoveVoluntario,
  onDeleteEvento,
  onAdicionarFuncao,
  onExcluirFuncao,
}: EventoTableProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();
  const eventMetaColor = ColorUtils.withAlpha(palette.fonts.dark, 0.7);

  const [substituicaoModalProps, setSubstituicaoModalProps] = useState<{
    isOpen: boolean;
    data?: EscalaItemEquipeType;
  }>({
    isOpen: false,
  });
  const [adicionarModalProps, setAdicionarModalProps] = useState<{
    isOpen: boolean;
    data?: EscalaItemEquipeType;
  }>({
    isOpen: false,
  });
  const [adicionarFuncaoModalOpen, setAdicionarFuncaoModalOpen] = useState(false);

  const {
    borderColor,
    expandableIconColor,
    headerBackgroundColor,
    headerExpandedBackgroundColor,
    headerGradientColors,
    headerExpandedGradientColors,
  } = useMemo(() => {
    const accentColor = data.evento.cor || palette.primary;
    const darkStart = isDark
      ? ColorUtils.withAlpha(accentColor, 0.32)
      : ColorUtils.lightenColor(accentColor, 0.62);
    const midStart = isDark
      ? ColorUtils.withAlpha(accentColor, 0.26)
      : ColorUtils.lightenColor(accentColor, 0.72);
    const mid = isDark
      ? ColorUtils.withAlpha(accentColor, 0.22)
      : ColorUtils.lightenColor(accentColor, 0.76);
    const midEnd = isDark
      ? ColorUtils.withAlpha(accentColor, 0.18)
      : ColorUtils.lightenColor(accentColor, 0.8);
    const lightEnd = isDark
      ? ColorUtils.withAlpha(accentColor, 0.16)
      : ColorUtils.lightenColor(accentColor, 0.84);

    return {
      borderColor: accentColor,
      expandableIconColor:
        ColorUtils.getTextColorForBackground(accentColor) === '#FFFFFF'
          ? palette.fonts.light
          : ColorUtils.darkenColor(accentColor, 0.25),
      headerBackgroundColor: lightEnd,
      headerExpandedBackgroundColor: lightEnd,
      headerGradientColors: [lightEnd, midEnd, mid, midStart, darkStart],
      headerExpandedGradientColors: [lightEnd, midEnd, mid, midStart, darkStart],
    };
  }, [data.evento.cor, isDark, palette.primary, palette.fonts.light]);

  const handleDeleteEvento = () => {
    FancyAlert.alert('Excluir Evento', 'Deseja realmente excluir este evento da escala?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await onDeleteEvento?.(data.evento.id, data.dataOcorrencia);
        },
      },
    ]);
  };

  return (
    <>
      <FancyAccordeon
        title={
          <View style={styles.titleContainer}>
            <View style={styles.titleTextContainer}>
              <FancyText type='bold' size='extraSmall' color={palette.fonts.dark} numberOfLines={1}>
                {data.evento.nome}
              </FancyText>

              <View style={styles.headerMetaRow}>
                <View style={styles.metaGroup}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='event'
                    size={11}
                    color={eventMetaColor}
                  />
                  <FancyText type='semiBold' size={10} color={eventMetaColor}>
                    {format(data.dataOcorrencia, 'dd/MM/yyyy')}
                  </FancyText>
                </View>
                <View style={styles.metaGroup}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='access-time'
                    size={11}
                    color={eventMetaColor}
                  />
                  <FancyText type='semiBold' size={10} color={eventMetaColor}>{`${format(
                    data.evento.dataInicio!,
                    'HH:mm',
                  )} - ${format(data.evento.dataTermino!, 'HH:mm')}`}</FancyText>
                </View>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        headerContainerStyle={[styles.headerContainer, { backgroundColor: headerBackgroundColor }]}
        headerExpandedContainerStyle={[
          styles.headerExpandedContainer,
          {
            borderColor: borderColor,
            backgroundColor: headerExpandedBackgroundColor,
          },
        ]}
        headerGradientColors={headerGradientColors}
        headerExpandedGradientColors={headerExpandedGradientColors}
        headerGradientStart={{ x: 0, y: 0.5 }}
        headerGradientEnd={{ x: 1, y: 0.5 }}
        containerContainerStyle={[
          styles.containerContainer,
          {
            borderColor: borderColor,
            backgroundColor: headerBackgroundColor,
          },
        ]}
        containerExpandedContainerStyle={[
          styles.containerExpandedContainer,
          {
            borderColor: borderColor,
          },
        ]}
        iconProps={{ color: expandableIconColor, size: 18 }}
      >
        <ListaVoluntariosTable
          data={data.equipe}
          viewMode={viewMode}
          onSubstituicaoButtonPressed={(data) => {
            setSubstituicaoModalProps({ isOpen: true, data });
          }}
          onAdicionarVoluntarioButtonPressed={(data) => {
            setAdicionarModalProps({ isOpen: true, data });
          }}
          onRemoverVoluntarioPressed={(equipeItem) => {
            FancyAlert.alert(
              'Remover voluntário',
              'Deseja remover o voluntário desta função? A função permanecerá vaga na escala.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Remover',
                  style: 'destructive',
                  onPress: async () => {
                    await onRemoveVoluntario?.(equipeItem.idEscalaItem);
                  },
                },
              ],
            );
          }}
          onAdicionarFuncaoPressed={() => {
            setAdicionarFuncaoModalOpen(true);
          }}
          onExcluirFuncaoPressed={(funcaoId) => {
            FancyAlert.alert('Excluir Função', 'Deseja realmente excluir esta função do evento?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Excluir',
                style: 'destructive',
                onPress: () => {
                  onExcluirFuncao?.(funcaoId, data.evento.id, data.dataOcorrencia);
                },
              },
            ]);
          }}
          onExcluirEvento={handleDeleteEvento}
        />
      </FancyAccordeon>

      {substituicaoModalProps.isOpen && (
        <SubstituirVoluntarioModal
          data={{
            ...substituicaoModalProps.data!,
            evento: {
              dataInicio: data.evento.dataInicio!,
              dataTermino: data.evento.dataTermino!,
              dataOcorrencia: DateUtilsApi.dateTimeFromApi(data.dataOcorrencia),
            },
            ministerioId,
          }}
          onButton2Press={async (data) => {
            const result = await onChangeVoluntario?.(data);
            if (result) {
              setSubstituicaoModalProps({ isOpen: false });
            }
          }}
          onButton1Press={() => setSubstituicaoModalProps({ isOpen: false })}
          modalProps={{
            visible: substituicaoModalProps.isOpen,
          }}
        />
      )}

      {adicionarModalProps.isOpen && (
        <AdicionarVoluntarioModal
          data={{
            ...adicionarModalProps.data!,
            evento: {
              dataInicio: data.evento.dataInicio!,
              dataTermino: data.evento.dataTermino!,
              dataOcorrencia: DateUtilsApi.dateTimeFromApi(data.dataOcorrencia),
            },
            ministerioId,
          }}
          onButton2Press={async (data) => {
            const result = await onAddVoluntario?.(data);
            if (result) {
              setAdicionarModalProps({ isOpen: false });
            }
          }}
          onButton1Press={() => setAdicionarModalProps({ isOpen: false })}
          modalProps={{
            visible: adicionarModalProps.isOpen,
          }}
        />
      )}

      {adicionarFuncaoModalOpen && (
        <AdicionarFuncaoModal
          ministerioId={ministerioId}
          eventoNome={data.evento.nome}
          eventoId={data.evento.id}
          dataOcorrencia={DateUtilsApi.dateTimeFromApi(data.dataOcorrencia)}
          dataInicio={data.evento.dataInicio!}
          dataTermino={data.evento.dataTermino!}
          onButton2Press={async (funcaoData) => {
            const result = await onAdicionarFuncao?.(funcaoData);
            if (result) {
              setAdicionarFuncaoModalOpen(false);
            }
          }}
          onButton1Press={() => setAdicionarFuncaoModalOpen(false)}
          modalProps={{
            visible: adicionarFuncaoModalOpen,
          }}
        />
      )}
    </>
  );
}
function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    titleContainer: {
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    titleTextContainer: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    headerMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    metaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    contentContainer: {
      paddingHorizontal: 6,
      paddingTop: 4,
      paddingBottom: 4,
      borderWidth: 0,
      backgroundColor: palette.backgroundColor2,
    },
    headerContainer: {
      borderRadius: 12,
    },
    headerExpandedContainer: {
      borderRadius: 12,
      borderBottomWidth: 1,
    },
    containerContainer: {
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    containerExpandedContainer: {
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: palette.backgroundColor2,
      paddingBottom: 4,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
  });
}
