import { useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { EscalaFormData } from '../../../../../domain/schemas/escalaSchema';
import { BOLD_FONT, MEDIUM_FONT, SMALL_SIZE_FONT } from '../../../../../constants/font';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import FancySection from '../../../../FancySection';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import { format } from 'date-fns';
import FancySeparator from '../../../../FancySeparator';
import { EscalaTemplateTipoEnum, EscalaTemplateTipoLabel } from '../../../../../domain/models/EscalaTemplate';
import FancyText from '../../../../FancyText';
import FancyImage from '../../../../images/FancyImage';
import FancyScrollView from '../../../../FancyScrollView';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import { useMemo } from 'react';

export default function AssistenteRevisaoStep() {
  const { ministerioId } = useAssistenteEscala();
  const form = useFormContext<EscalaFormData>();

  const { funcoesList } = useFuncoesDoMinisterio(ministerioId);
  const { ministerioVoluntariosList } = useVoluntariosDoMinisterioCrud(ministerioId);

  const eventosSectionComponents = useMemo(
    () =>
      form
        .getValues('eventos')
        ?.filter(evento => evento.selected)
        .map((evento, index) => {
          const tipoTemplate =
            evento.template.tipo === EscalaTemplateTipoEnum.Fixo
              ? `${evento.template.fixos?.length} voluntários`
              : `${evento.template.funcoes?.length} funções`;
          const template = `${EscalaTemplateTipoLabel[evento.template.tipo]} - ${tipoTemplate}`;

          return (
            <View style={{ justifyContent: 'center', gap: 2, paddingBottom: 12 }} key={index}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    backgroundColor: evento.cor,
                    width: 10,
                    height: 10,
                    borderRadius: 9999,
                  }}
                />
                <FancyText size={'small'} type={'boldItalic'}>
                  {evento.nome}
                </FancyText>
              </View>
              <View style={{ paddingLeft: 18, gap: 1 }}>
                <FancyTextDisplay
                  title="Data:"
                  value={format(new Date(evento.data), 'dd/MM/yyyy')}
                  titleStyle={{ type: 'bold', size: 'extraSmall' }}
                  valueStyle={{ size: 'extraSmall' }}
                />
                <FancyTextDisplay
                  title="Template:"
                  value={template}
                  titleStyle={{ type: 'bold', size: 'extraSmall' }}
                  valueStyle={{ size: 'extraSmall' }}
                />
              </View>
            </View>
          );
        }),
    [form]
  );
  const participanteSectionComponents = useMemo(
    () =>
      form
        .getValues('participantes')
        ?.filter(participante => participante.selected)
        .map((participante, index) => {
          const { voluntario } = ministerioVoluntariosList.find(v => v.id === participante.minVolId)!;

          return (
            <View style={{ alignItems: 'center', gap: 8, borderWidth: 0, width: 50 }} key={index}>
              <FancyImage
                source={
                  voluntario?.foto
                    ? { uri: voluntario?.foto }
                    : require('../../../../../assets/images/empty_profile_image.png')
                }
                size={40}
              />
              <FancyText
                size={'extraSmall'}
                type="semiBold"
                style={{ textAlign: 'center', fontSize: 9, lineHeight: 10 }}
              >
                {voluntario?.nome}
              </FancyText>
            </View>
          );
        }),
    [form]
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionParametros}>
        <FancySection
          title="Parâmetros"
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'card-text-outline',
            size: 20,
            color: '#8E7AEF',
          }}
        >
          <FancyTextDisplay title={'Nome:'} value={form.getValues('nome')} />
          <FancyTextDisplay
            title={'Data Início:'}
            value={format(form.getValues('dataInicio'), 'dd/MM/yyyy')}
          />
          <FancyTextDisplay
            title={'Data Término:'}
            value={format(form.getValues('dataTermino'), 'dd/MM/yyyy')}
          />
        </FancySection>
      </View>

      <FancySeparator />

      <View style={styles.sectionEventos}>
        <FancyScrollView
          contentContainerStyle={{
            flexDirection: 'column',
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}
        >
          <FancySection
            title={`Eventos (${eventosSectionComponents?.length || 0})`}
            icon={{
              library: 'MaterialCommunityIcons',
              name: 'calendar-month',
              size: 20,
              color: '#5AC8B0',
              style: { opacity: 0.6 },
            }}
          >
            {eventosSectionComponents}
          </FancySection>
        </FancyScrollView>
      </View>

      <FancySeparator />

      <View style={styles.sectionParticipantes}>
        <FancyScrollView
          style={{ flex: 1, borderWidth: 0 }}
          contentContainerStyle={{
            flexDirection: 'column',
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}
        >
          <FancySection
            title={`Participantes (${participanteSectionComponents?.length || 0})`}
            icon={{
              library: 'MaterialIcons',
              name: 'groups',
              size: 20,
              color: '#4A90E2',
              style: { opacity: 0.6 },
            }}
          >
            <View style={{ gap: 12, flexDirection: 'row', flexWrap: 'wrap', rowGap: 15, columnGap: 10 }}>
              {participanteSectionComponents}
            </View>
          </FancySection>
        </FancyScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 🔥 ESSENCIAL: ocupa a tela toda
    // paddingHorizontal: 20,
    gap: 15,
    minHeight: 0,
    // borderWidth: 1,
  },

  sectionParametros: {
    paddingHorizontal: 20,
    borderWidth: 0,
    flexShrink: 0, // não encolhe
  },

  sectionEventos: {
    minHeight: 0, // 🔥 permite encolher quando não há espaço
    flexShrink: 1,
    overflow: 'hidden',
    // borderWidth: 1,
    flex: 1,
  },

  eventosScroll: {
    overflow: 'hidden',
  },

  eventosContent: {
    paddingHorizontal: 20,
  },

  sectionParticipantes: {
    flexShrink: 1,
    // maxHeight: '40%',
    flex: 1,
    // paddingBottom: 20,
    overflow: 'hidden',
    // borderWidth: 1,
  },

  accordeon: { paddingHorizontal: 20, paddingVertical: 10, gap: 5 },
  dataContainer: { flexDirection: 'row', gap: 4 },
  keyText: { fontSize: SMALL_SIZE_FONT, fontFamily: BOLD_FONT, lineHeight: 20 },
  valueText: { fontSize: SMALL_SIZE_FONT, fontFamily: MEDIUM_FONT, lineHeight: 20 },
});
