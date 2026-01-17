import { useMemo } from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { DefaultIconsNames } from '../../../../constants/icons';
import FancyButton from '../../../buttons/FancyButton';
import FancyPageView from '../../../containers/FancyPageView';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import FancyErrorText from '../../../forms/FancyErrorText';
import TemplateFixoEquipeList from './TemplateFixoEquipeList';
import TemplateFuncoesList from './TemplateFuncoesList';
import { Operator, ValueType, DynamicQuery } from '../../../../domain/utils/query_utils';
import { useMinisterioFuncoesCrud } from '../../../../hooks/useMinisterioFuncoesCrud';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { EscalaTemplateFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import { StyleSheet, View } from 'react-native';
import { useVoluntariosDoMinisterioCrud } from '../../../../hooks/useVoluntariosDoMinisterioCrud';
import { EscalaTemplateTipoEnum, EscalaTemplateTipoEnumMap } from '../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { MinisterioFuncaoStatusEnum } from '../../../../domain/enums/MinisterioFuncao/ministerio-funcao-status.enum';

export interface TemplateFormProps {
  mode: 'add' | 'edit';
  ministerioId?: string;
  onSave?: () => void;
  isLoading?: boolean;
}

export default function TemplateForm({ mode = 'add', ministerioId, onSave, isLoading = false }: TemplateFormProps) {
  const form = useFormContext<EscalaTemplateFormData>();
  const tipoWatch = form.watch('tipo');
  const funcoesWatch = form.watch('funcoes');
  const voluntariosWatch = form.watch('voluntarios');

  const { ministerioVoluntariosDropDownList, ministerioVoluntariosList } = useVoluntariosDoMinisterioCrud(ministerioId);

  //Buscar Funções
  const funcoesGetParams = useMemo(() => {
    if (!ministerioId) return undefined;
    return {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
          {
            path: 'status',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: MinisterioFuncaoStatusEnum.Ativo },
          },
        ],
        relations: ['ministerio'],
      },
    } as DynamicQuery;
  }, [ministerioId]);

  const { data: funcoesList, isLoading: isFuncoesLoading } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: funcoesGetParams,
  });

  //Criar listas para os dropdowns
  const funcoesDropDownList = useMemo(() => {
    if (!funcoesList) return [];

    const list = funcoesList.map((f) => ({
      title: f.nome,
      value: f.id,
    })) as DropDownItemProps<string>[];

    return list;
  }, [ministerioId, funcoesList]);

  const respSetListFuncoesDropDownList = useMemo(() => {
    const filteredFuncoes = funcoesDropDownList.filter((f) => funcoesWatch?.some((fw: any) => fw.funcaoId === f.value));
    return [{ title: 'Nenhum', value: undefined }, ...filteredFuncoes];
  }, [funcoesDropDownList]);

  const respSetListVoluntariosDropDownList = useMemo(() => {
    const filteredVoluntarios = ministerioVoluntariosDropDownList.filter((v) => voluntariosWatch?.some((vw: any) => vw.voluntarioId === v.value));
    return [{ title: 'Nenhum', value: undefined }, ...filteredVoluntarios];
  }, [ministerioVoluntariosDropDownList]);

  const isFormDisabled = isLoading || isFuncoesLoading;

  return (
    <FancyPageView style={[styles.container, { pointerEvents: isFormDisabled ? 'none' : 'auto' }]}>
      <ControlledTextInput control={form.control} name={'nome'} label='Nome' disabled={isFormDisabled} />
      <ControlledDropDown
        control={form.control}
        name={'tipo'}
        label='Tipo'
        disabled={isFormDisabled}
        listItems={[
          { title: 'Fixo', value: EscalaTemplateTipoEnum.Fixo },
          { title: 'Funções', value: EscalaTemplateTipoEnum.Funcoes },
        ]}
      />
      <FormProvider {...form}>
        {EscalaTemplateTipoEnumMap[tipoWatch] === EscalaTemplateTipoEnum.Funcoes && (
          <>
            <ControlledDropDown
              control={form.control}
              name={'respSetListFuncoesId'}
              label='Responsável pelo setlist'
              listItems={respSetListFuncoesDropDownList}
              disabled={isFormDisabled}
            />
            <View style={{ marginTop: 3, flex: 1 }}>
              <TemplateFuncoesList funcoesList={funcoesDropDownList} disabled={isFormDisabled} ministerioId={ministerioId ?? ''} />
            </View>
            <FancyErrorText message={form.formState.errors.funcoes?.message!} />
          </>
        )}
        {EscalaTemplateTipoEnumMap[tipoWatch] === EscalaTemplateTipoEnum.Fixo && (
          <>
            <ControlledDropDown
              control={form.control}
              name={'respSetListVoluntariosId'}
              label='Responsável pelo setlist'
              disabled={isFormDisabled}
              listItems={respSetListVoluntariosDropDownList}
            />
            <TemplateFixoEquipeList
              disabled={isFormDisabled}
              voluntariosList={ministerioVoluntariosList}
              funcoesList={funcoesList}
              voluntariosDropDownList={ministerioVoluntariosDropDownList}
              funcoesDropDownList={funcoesDropDownList}
            />
            <FancyErrorText message={form.formState.errors.voluntarios?.message!} />
          </>
        )}
      </FormProvider>

      {/* Para dar mais espaçamento */}
      <View />

      <FancyButton
        label={!isLoading ? 'Salvar' : 'Salvando...'}
        disabled={isFormDisabled}
        icon={{ ...DefaultIconsNames.save, size: 14 }}
        onPress={onSave}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, gap: 14, paddingHorizontal: 20, paddingBottom: 15 },
});
