import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import FancySection from '../../../../FancySection';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import FancyButton from '../../../../buttons/FancyButton';
import { IconLibrary } from '../../../../FancyIcons';
import PagerView from 'react-native-pager-view';
import { Pallete } from '../../../../../constants/colors';
import { format } from 'date-fns';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';

export default function SubstituicoesRequestsFrame({
  data,
  onRespond,
}: {
  data: ResponseEscalaSubstituicaoDto[];
  onRespond?: (substituicao: ResponseEscalaSubstituicaoDto, response: 'accept' | 'reject') => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <View
      style={{
        elevation: 3,
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 14,
        paddingBottom: 6,
        paddingTop: 8,
      }}
    >
      <PagerView
        style={{ height: 155 }} // altura do bloco
        initialPage={0}
        onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
      >
        {data.map((item, index) => (
          <View key={index} style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ borderWidth: 0, gap: 10 }}>
              <FancySection
                containerStyle={{ borderWidth: 0 }}
                title='Solicitações de Substituição'
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'format-list-checks',
                  size: 20,
                  color: Pallete.primary,
                }}
              >
                <View style={{ borderWidth: 0, flexDirection: 'column', gap: 10, justifyContent: 'space-between' }}>
                  <View style={{ gap: 3 }}>
                    <FancyTextDisplay
                      titleStyle={{ size: 'extraSmall' }}
                      valueStyle={{ size: 'extraSmall' }}
                      title='Solicitante:'
                      value={item.solicitante?.voluntario?.nome}
                    />
                    <FancyTextDisplay
                      title='Evento:'
                      value={`${item.escalaItem?.evento?.nome} - ${
                        item.escalaItem?.dataOcorrencia && format(item.escalaItem?.dataOcorrencia, 'dd/MM/yyyy HH:mm')
                      }`}
                      titleStyle={{ size: 'extraSmall' }}
                      valueStyle={{ size: 'extraSmall' }}
                    />
                    <FancyTextDisplay
                      title='Data/Hora da solicitação:'
                      value={item.escalaItem?.dataOcorrencia && format(item.escalaItem?.dataOcorrencia, 'dd/MM/yyyy HH:mm')}
                      titleStyle={{ size: 'extraSmall' }}
                      valueStyle={{ size: 'extraSmall' }}
                    />
                    <FancyTextDisplay
                      title='Função:'
                      value={item.escalaItem?.funcao?.nome}
                      titleStyle={{ size: 'extraSmall' }}
                      valueStyle={{ size: 'extraSmall' }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <FancyButton
                      mode='default'
                      size={30}
                      label='Aceitar'
                      icon={{
                        library: 'MaterialCommunityIcons' as IconLibrary,
                        name: 'check-bold',
                        size: 16,
                      }}
                      onPress={() => onRespond?.(item, 'accept')}
                    />
                    <FancyButton
                      mode='default'
                      label={'Rejeitar'}
                      size={30}
                      icon={{
                        library: 'MaterialCommunityIcons' as IconLibrary,
                        name: 'close-thick',
                        size: 16,
                      }}
                      containerStyle={{ backgroundColor: Pallete.error }}
                      onPress={() => onRespond?.(item, 'reject')}
                    />
                  </View>
                </View>
              </FancySection>
              <View style={styles.pageIndicatorContainer}>
                {Array.from({ length: data.length }).map((_, index) => (
                  <View key={index} style={[styles.pageIndicatorDot, index === pageIndex && styles.pageInidicatorDotActive]} />
                ))}
              </View>
            </View>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageIndicatorContainer: { flexDirection: 'row', gap: 4, alignSelf: 'center' },
  pageIndicatorDot: {
    width: 5,
    height: 5,
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#C7C7CC',
  },
  pageInidicatorDotActive: { backgroundColor: '#8E8E93' },
});
