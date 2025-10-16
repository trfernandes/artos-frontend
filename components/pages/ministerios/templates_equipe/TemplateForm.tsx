import { useMemo } from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { DefaultIconsNames } from '../../../../constants/icons';
import { EscalaTemplateTipoEnum, EscalaTemplateTipoEnumMap } from '../../../../domain/models/EscalaTemplate';
import FancyButton from '../../../buttons/FancyButton';
import FancyPageView from '../../../containers/FancyPageView';
import FancyScrollView from '../../../FancyScrollView';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import FancyErrorText from '../../../forms/FancyErrorText';
import TemplateFixoEquipeList from './TemplateFixoEquipeList';
import TemplateFuncoesList from './TemplateFuncoesList';
import { MinisterioFuncaoStatusEnum } from '../../../../domain/models/MinisterioFuncao';
import { Operator, ValueType, DynamicQuery } from '../../../../domain/utils/query_utils';
import { useMinisterioFuncoesCrud } from '../../../../hooks/useMinisterioFuncoesCrud';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { EscalaTemplateFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import { StyleSheet } from 'react-native';
import { useVoluntariosDoMinisterio } from '../../../../hooks/useVoluntariosDoMinisterio';

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

  const { voluntariosDropDownList, voluntariosList, isLoading: isVoluntariosLoading } = useVoluntariosDoMinisterio(ministerioId);

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

    const list = funcoesList.map(f => ({
      title: f.nome,
      value: f.id,
    })) as DropDownItemProps<string>[];

    return list;
  }, [ministerioId, funcoesList]);

  const respSetListFuncoesDropDownList = useMemo(() => {
    const filteredFuncoes = funcoesDropDownList.filter(f => funcoesWatch?.some((fw: any) => fw.funcaoId === f.value));
    return [{ title: 'Nenhum', value: undefined }, ...filteredFuncoes];
  }, [funcoesDropDownList]);

  const respSetListVoluntariosDropDownList = useMemo(() => {
    const filteredVoluntarios = voluntariosDropDownList.filter(v => voluntariosWatch?.some((vw: any) => vw.voluntarioId === v.value));
    return [{ title: 'Nenhum', value: undefined }, ...filteredVoluntarios];
  }, [voluntariosDropDownList]);

  const isFormDisabled = isLoading || isFuncoesLoading || isVoluntariosLoading;

  return (
    <FancyPageView style={[styles.container, { pointerEvents: isFormDisabled ? 'none' : 'auto' }]}>
      <FancyScrollView nestedScrollEnabled contentContainerStyle={{ flex: 1, paddingBottom: 0, paddingHorizontal: 20, gap: 15 }}>
        <ControlledTextInput control={form.control} name={'nome'} label="Nome" disabled={isFormDisabled} />
        <ControlledDropDown
          showSelectedImage
          control={form.control}
          name={'tipo'}
          label="Tipo"
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
                label="Responsável pelo setlist"
                listItems={respSetListFuncoesDropDownList}
                disabled={isFormDisabled}
              />
              <TemplateFuncoesList funcoesList={funcoesDropDownList} disabled={isFormDisabled} />
              <FancyErrorText message={form.formState.errors.funcoes?.message!} />
            </>
          )}
          {EscalaTemplateTipoEnumMap[tipoWatch] === EscalaTemplateTipoEnum.Fixo && (
            <>
              <ControlledDropDown
                control={form.control}
                name={'respSetListVoluntariosId'}
                label="Responsável pelo setlist"
                showSelectedImage
                disabled={isFormDisabled}
                listItems={respSetListVoluntariosDropDownList}
              />
              <TemplateFixoEquipeList
                disabled={isFormDisabled}
                voluntariosList={voluntariosList}
                funcoesList={funcoesList}
                voluntariosDropDownList={voluntariosDropDownList}
                funcoesDropDownList={funcoesDropDownList}
              />
              <FancyErrorText message={form.formState.errors.voluntarios?.message!} />
            </>
          )}
        </FormProvider>
      </FancyScrollView>

      {/* BOT�O SALVAR */}
      <FancyButton
        label={!isLoading ? 'Salvar' : 'Salvando...'}
        disabled={isFormDisabled}
        icon={{ ...DefaultIconsNames.save, size: 20 }}
        containerStyle={{ marginHorizontal: 20 }}
        onPress={onSave}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, gap: 20 },
});
