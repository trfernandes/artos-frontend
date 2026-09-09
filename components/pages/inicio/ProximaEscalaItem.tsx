import { View } from 'react-native';
import DefaultIcons from '../../FancyIcons';
import FancyText from '../../FancyText';
import FancyButton from '../../buttons/FancyButton';
import DateUtils from '../../../utils/date_utils';
import { EXTRA_SMALL_SIZE_FONT } from '../../../constants/font';

export default function ProximaEscalaItem({
  data,
  nomeEvento,
  nomeFuncao,
}: {
  data: Date;
  nomeEvento: string;
  nomeFuncao: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        paddingLeft: 10,
        alignItems: 'center',
        width: '100%',
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='arrow-right'
            style={{ borderWidth: 0, marginLeft: -14 }}
          />
          <FancyText size={'extraSmall'} type='bold'>
            {DateUtils.formatStableDateBR(data)}
          </FancyText>
        </View>
        <View style={{ flexDirection: 'row', gap: 0, paddingLeft: 5 }}>
          <FancyText
            size={'extraSmall'}
            type='medium'
            style={{ textAlign: 'left' }}
            numberOfLines={2}
          >
            {nomeEvento} - {nomeFuncao}
          </FancyText>
        </View>
      </View>
      <FancyButton
        type='outlined'
        label='Abrir'
        containerStyle={{ width: 56, height: 28, borderWidth: 1 }}
        labelStyle={{ fontSize: EXTRA_SMALL_SIZE_FONT }}
      />
    </View>
  );
}
