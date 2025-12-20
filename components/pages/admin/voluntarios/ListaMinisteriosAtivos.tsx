import { format } from 'date-fns';
import { Pallete } from '../../../../constants/colors';
import { DefaultIconsNames } from '../../../../constants/icons';
import { HierarquiaEnumLabel, MinisterioVoluntario } from '../../../../domain/models/MinisterioVoluntario';
import { FancyCardImageBaseProps, FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyList from '../../../list/FancyList';
import { View } from 'react-native';
import { additionalData1TextProps } from '../../../cards/Horizontal/FancyBaseCard';
import FancyText from '../../../FancyText';

export default function ListaMinisteriosAtivos({
  mode = 'edit',
  ...props
}: {
  ministerios: MinisterioVoluntario[];
  onEditButtonPress: (ministerioVoluntario: MinisterioVoluntario) => void;
  onDisableButtonPress: (ministerioVoluntario: MinisterioVoluntario) => void;
  mode?: 'view' | 'edit';
}) {
  return (
    <FancyList
      data={props.ministerios}
      contentContainerStyle={{ gap: 10 }}
      renderItem={({ item, index }) => {
        const cardProps: FancyCardImageBaseProps = {
          title: item.ministerio?.nome,
          subtitle: (
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <FancyText {...additionalData1TextProps}>Data Início:</FancyText>
              <FancyText {...additionalData1TextProps} type="bold">
                {format(item.dataInicio, 'dd/MM/yyyy')}
              </FancyText>
            </View>
          ),
          additionalData1: (
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <FancyText {...additionalData1TextProps}>Função:</FancyText>
              <FancyText {...additionalData1TextProps} type="bold">
                {HierarquiaEnumLabel[item.hierarquia]}
              </FancyText>
            </View>
          ),
          isCollapsable: true,
          actionButtons:
            mode === 'edit'
              ? [
                  {
                    icon: {
                      library: DefaultIconsNames.edit.library,
                      name: DefaultIconsNames.edit.name,
                      size: 16,
                      backgroundColor: Pallete.primary,
                    },
                    onPress: () => {
                      props.onEditButtonPress?.(item);
                    },
                  },
                  {
                    icon: {
                      library: 'MaterialCommunityIcons',
                      name: 'close-thick',
                      size: 16,
                      backgroundColor: Pallete.error,
                    },
                    onPress: () => {
                      props.onDisableButtonPress?.(item);
                    },
                  },
                ]
              : undefined,
        };

        if (item.ministerio?.logo) {
          return (
            <FancyCard.Image key={index} type="image" props={{ ...cardProps, source: item.ministerio?.logo || '' }} />
          );
        } else {
          return (
            <FancyCard.Image type="letter" props={{ ...cardProps, letter: item.ministerio?.nome.charAt(0) || '?' }} />
          );
        }
      }}
    />
  );
}
