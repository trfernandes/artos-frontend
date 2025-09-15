import { StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyScrollView from '../../../../../components/FancyScrollView';
import FancyTextInput from '../../../../../components/fields/FancyTextInput';
import FancyDropDown from '../../../../../components/fields/FancyDropDown';
import FancyContainerList from '../../../../../components/container_list/FancyContainerList';
import { PEOPLE_DATA } from '../../../../../components/pages/admin/eventos/EventosEscalaEquipe';
import { DropDownItemProps } from '../../../../../components/fields/FancyDropDownItem';
import FancyFab from '../../../../../components/buttons/FancyFab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';
import FancyContainerVerticalList from '../../../../../components/container_list/FancyContainerVerticalList';
import FormFixoModal from '../../../../../components/pages/ministerios/templates_equipe/FormFixoModal';
import FormFuncoesModal from '../../../../../components/pages/ministerios/templates_equipe/FormFuncoesModal';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';

export const FUNCOES_DATA: { nome: string }[] = [
  { nome: 'Guitarrista' },
  { nome: 'Tecladista' },
  { nome: 'Baterista' },
  { nome: 'Ministro(a)' },
  { nome: 'Violonista' },
  { nome: 'Baixista' },
  { nome: 'Backing-Vocal' },
];

export default function MinisterioTemplatesEquipeForm() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: 'Novo Template de Equipe',
      });
    }, [])
  );

  const [tipo, setTipo] = useState<'Fixo' | 'Funções'>('Fixo');
  const [formFixoParams, setFormFixoParams] = useState<{ visible?: boolean; mode?: 'add' | 'edit' }>({
    visible: false,
    mode: 'add',
  });
  const [formFuncoesParams, setFormFuncoesParams] = useState<{ visible?: boolean; mode?: 'add' | 'edit' }>({
    visible: false,
    mode: 'add',
  });

  return (
    <FancyPageView style={styles.container}>
      <FancyScrollView style={{}} contentContainerStyle={{ flex: 1, paddingHorizontal: 20, gap: 15 }}>
        <FancyTextInput label="Nome" />
        <FancyDropDown
          label="Tipo"
          listItems={[
            { title: 'Fixo', value: 'Fixo' },
            { title: 'Funções', value: 'Funções' },
          ]}
          value={tipo}
          onChange={text => {
            if (text === 'Fixo') setTipo('Fixo');
            else setTipo('Funções');
          }}
        />
        <FancyDropDown
          label="Responsável pelo Setlist"
          listItems={PEOPLE_DATA.map(item => ({ foto: item.image, nome: item.nome })).map((value, index) => {
            return { title: value.nome, value: index.toString(), left: { type: 'image', url: value.foto } } as DropDownItemProps;
          })}
        />
        {tipo === 'Funções' && (
          <FancyContainerList
            title={'Formação da Equipe'}
            data={[
              { quantidade: 1, nome: 'Guitarrista', experiencia: 'Mínimo: Alta' },
              { quantidade: 2, nome: 'Tecladista', experiencia: 'Mínimo: Média' },
              { quantidade: 1, nome: 'Baterista', experiencia: 'Mínimo: Baixa' },
              { quantidade: 1, nome: 'Ministro(a)', experiencia: 'Mínimo: Alta' },
              { quantidade: 1, nome: 'Violonista', experiencia: 'Mínimo: Média' },
              { quantidade: 1, nome: 'Baixista', experiencia: 'Mínimo: Baixa' },
              { quantidade: 3, nome: 'Backing-Vocal', experiencia: 'Mínimo: Alta' },
            ]}
            renderItem={({ item }) => (
              <FancyCard.Letter
                letter={item.quantidade.toString()}
                title={item.nome}
                subtitle={item.experiencia}
                actionButtons={[
                  {
                    icon: { ...DefaultIconsNames.edit, size: 18 },
                    onPress: () => {
                      setFormFuncoesParams({ visible: true, mode: 'edit' });
                    },
                  },
                  {
                    icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error },
                  },
                ]}
              />
            )}
            containerStyle={{ flex: 1 }}
            buttons={[
              {
                icon: { ...DefaultIconsNames.add, size: 20 },
                onPress: () => {
                  setFormFuncoesParams({ visible: true, mode: 'add' });
                },
              },
            ]}
          />
        )}
        {tipo === 'Fixo' && (
          <FancyContainerVerticalList
            title={'Equipe'}
            listProps={{
              data: [
                {
                  title: 'Thiago Rodrigo Fernandes',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
                },
                {
                  title: 'Juliana Karen Da silva Fernandes',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
                },
                {
                  title: 'Miriam Moschen',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg' },
                },
                {
                  title: 'Deividi Moschen',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
                },
                {
                  title: 'Ladislau Gomes',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
                },
                {
                  title: 'Wesliane Prata Gomes',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/women/6.jpg' },
                },
                {
                  title: 'Paulo Henrique',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/7.jpg' },
                },
                {
                  title: 'Dionatas Lovison',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/8.jpg' },
                },
                {
                  title: 'Davi Hostfeller',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/9.jpg' },
                },
                {
                  title: 'William',
                  topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/10.jpg' },
                },
              ],
              itemProps: {
                additionalData: (
                  <View
                    style={{
                      borderWidth: 0,
                      flex: 1,
                      width: '100%',
                      gap: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FancyButton
                      size={26}
                      mode="icon"
                      icon={{ ...DefaultIconsNames.edit, size: 16 }}
                      onPress={() => {
                        setFormFixoParams({ mode: 'edit', visible: true });
                      }}
                    />
                    <FancyButton
                      size={26}
                      mode="icon"
                      icon={{ ...DefaultIconsNames.delete, size: 16 }}
                      containerStyle={{ backgroundColor: Pallete.error }}
                    />
                  </View>
                ),
              },
              itemHeight: 180,
            }}
            containerStyle={{ flex: 1 }}
            contentContainerStyle={{ flex: 1, paddingTop: 10 }}
            buttons={[
              {
                icon: { ...DefaultIconsNames.add, size: 20 },
                onPress: () => {
                  setFormFixoParams({ mode: 'add', visible: true });
                },
              },
            ]}
          />
        )}
      </FancyScrollView>
      <FancyFab icon={{ ...DefaultIconsNames.save, size: 26 }} backgroundColor={Pallete.primary} />
      {formFixoParams.visible && (
        <FormFixoModal
          title={formFixoParams.mode == 'add' ? 'Adicionar Integrante' : 'Editar Integrante'}
          modalProps={{ visible: formFixoParams.visible }}
          onClose={() => setFormFixoParams(prev => ({ ...prev, visible: false }))}
          onConfirm={() => setFormFixoParams(prev => ({ ...prev, visible: false }))}
        />
      )}
      {formFuncoesParams.visible && (
        <FormFuncoesModal
          title={formFuncoesParams.mode == 'add' ? 'Adicionar Função' : 'Editar Função'}
          mode={formFuncoesParams.mode || 'add'}
          modalProps={{ visible: formFuncoesParams.visible }}
          onClose={() => setFormFuncoesParams(prev => ({ visible: false }))}
          onConfirm={() => setFormFuncoesParams(prev => ({ visible: false }))}
        />
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10 },
});
