import { StyleSheet } from 'react-native';
import { ImageUtils } from '../../../../../utils/image_utils';
import { useCallback, useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyScrollView from '../../../../../components/FancyScrollView';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import ControlledTextInput from '../../../../../components/forms/ControlledTextInput';
import ControlledDropDown from '../../../../../components/forms/ControlledDropDown';
import {
  EscalaTemplate,
  EscalaTemplateTipoEnum,
} from '../../../../../domain/models/EscalaTemplate';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import TemplateFuncoesList from '../../../../../components/pages/ministerios/templates_equipe/TemplateFuncoesList';
import TemplateFixoEquipeList from '../../../../../components/pages/ministerios/templates_equipe/TemplateFixoEquipeList';
import { DropDownItemProps } from '../../../../../components/fields/FancyDropDownItem';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { Voluntario } from '../../../../../domain/models/Voluntario';
import { MinisterioFuncaoStatusEnum } from '../../../../../domain/models/MinisterioFuncao';
import {
  EscalaTemplateFormData,
  escalaTemplateSchema,
} from '../../../../../domain/schemas/escalaTemplateSchema';
import FancyErrorText from '../../../../../components/forms/FancyErrorText';

export default function MinisterioTemplatesAddPage() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const form = useForm<EscalaTemplateFormData>({
    resolver: zodResolver(escalaTemplateSchema),
    defaultValues: {
      ministerioId,
      tipo: EscalaTemplateTipoEnum.Funcoes,
      respSetListFuncoesId: undefined,
      respSetListVoluntariosId: undefined,
    },
  });

  const tipoWatch = form.watch('tipo');
  const funcoesWatch = form.watch('funcoes');

  //Buscar voluntários do ministério
  const voluntariosGetParams = useMemo(() => {
    if (!ministerioId) return undefined;

    return {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
      relations: ['voluntario'],
    } as DynamicQuery;
  }, [ministerioId]);

  const { data: ministerioVoluntariosList } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams: voluntariosGetParams,
  });

  const voluntariosList = useMemo((): Voluntario[] => {
    return ministerioVoluntariosList?.map(mv => mv.voluntario) as Voluntario[];
  }, [ministerioVoluntariosList]);

  const voluntariosDropDownList = useMemo(() => {
    if (!ministerioId) return [];

    const responsavel = voluntariosList.map(voluntario => {
      const fotoSource = ImageUtils.rawToDataUri(voluntario?.foto);

      return {
        title: voluntario?.nome,
        value: voluntario?.id,
        left: fotoSource
          ? { type: 'image', source: fotoSource }
          : { source: require('../../../../../assets/images/empty_profile_image.png') },
      } as DropDownItemProps<string>;
    });

    return responsavel;
  }, [ministerioId, ministerioVoluntariosList]);

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

  const { data: funcoesList } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: funcoesGetParams,
  });

  const funcoesDropDownList = useMemo(() => {
    if (!funcoesList) return [];
    const list = funcoesList.map(f => ({
      title: f.nome,
      value: f.id,
    })) as DropDownItemProps<string>[];
    return list;
  }, [funcoesList, funcoesWatch]);

  const respSetListFuncoesDropDownList = useMemo(() => {
    return [{ title: 'Nenhum', value: undefined }, ...funcoesDropDownList];
  }, [funcoesDropDownList]);

  const respSetListVoluntariosDropDownList = useMemo(() => {
    return [{ title: 'Nenhum', value: undefined }, ...voluntariosDropDownList];
  }, [voluntariosDropDownList]);

  const { add: addTemplate, isLoadingMutation } = useEscalaTemplatesCrud();

  const handleOnSave = useCallback(
    form.handleSubmit(data => {
      addTemplate(data as EscalaTemplate).then(() => {
        router.back();
      });
    }),
    []
  );

  return (
    <FancyPageView
      style={[styles.container, { pointerEvents: isLoadingMutation ? 'none' : 'auto' }]}
    >
      <FancyScrollView
        nestedScrollEnabled
        contentContainerStyle={{ flex: 1, paddingBottom: 0, paddingHorizontal: 20, gap: 15 }}
      >
        <ControlledTextInput control={form.control} name={'nome'} label="Nome" />
        <ControlledDropDown
          showSelectedImage
          control={form.control}
          name={'tipo'}
          label="Tipo"
          listItems={[
            { title: 'Fixo', value: EscalaTemplateTipoEnum.Fixo },
            { title: 'Funções', value: EscalaTemplateTipoEnum.Funcoes },
          ]}
        />
        <FormProvider {...form}>
          {tipoWatch === EscalaTemplateTipoEnum.Funcoes && (
            <>
              <ControlledDropDown
                control={form.control}
                name={'respSetListFuncoesId'}
                label="Responsável pelo setlist"
                listItems={respSetListFuncoesDropDownList}
              />
              <TemplateFuncoesList funcoesList={funcoesDropDownList} />
              <FancyErrorText message={form.formState.errors.funcoes?.message!} />
            </>
          )}
          {tipoWatch === EscalaTemplateTipoEnum.Fixo && (
            <>
              <ControlledDropDown
                control={form.control}
                name={'respSetListVoluntariosId'}
                label="Responsável pelo setlist"
                showSelectedImage
                listItems={respSetListVoluntariosDropDownList}
              />
              <TemplateFixoEquipeList
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

      {/* BOTÃO SALVAR */}
      <FancyButton
        label={!isLoadingMutation ? 'Salvar' : 'Salvando...'}
        disabled={isLoadingMutation}
        icon={{ ...DefaultIconsNames.save, size: 20 }}
        containerStyle={{ marginHorizontal: 20 }}
        onPress={handleOnSave}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, gap: 20 },
});
