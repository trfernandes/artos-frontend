import FancyList from '../../../list/FancyList';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { StyleSheet, View } from 'react-native';
import FancyFab from '../../../buttons/FancyFab';
import { DefaultIconsNames } from '../../../../constants/icons';
import { Pallete } from '../../../../constants/colors';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';

export default function VoluntariosMinisterios() {
  const data: { nome: string; dataInicial: string; dataFinal?: string; status: 'ativo' | 'inativo' }[] = [
    { nome: 'Ministério de Louvor', dataInicial: '01/01/2023', status: 'ativo' },
    { nome: 'Hospitalidade', dataInicial: '01/01/2022', dataFinal: '30/06/2023', status: 'inativo' },
  ];
  return (
    <View style={styles.container}>
      <FancyList
        containerStyle={{ flex: 1 }}
        data={data}
        renderItem={({ item }) => (
          <FancyCard.Simple
            title={item.nome}
            subtitle={`${item.dataInicial}${item.dataFinal ? ` - ${item.dataFinal}` : ''}`}
            additionalData1={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 0 }}>
                <DefaultIcons.Custom
                  library={'Octicons'}
                  name={'dot-fill'}
                  color={item.status === 'ativo' ? 'forestgreen' : 'indianred'}
                  style={{ borderWidth: 0, height: 20, justifyContent: 'flex-start', marginTop: -4 }}
                />
                <FancyText size={'extraSmall'} type="semiBold" color={Pallete.fonts.inactive}>
                  {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </FancyText>
              </View>
            }
            actionButtons={[
              { icon: { ...DefaultIconsNames.edit, size: 18 } },
              { icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error } },
            ]}
          />
        )}
      />
      <FancyFab right={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
