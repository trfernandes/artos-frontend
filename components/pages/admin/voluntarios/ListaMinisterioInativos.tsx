import { View } from 'react-native';
import { format } from 'date-fns';
import { Pallete } from '../../../../constants/colors';
import { HierarquiaEnumLabel, MinisterioVoluntarioModel } from '../../../../domain/models/MinisterioVoluntario';
import { additionalData1TextProps } from '../../../cards/Horizontal/FancyBaseCard';
import { FancyCardImageBaseProps, FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyText from '../../../FancyText';
import FancyList from '../../../list/FancyList';

export default function ListaMinisterioInativos(props: {
  ministeriosInativos: MinisterioVoluntarioModel[];
  onActivateButtonPress?: (ministerioVoluntario: MinisterioVoluntarioModel) => void;
}) {
  return (
    <FancyList
      data={props.ministeriosInativos}
      containerStyle={{ borderWidth: 0 }}
      contentContainerStyle={{ gap: 10 }}
      renderItem={({ item, index }) => {
        const ultimoPeriodo =
          item?.historico?.[0]?.dataInicio &&
          item?.historico?.[0]?.dataTermino &&
          `${format(item?.historico?.[0]?.dataInicio, 'dd/MM/yyyy')} até ${format(
            item?.historico?.[0]?.dataTermino,
            'dd/MM/yyyy'
          )}`;

        const cardProps: FancyCardImageBaseProps = {
          title: item?.ministerio?.nome,
          subtitle: ultimoPeriodo && (
            <View style={{ flexDirection: 'row', flexShrink: 1, alignItems: 'flex-start', gap: 5 }}>
              <FancyText {...additionalData1TextProps}>Último período:</FancyText>
              <FancyText {...additionalData1TextProps} numberOfLines={2} style={{ flexShrink: 1 }} type="bold">
                {ultimoPeriodo}
              </FancyText>
            </View>
          ),
          additionalData1: item.historico && item.historico.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <FancyText {...additionalData1TextProps}>Última função exercida:</FancyText>
              <FancyText {...additionalData1TextProps} type="bold">
                {HierarquiaEnumLabel[item?.historico?.[0]?.hierarquia!]}
              </FancyText>
            </View>
          ),
          isCollapsable: true,
          actionButtons: [
            {
              icon: {
                library: 'MaterialCommunityIcons',
                name: 'check-bold',
                size: 16,
                backgroundColor: Pallete.primary,
              },
              onPress: () => {
                props.onActivateButtonPress?.(item);
              },
            },
          ],
        };

        if (item.ministerio?.logo) {
          return <FancyCard.Image key={index} type="image" props={{ ...cardProps, source: item.ministerio?.logo || '' }} />;
        } else {
          return <FancyCard.Image type="letter" props={{ ...cardProps, letter: item.ministerio?.nome.charAt(0) || '?' }} />;
        }
      }}
    />
  );
}
