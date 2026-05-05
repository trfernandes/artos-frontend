import { StyleSheet, View } from 'react-native';
import FancyContainer from '../../../FancyContainer';
import FancyBottomSheetSelect from '../../../fields/FancyBottomSheetSelect';
import FancyButton from '../../../buttons/FancyButton';
import { useEscalaTemplatesCrud } from '../../../../useEscalaTemplatesCrud';
import { Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import FancyLoading from '../../../FancyLoading';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import Toast from 'react-native-toast-message';
import EventoInfoCard from '../../common/EventoInfoCard';
import { Pallete } from '../../../../constants/colors';
import { ResponseEventoDto } from '../../../../domain/dtos/Evento/evento.response';
import { ResponseEventoOcorrenciaDto } from '../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { EscalaTemplateTipoLabel } from '../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { useEventoTemplatePadrao } from '../../../../hooks/useEventoTemplatePadrao';
import { TemplatePadraoOrigemEnum } from '../../../../domain/enums/Evento/template-padrao-origem.enum';
import { TemplatePadraoEscopoEnum } from '../../../../domain/enums/Evento/template-padrao-escopo.enum';
import { FancyAlert } from '../../../modal/FancyAlert';
import { getApiErrorMessage } from '../../../../domain/api/api-error';
import { useAuth } from '../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../domain/enums/Igreja/voluntario-role.enum';
import FancyText from '../../../FancyText';
import { useLoading } from '../../../../contexts/LoadingContext';

const TemplatePadraoOrigemLabel = {
  EVENTO: 'Este evento está usando o template base.',
  SERIE: 'Este evento está usando o template aplicado desta data em diante.',
  OCORRENCIA: 'Este evento está com ajuste aplicado só nesta data.',
} as const;

export default function AgendaDetailsDadosTab(props: {
  ministerioId: string;
  dataOcorrenciaIso: string;
  dataOcorrenciaDate: Date;
  evento: ResponseEventoDto;
  ocorrencia?: ResponseEventoOcorrenciaDto;
  onTemplateSaved?: () => Promise<void> | void;
}) {
  const { igrejaAtiva } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const canUpdateTemplate = igrejaAtiva?.role !== IgrejaVoluntarioRoleEnum.VOLUNTARIO;
  const { data: templates, isLoading: isLoadingTemplates } = useEscalaTemplatesCrud({
    autoFetch: false,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: props.ministerioId,
            },
          },
        ],
      },
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    },
  });

  const templatesList = useMemo<DropDownItemProps<string>[]>(() => {
    const list = [
      ...[{ title: 'Nenhum', subtitle: '', value: '' } as DropDownItemProps<string>],
      ...templates.map(
        (t) =>
          ({
            title: t.nome,
            subtitle: EscalaTemplateTipoLabel[t.tipo],
            value: t.id,
          } as DropDownItemProps<string>),
      ),
    ];
    return list;
  }, [templates]);

  const { salvarTemplatePadrao, removerTemplatePadrao } = useEventoTemplatePadrao();

  const resolvedTemplateId = useMemo(
    () => props.ocorrencia?.templatePadraoId ?? props.evento.templatePadraoId ?? props.evento.templatePadrao?.id ?? '',
    [props.evento.templatePadrao?.id, props.evento.templatePadraoId, props.ocorrencia?.templatePadraoId],
  );

  const [templateId, setTemplateId] = useState<string>('');

  useEffect(() => {
    setTemplateId(resolvedTemplateId);
  }, [resolvedTemplateId]);

  const saveTemplateByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId) return;

      const payload = {
        dataOcorrencia: props.dataOcorrenciaIso,
        escopo,
        templatePadraoId: templateId || null,
      };

      if (__DEV__) {
        const separator = '==============================================================';
        console.log('\n\n');
        console.log(separator);
        console.log('[TemplatePadrao] SALVAR - REQUEST');
        console.log(`[TemplatePadrao] eventoId: ${eventoId}`);
        console.log('[TemplatePadrao] payload:', JSON.stringify(payload, null, 2));
        console.log(separator);
        console.log('\n\n');
      }

      showLoading('Salvando...');
      try {
        const response = await salvarTemplatePadrao({
          eventoId,
          data: payload,
        });

        if (__DEV__) {
          const separator = '==============================================================';
          console.log('\n\n');
          console.log(separator);
          console.log('[TemplatePadrao] SALVAR - RESPONSE');
          console.log('[TemplatePadrao] data:', JSON.stringify(response, null, 2));
          console.log(separator);
          console.log('\n\n');
        }

        const shouldRemoveOccurrenceOverride =
          escopo === TemplatePadraoEscopoEnum.SERIE &&
          response?.templatePadraoOrigem === TemplatePadraoOrigemEnum.OCORRENCIA;

        if (shouldRemoveOccurrenceOverride) {
          const deleteParams = {
            escopo: TemplatePadraoEscopoEnum.OCORRENCIA,
            dataOcorrencia: props.dataOcorrenciaIso,
          };

          if (__DEV__) {
            const separator = '==============================================================';
            console.log('\n\n');
            console.log(separator);
            console.log('[TemplatePadrao] REMOVER OVERRIDE DE OCORRENCIA - REQUEST');
            console.log(`[TemplatePadrao] eventoId: ${eventoId}`);
            console.log('[TemplatePadrao] params:', JSON.stringify(deleteParams, null, 2));
            console.log(separator);
            console.log('\n\n');
          }

          const deleteResponse = await removerTemplatePadrao({
            eventoId,
            params: deleteParams,
          });

          if (__DEV__) {
            const separator = '==============================================================';
            console.log('\n\n');
            console.log(separator);
            console.log('[TemplatePadrao] REMOVER OVERRIDE DE OCORRENCIA - RESPONSE');
            console.log('[TemplatePadrao] data:', JSON.stringify(deleteResponse, null, 2));
            console.log(separator);
            console.log('\n\n');
          }
        }

        Toast.show({
          type: 'success',
          text1: 'Template padrão atualizado com sucesso!',
          text2: (() => {
            if (escopo !== TemplatePadraoEscopoEnum.SERIE) {
              return 'Aplicado somente nesta data.';
            }
            if (shouldRemoveOccurrenceOverride) {
              return 'Aplicado desta data em diante e ajuste desta data removido.';
            }
            return 'Aplicado em todas as ocorrências a partir desta data.';
          })(),
        });
        await props.onTemplateSaved?.();
      } catch (error) {
        if (__DEV__) {
          const separator = '==============================================================';
          console.log('\n\n');
          console.log(separator);
          console.log('[TemplatePadrao] SALVAR - ERROR');
          console.log('[TemplatePadrao] message:', getApiErrorMessage(error, 'Erro ao salvar template padrão.'));
          console.log('[TemplatePadrao] raw:', error);
          console.log(separator);
          console.log('\n\n');
        }

        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar template padrão',
          text2: getApiErrorMessage(error, 'Não foi possível salvar o template padrão.'),
        });
      } finally {
        hideLoading();
      }
    },
    [hideLoading, props.dataOcorrenciaIso, props.evento.id, props.ocorrencia?.eventoId, props.onTemplateSaved, removerTemplatePadrao, salvarTemplatePadrao, showLoading, templateId],
  );

  const handleSaveTemplate = useCallback(() => {
    if (!canUpdateTemplate) {
      Toast.show({
        type: 'error',
        text1: 'Permissão insuficiente',
        text2: 'Somente líderes e administradores podem alterar o template padrão.',
      });
      return;
    }

    FancyAlert.alert(
      'Como deseja aplicar este template padrão?',
      'Você pode aplicar só nesta data ou para esta e as próximas ocorrências.',
      [
        { text: 'Cancelar', style: 'destructive' },
        { text: 'Apenas nesta data', onPress: () => void saveTemplateByScope(TemplatePadraoEscopoEnum.OCORRENCIA) },
        { text: 'Em todas a partir daqui', onPress: () => void saveTemplateByScope(TemplatePadraoEscopoEnum.SERIE) },
      ],
    );
  }, [canUpdateTemplate, saveTemplateByScope]);

  const origemTemplateLabel = useMemo(() => {
    const origem = props.ocorrencia?.templatePadraoOrigem ?? props.evento.templatePadraoOrigem;
    if (!origem) return null;
    return TemplatePadraoOrigemLabel[origem as keyof typeof TemplatePadraoOrigemLabel] || null;
  }, [props.evento.templatePadraoOrigem, props.ocorrencia?.templatePadraoOrigem]);

  if (isLoadingTemplates) return <FancyLoading />;

  return (
    <View style={styles.container}>
      <EventoInfoCard
        dataOcorrencia={props.dataOcorrenciaDate}
        eventoCor={props.evento.cor || Pallete.primary}
        eventoNome={props.evento.nome}
        descricao={props.evento.descricao}
        local={props.evento.local}
      />
      {canUpdateTemplate && (
        <FancyContainer
          containerStyle={{ paddingBottom: 16 }}
          title={'Parâmetros do Evento'}
          children={
            <>
              <View
                style={{
                  paddingHorizontal: 15,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-end',
                }}
              >
                <FancyBottomSheetSelect
                  label='Template padrão'
                  containerStyle={{ flex: 1 }}
                  listItems={templatesList}
                  value={templateId}
                  onChange={setTemplateId}
                />
                <FancyButton
                  icon={{ library: 'Ionicons', name: 'save', size: 18, style: { borderWidth: 0 } }}
                  containerStyle={{
                    maxWidth: 40,
                    minWidth: 40,
                    minHeight: 40,
                    maxHeight: 40,
                    width: 40,
                    height: 40,
                  }}
                  onPress={handleSaveTemplate}
                />
              </View>
              {origemTemplateLabel && (
                <View style={styles.detailsContainer}>
                  <FancyText size='small' type='semiBold' color={Pallete.fonts.inactive}>
                    {origemTemplateLabel}
                  </FancyText>
                </View>
              )}
            </>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  infoContainer: { gap: 10, paddingHorizontal: 15, paddingVertical: 16 },
  detailsContainer: { paddingHorizontal: 15, paddingTop: 8, gap: 4 },
});
