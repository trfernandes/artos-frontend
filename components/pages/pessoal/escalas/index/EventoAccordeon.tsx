import { View } from 'react-native';
import { useMemo } from 'react';
import { format } from 'date-fns';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import { EscalaDoDiaAgrupada } from '../../../../../app/(app)/(drawer)/pessoal/escalas';
import { Pallete } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import FuncoesTable from './FuncoesTable';
import FancyButton from '../../../../buttons/FancyButton';
import { BOLD_FONT } from '../../../../../constants/font';
import { router } from 'expo-router';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';

export default function EventoAccordeon({
  data,
  onConfirmButtonPress,
  onSubButtonPress,
}: {
  data: EscalaDoDiaAgrupada;
  onConfirmButtonPress: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress: (dadosEscala: ResponseEscalaItemDto) => void;
}) {
  const { borderColor, expandableIconColor, lightenColor, textColor, headerBackgroundColor } = useMemo(() => {
    const border = ColorUtils.darkenColor(data.evento?.cor || Pallete.primary, 0);
    return {
      borderColor: border,
      expandableIconColor: ColorUtils.darkenColor(data.evento?.cor || Pallete.primary, 0.4),
      lightenColor: ColorUtils.lightenColor(data.evento?.cor || Pallete.primary, 0.96),
      textColor: ColorUtils.getTextColorForBackground(border),
      headerBackgroundColor: ColorUtils.lightenColor(data.evento?.cor || Pallete.primary, 0.2),
    };
  }, [data.evento?.cor]);

  return (
    <FancyAccordeon
      subtitle={
        <FancyButton
          label='Ver detalhes'
          type='text'
          labelStyle={{
            color: Pallete.fonts.link,
            fontFamily: BOLD_FONT,
            textDecorationLine: 'underline',
          }}
          containerStyle={{ borderWidth: 0, gap: 7 }}
          icon={{
            library: 'Octicons',
            name: 'info',
            size: 14,
            style: { lineHeight: 17 },
            color: Pallete.fonts.link,
          }}
          onPress={() => {
            router.push({
              pathname: '/pessoal/escalas/evento',
              params: {
                evento: JSON.stringify(data.evento),
                dataOcorrencia: data.dataOcorrencia.toISOString(),
              },
            });
          }}
        />
      }
      title={
        <View
          style={{
            paddingVertical: 10,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            flex: 1,
          }}
        >
          <View style={{ gap: 3 }}>
            <FancyText type='bold' size='small'>
              {data.evento?.nome}
            </FancyText>
            <FancyText type='medium' size='extraSmall' style={{}}>{`${`${format(data.evento?.dataInicio!, 'HH:mm')} à ${format(
              data.evento?.dataTermino!,
              'HH:mm',
            )}`}`}</FancyText>
          </View>
        </View>
      }
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: 15,
        borderWidth: 0,
        backgroundColor: 'white',
      }}
      headerContainerStyle={{ backgroundColor: lightenColor }}
      headerExpandedContainerStyle={{
        borderBottomWidth: 1.35,
        borderColor: borderColor,
        backgroundColor: lightenColor,
      }}
      containerContainerStyle={{
        borderColor: borderColor,
        borderRadius: 12,
        borderWidth: 1.35,
        backgroundColor: lightenColor,
      }}
      containerExpandedContainerStyle={{
        borderColor: borderColor,
        borderRadius: 12,
        borderWidth: 1.35,
        backgroundColor: 'white',
        paddingBottom: 15,
        marginBottom: 10,
      }}
      iconProps={{ color: expandableIconColor }}
    >
      <FuncoesTable data={data.itens} onConfirmButtonPress={onConfirmButtonPress} onSubButtonPress={onSubButtonPress} />
    </FancyAccordeon>
  );
}
