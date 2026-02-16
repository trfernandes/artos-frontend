import React, { useCallback, useMemo, useState } from 'react';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import FancyContainerList from '../../../../container_list/FancyContainerList';
import EventoFormFuncaoModal from './EventoFormFuncaoModal';
import { FieldArrayWithId, useFieldArray, useFormContext } from 'react-hook-form';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { EscalaEventoTemplateFormData, EscalaEventoTemplateFuncaoFormData } from '../../../../../domain/schemas/escalaSchema';
import { FancyAlert } from '../../../../modal/FancyAlert';
import { ResponseMinisterioFuncaoDto } from '../../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import { EscalaTemplateExperienciaLabel } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';

interface EscalaFormFuncaoListProps {
  ministerioId: string;
  funcoesList: ResponseMinisterioFuncaoDto[];
  funcoesDropDownList: DropDownItemProps<string>[];
}

export const EscalaFormFuncaoList = React.memo(function EscalaFormFuncaoList({
  ministerioId,
  funcoesList,
  funcoesDropDownList,
}: EscalaFormFuncaoListProps) {
  const [equipeFormModalProps, setEquipeFormModalProps] = useState<{
    visible: boolean;
    mode: 'add' | 'edit';
    data?: EscalaEventoTemplateFuncaoFormData;
  } | null>();

  const formTemplate = useFormContext<EscalaEventoTemplateFormData>();

  const funcoesArray = useFieldArray({
    control: formTemplate.control,
    name: 'funcoes',
    keyName: 'funKey',
  });

  const funcoesSelectionList = useMemo<DropDownItemProps<string>[]>(() => {
    if (!funcoesList?.length) return [];

    const usados = new Set(funcoesArray.fields.map((f) => f.funcaoId));

    return funcoesList
      .filter((f) => f.id && !usados.has(f.id))
      .map((ff) => ({
        title: ff.nome,
        value: ff.id!,
      }));
  }, [funcoesList, funcoesArray.fields]);

  const handleAddFuncao = useCallback(
    (data: EscalaEventoTemplateFuncaoFormData) => {
      funcoesArray.append(data);
    },
    [funcoesArray],
  );

  const handleEditFuncao = useCallback(
    (item: EscalaEventoTemplateFuncaoFormData) => {
      const funcaoIndex = funcoesArray.fields.findIndex((f) => f.funcaoId === item.funcaoId);
      if (funcaoIndex >= 0) {
        funcoesArray.update(funcaoIndex, item);
      }
    },
    [funcoesArray],
  );

  const handleDeleteFuncao = useCallback(
    (item: FieldArrayWithId<EscalaEventoTemplateFormData, 'funcoes', 'funKey'>) => {
      FancyAlert.alert('Exclusão', `Deseja realmente excluir a função?`, [
        {
          text: 'Não',
          style: 'destructive',
        },
        {
          text: 'Sim',
          style: 'default',
          onPress: () => {
            const index = funcoesArray.fields.findIndex((f) => f.funKey === item.funKey);
            if (index >= 0) {
              funcoesArray.remove(index);
            }
          },
        },
      ]);
    },
    [funcoesArray],
  );

  const handleResetFuncoes = useCallback(() => {
    FancyAlert.alert('Exclusão', `Deseja realmente excluir todas as funções?`, [
      {
        text: 'Não',
        style: 'destructive',
      },
      {
        text: 'Sim',
        style: 'default',
        onPress: () => {
          funcoesArray.replace([]);
        },
      },
    ]);
  }, [funcoesArray]);

  const funcoesNomeMap = useMemo(() => new Map(funcoesList.map((funcao) => [funcao.id, funcao.nome ?? ''])), [funcoesList]);

  const sortedFuncoesFields = useMemo(() => {
    if (!funcoesArray.fields.length) return [];

    return [...funcoesArray.fields].sort((a, b) =>
      (funcoesNomeMap.get(a.funcaoId) ?? '').localeCompare(funcoesNomeMap.get(b.funcaoId) ?? '', 'pt-BR', {
        sensitivity: 'base',
      }),
    );
  }, [funcoesArray.fields, funcoesNomeMap]);

  return (
    <>
      <FancyContainerList
        title={'Equipe'}
        contentContainerStyle={{ paddingTop: 5 }}
        data={sortedFuncoesFields}
        keyExtractor={({ funKey }) => funKey}
        renderItem={({ item }) => {
          const funcaoInfo = funcoesList.find((f) => f.id === item.funcaoId);

          return (
            <FancyCard.Simple
              title={funcaoInfo?.nome}
              subtitle={EscalaTemplateExperienciaLabel[item.experiencia]}
              additionalData1={`Quantidade: ${item.quantidade}`}
              actionButtons={[
                {
                  size: 'small',
                  icon: { ...DefaultIconsNames.edit, size: 15 },
                  onPress: () => {
                    setEquipeFormModalProps({ mode: 'edit', visible: true, data: item });
                  },
                },
                {
                  size: 'small',
                  icon: { ...DefaultIconsNames.delete, size: 15, backgroundColor: Pallete.error },
                  onPress: () => handleDeleteFuncao(item),
                },
              ]}
            />
          );
        }}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 18 },
            onPress: () => setEquipeFormModalProps({ visible: true, mode: 'add', data: undefined }),
          },
          {
            icon: { ...DefaultIconsNames['list-clear'], size: 16, style: { paddingLeft: 2 } },
            onPress: handleResetFuncoes,
          },
        ]}
      />
      {equipeFormModalProps?.visible && (
        <EventoFormFuncaoModal
          mode={equipeFormModalProps.mode}
          funcoesSelectionList={equipeFormModalProps.mode === 'add' ? funcoesSelectionList : funcoesDropDownList}
          data={equipeFormModalProps.data}
          modalProps={{
            onButton1Press: () => setEquipeFormModalProps(null),
            onButton2Press: (data) => {
              if (equipeFormModalProps.mode === 'add') handleAddFuncao(data!);
              else if (equipeFormModalProps.mode === 'edit') handleEditFuncao(data!);
              setEquipeFormModalProps(null);
            },
          }}
        />
      )}
    </>
  );
});
