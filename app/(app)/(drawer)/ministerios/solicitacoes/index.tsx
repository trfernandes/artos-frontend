import { Pressable, StyleSheet, View } from 'react-native';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { usePallete } from '../../../../../hooks/usePallete';
import { DefaultIconsNames } from '../../../../../constants/icons';
import DefaultIcons from '../../../../../components/FancyIcons';
import FancyText from '../../../../../components/FancyText';
import { ColorUtils } from '../../../../../utils/color_utils';
import { useState } from 'react';
import Visualizar from '../../../../../components/pages/ministerios/solicitacoes/Visualizar';

const DATA: {
  solicitante: string;
  substituo: string;
  evento: { nome: string; dataInicio: Date; dataFim: Date };
  funcao: string;
}[] = [
  {
    solicitante: 'Thiago Fernandes',
    substituo: 'Leonardo Carpes',
    evento: { nome: 'Culto de Jovens RUAH', dataInicio: new Date(), dataFim: new Date() },
    funcao: 'Tecladista',
  },
  {
    solicitante: 'Juliana Fernandes',
    substituo: 'Miriam Moschen',
    evento: { nome: 'Culto de Domingo', dataInicio: new Date(), dataFim: new Date() },
    funcao: 'Ministro(a)',
  },
];

export default function MinisterioSolicitacoesIndex() {
  const Pallete = usePallete();
  const [visualizarModal, setVisualizarModal] = useState(false);
  return (
    <FancyListPage
      showFab={false}
      listProps={{
        listEmptyProps: {
          label: 'Nenhuma solicitação pendente',
          icon: {
            library: 'MaterialCommunityIcons',
            name: 'swap-horizontal-circle-outline',
            size: 68,
          },
        },
        data: DATA,
        renderItem: ({ item }) => (
          <FancyListItemCard
            onPress={() => setVisualizarModal(true)}
            leading={{
              type: 'icon',
              icon: { ...DefaultIconsNames.refresh, size: 18 },
              color: Pallete.primary,
              backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.12),
            }}
            title={
              <View style={styles.fromToBlock}>
                <View style={styles.fromToRow}>
                  <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
                    De:
                  </FancyText>
                  <FancyText size='small' type='semiBold' numberOfLines={1}>
                    {item.solicitante}
                  </FancyText>
                </View>
                <View style={styles.fromToRow}>
                  <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
                    Para:
                  </FancyText>
                  <FancyText size='small' type='semiBold' numberOfLines={1}>
                    {item.substituo}
                  </FancyText>
                </View>
              </View>
            }
            meta={
              <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                {`${item.evento.nome}  ·  ${item.funcao}`}
              </FancyText>
            }
            trailing={
              <View style={styles.actionsRow}>
                <Pressable
                  hitSlop={6}
                  onPress={() => setVisualizarModal(true)}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: ColorUtils.withAlpha(Pallete.confirm, 0.14) },
                  ]}
                  accessibilityRole='button'
                  accessibilityLabel='Aprovar'
                >
                  <DefaultIcons.Custom
                    {...DefaultIconsNames.confirm}
                    size={16}
                    color={Pallete.confirm}
                  />
                </Pressable>
                <Pressable
                  hitSlop={6}
                  onPress={() => {}}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: ColorUtils.withAlpha(Pallete.error, 0.14) },
                  ]}
                  accessibilityRole='button'
                  accessibilityLabel='Recusar'
                >
                  <DefaultIcons.Custom
                    {...DefaultIconsNames.delete}
                    size={16}
                    color={Pallete.error}
                  />
                </Pressable>
              </View>
            }
          />
        ),
      }}
    >
      {visualizarModal && (
        <Visualizar
          modalProps={{ visible: visualizarModal }}
          onButton1Press={() => setVisualizarModal(false)}
          onButton2Press={() => setVisualizarModal(false)}
        />
      )}
    </FancyListPage>
  );
}

const styles = StyleSheet.create({
  fromToBlock: { gap: 3 },
  fromToRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  actionsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
