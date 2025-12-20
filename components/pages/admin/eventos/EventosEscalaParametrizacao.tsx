import { Alert, StyleSheet, View } from 'react-native';
import FancyContainerList from '../../../container_list/FancyContainerList';
import FancyDropDown from '../../../fields/FancyDropDown';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { useState } from 'react';
import { Pallete } from '../../../../constants/colors';
import { DefaultIconsNames } from '../../../../constants/icons';
import FancyFullModal from '../../../modal/FancyFullModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyTextInput from '../../../fields/FancyTextInput';

export default function EventosEscalaParametrizacao(props: Omit<FancyModalDialogProps, 'title'>) {
  const [data, setData] = useState<Array<{ order: Number; funcao: string; experiencia: string; quantidade: number }>>([
    { order: 1, funcao: 'Guitarrista', experiencia: '1', quantidade: 1 },
    { order: 2, funcao: 'Tecladista', experiencia: '3', quantidade: 2 },
    { order: 3, funcao: 'Violonista', experiencia: '2', quantidade: 1 },
    { order: 4, funcao: 'Baterista', experiencia: '2', quantidade: 3 },
    { order: 5, funcao: 'Ministro(a)', experiencia: '3', quantidade: 1 },
  ]);
  const templateList: { id: string; nome: String; tipo: 'Funcoes' | 'Fixo' }[] = [
    { id: '1', nome: 'Equipe Completa', tipo: 'Funcoes' },
    { id: '2', nome: 'Equipe Fixa', tipo: 'Fixo' },
  ];
  const funcoesList: { id: string; nome: string }[] = [
    { id: '1', nome: 'Guitarrista' },
    { id: '2', nome: 'Tecladista' },
    { id: '3', nome: 'Violonista' },
    { id: '4', nome: 'Baterista' },
    { id: '5', nome: 'Ministro(a)' },
  ];
  const [modalEditFuncaoParams, setModalEditFuncaoParams] = useState<{
    visible: boolean;
    mode: 'add' | 'edit';
    funcao: string;
    quantidade: number;
    experiencia: string;
  }>({ visible: false, mode: 'add', funcao: '1', quantidade: 0, experiencia: '' });
  const [selectedTemplate, setSelectedTemplate] = useState('1');

  return (
    <FancyFullModal {...props}>
      <View style={styles.contentContainer}>
        <FancyDropDown
          label="Template"
          value={selectedTemplate}
          listItems={[
            { title: 'Equipe Completa', value: '1' },
            { title: 'Equipe Fixa', value: '2' },
          ]}
          onChange={setSelectedTemplate}
        />
        <View style={{ flex: 1 }}>
          {templateList.find(item => item.id === selectedTemplate)?.tipo === 'Funcoes' && (
            <FancyContainerList
              title={'Formação da Equipe'}
              data={data}
              contentContainerStyle={{ paddingHorizontal: 5 }}
              containerStyle={{ flex: 1 }}
              renderItem={({ item }) => (
                <FancyCard.Letter
                  title={item.funcao}
                  subtitle={item.experiencia === '1' ? 'Baixa' : item.experiencia === '2' ? 'Media' : 'Alta'}
                  letter={item.quantidade.toString()}
                  actionButtons={[
                    {
                      icon: { ...DefaultIconsNames.edit, size: 15 },
                      size: 28,
                      onPress: () =>
                        setModalEditFuncaoParams(prev => ({
                          ...prev,
                          mode: 'edit',
                          quantidade: item.quantidade,
                          experiencia: item.experiencia,
                          visible: true,
                        })),
                    },
                    {
                      icon: { ...DefaultIconsNames.delete, size: 16, backgroundColor: Pallete.error },
                      size: 28,
                      onPress: () => {
                        Alert.alert('Excluir', 'Tem certeza que deseja excluir essa funcao?', [{ text: 'Cancelar' }, { text: 'Confirmar' }]);
                      },
                    },
                  ]}
                />
              )}
              buttons={[
                {
                  icon: { ...DefaultIconsNames.add, size: 18 },
                  onPress: () =>
                    setModalEditFuncaoParams(prev => ({
                      ...prev,
                      visible: true,
                      mode: 'add',
                      quantidade: 1,
                      experiencia: '1',
                    })),
                },
              ]}
            />
          )}
          {templateList.find(item => item.id === selectedTemplate)?.tipo === 'Fixo' && <View></View>}
        </View>
        <FancyButton label="Confirmar" icon={{ ...DefaultIconsNames.confirm, size: 16 }} onPress={props.onConfirm} />
        {modalEditFuncaoParams.visible && (
          <FancyModalDialog
            title={modalEditFuncaoParams.mode === 'add' ? 'Nova Função' : 'Editar Função'}
            modalProps={{
              visible: modalEditFuncaoParams.visible,
            }}
            onButton1Press={() => setModalEditFuncaoParams(prev => ({ ...prev, visible: false }))}
            onButton2Press={() => setModalEditFuncaoParams(prev => ({ ...prev, visible: false }))}
            centerContainerStyle={{ gap: 15 }}
          >
            {modalEditFuncaoParams.mode === 'add' && (
              <FancyDropDown
                label="Função"
                listItems={funcoesList.map(item => ({ title: item.nome, value: item.id }))}
                value={modalEditFuncaoParams.funcao}
                onChange={value => setModalEditFuncaoParams(prev => ({ ...prev, funcao: value }))}
              />
            )}
            <FancyTextInput
              label="Quantidade"
              inputProps={{
                keyboardType: 'numeric',
                maxLength: 2,
                onChangeText: value => {
                  setModalEditFuncaoParams(prev => ({ ...prev, quantidade: +value }));
                },
              }}
              value={modalEditFuncaoParams.quantidade.toString()}
            />
            <FancyDropDown
              label="Experiência"
              value={modalEditFuncaoParams.experiencia}
              listItems={[
                { title: 'Alta', value: '3' },
                { title: 'Média', value: '2' },
                { title: 'Baixa', value: '1' },
              ]}
              onChange={value => setModalEditFuncaoParams(prev => ({ ...prev, experiencia: value }))}
            />
          </FancyModalDialog>
        )}
      </View>
    </FancyFullModal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  contentContainer: { gap: 15, paddingHorizontal: 18, flex: 1 },
});
