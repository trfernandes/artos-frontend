import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import FancyText from '../../../FancyText';
import { View } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import FancyButton from '../../../buttons/FancyButton';
import { DefaultIconsNames } from '../../../../constants/icons';

export default function Visualizar(props: Omit<FancyModalDialogProps<any>, 'title'>) {
  return (
    <FancyModalDialog
      containerStyle={{}}
      centerContainerStyle={{ paddingBottom: 20, paddingTop: 15, gap: 20 }}
      title='Analisar Solicitação'
      button1={{ label: 'Não' }}
      button2={{ label: 'Sim' }}
      {...props}
    >
      <View
        style={{
          gap: 12,
          borderWidth: 1,
          borderColor: Pallete.backgroundColor2,
          backgroundColor: Pallete.backgroundColor2,
          borderRadius: 10,
          padding: 15,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <FancyText size={'small'} type='medium'>
            De:
          </FancyText>
          <FancyText size={'small'} type='semiBold'>
            Thiago Fernandes
          </FancyText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <FancyText size={'small'} type='medium'>
            Para:
          </FancyText>
          <FancyText size={'small'} type='semiBold'>
            Leonardo Carpes
          </FancyText>
        </View>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <FancyButton
            icon={{ ...DefaultIconsNames.open, size: 18, color: Pallete.icons.dark }}
            size={35}
            containerStyle={{ backgroundColor: Pallete.backgroundColor, position: 'absolute', top: 10, right: 0 }}
          />
          <FancyText size={'small'} type='medium'>
            Evento:
          </FancyText>
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <FancyText size={'small'} type='semiBold'>
              Culto de Jovens RUAH
            </FancyText>
            <FancyText size={'small'} type='semiBold'>
              09/08/2025 - 09/08/2025
            </FancyText>
            <FancyText size={'small'} type='semiBold'>
              19:30 - 22:00
            </FancyText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <FancyText size={'small'} type='medium'>
            Função:
          </FancyText>
          <FancyText size={'small'} type='semiBold'>
            Tecladista
          </FancyText>
        </View>
      </View>

      <View style={{ gap: 5, flexDirection: 'row' }}>
        <FancyText type='medium' size={'medium'}>
          Deseja
        </FancyText>
        <FancyText type='bold' size={'medium'}>
          APROVAR
        </FancyText>
        <FancyText type='medium' size={'medium'}>
          a solicitação?
        </FancyText>
      </View>
    </FancyModalDialog>
  );
}
