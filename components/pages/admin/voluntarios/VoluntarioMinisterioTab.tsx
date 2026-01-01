import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyFab from '../../../buttons/FancyFab';
import { useMemo, useState } from 'react';
import {
    MinisterioVoluntarioModel,
    MinisterioVoluntarioStatusEnum,
    MinisterioVoluntarioStatusEnumMap,
} from '../../../../domain/models/MinisterioVoluntario';
import { Pallete } from '../../../../constants/colors';
import { isAfter } from 'date-fns';
import { NotificacaoModel } from '../../../../domain/models/Notificacao';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import { DefaultIconsNames } from '../../../../constants/icons';
import MinisterioAddForm, { MinisterioAddFormData } from './MinisterioAddForm';
import ListaMinisteriosAtivos from './ListaMinisteriosAtivos';
import ListaMinisterioInativos from './ListaMinisterioInativos';

export default function VoluntarioMinisterioTab({
  mode = 'edit',
  ...props
}: {
  ministerios: MinisterioVoluntarioModel[] | null | undefined;
  historico?: NotificacaoModel[] | null;
  onEnable?: (ministerioVoluntario: MinisterioVoluntarioModel) => void;
  onDisabled?: (ministerioVoluntario: MinisterioVoluntarioModel) => void;
  onAdd?: (data: MinisterioAddFormData) => void;
  onUpdate?: (data: MinisterioAddFormData) => void;
  mode?: 'view' | 'edit';
}) {
  const ministeriosAtivos = useMemo(
    () =>
      props.ministerios?.filter(
        mv => MinisterioVoluntarioStatusEnumMap[mv.status] === MinisterioVoluntarioStatusEnum.Ativo
      ) || [],
    [props.ministerios]
  );

  const ministeriosInativos = useMemo<MinisterioVoluntarioModel[]>(
    //Lista somente ministérios com status atual igual a inativo, e o último histórico com status ativo
    () => {
      const a =
        props.ministerios
          ?.filter(mv => MinisterioVoluntarioStatusEnumMap[mv.status] === MinisterioVoluntarioStatusEnum.Inativo)
          .map(ministerio => {
            const historico = ministerio.historico ?? [];

            const ultimoAtivo = historico.reduce((acc, item) => {
              if (MinisterioVoluntarioStatusEnumMap[item.status] !== MinisterioVoluntarioStatusEnum.Ativo) {
                return acc;
              }

              if (!acc) return item;

              return isAfter(item.dataInicio, acc.dataInicio) ? item : acc;
            }, undefined as (typeof historico)[number] | undefined);

            // aqui você decide o que quer retornar:
            // só o último período, ou par { ministerio, ultimoAtivo }

            ministerio.historico = ultimoAtivo ? [ultimoAtivo] : [];

            return ministerio;
          }) ?? [];
      return a;
    },
    [props.ministerios]
  );

  const [collapsedAtivos, setCollapsedAtivos] = useState(false);
  const [collapsedInativos, setCollapsedInativos] = useState(true);

  const [addMinisterioFormProps, setAddMinisterioFormProps] = useState<{
    visible: boolean;
    mode?: 'add' | 'edit';
    data?: MinisterioAddFormData;
  }>({
    visible: false,
  });

  if (!props.ministerios) return null;

  return (
    <View style={styles.container}>
      {props.ministerios ? (
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <SectioHeaderCollapsable
            title={`Ativos (${ministeriosAtivos.length})`}
            collapse={collapsedAtivos}
            onCollapseToggle={() => setCollapsedAtivos(!collapsedAtivos)}
          >
            <ListaMinisteriosAtivos
              mode={mode}
              ministerios={ministeriosAtivos}
              onEditButtonPress={item => {
                setAddMinisterioFormProps({
                  visible: true,
                  mode: 'edit',
                  data: {
                    ministerioId: item.ministerio?.id || '',
                    hierarquia: item.hierarquia,
                    ministerioVoluntarioId: item.id,
                  },
                });
              }}
              onDisableButtonPress={item => {
                props.onDisabled?.(item);
              }}
            />
          </SectioHeaderCollapsable>
          <SectioHeaderCollapsable
            title={`Inativos (${ministeriosInativos.length})`}
            collapse={collapsedInativos}
            onCollapseToggle={() => setCollapsedInativos(!collapsedInativos)}
          >
            <ListaMinisterioInativos
              ministeriosInativos={ministeriosInativos}
              onActivateButtonPress={item => {
                props.onEnable?.(item);
              }}
            />
          </SectioHeaderCollapsable>
        </View>
      ) : null}
      {mode === 'edit' && (
        <FancyFab right={0} bottom={0} onPress={() => setAddMinisterioFormProps({ visible: true, mode: 'add' })} />
      )}
      {mode === 'edit' && addMinisterioFormProps?.visible && (
        <MinisterioAddForm
          mode={addMinisterioFormProps.mode || 'add'}
          defaultValues={addMinisterioFormProps.data}
          ministerios={props.ministerios}
          onButton1Press={() => setAddMinisterioFormProps({ visible: false })}
          onButton2Press={data => {
            setAddMinisterioFormProps({ visible: false });

            if (data?.mode === 'add') {
              props.onAdd?.(data);
            } else if (data?.mode === 'edit') {
              props.onUpdate?.(data);
            }
          }}
        />
      )}
    </View>
  );
}

const SectioHeaderCollapsable = (props: {
  title: string;
  children: React.ReactNode;
  collapse: boolean;
  onCollapseToggle: () => void;
}) => {
  return (
    <View
      style={[
        {
          gap: 10,
          backgroundColor: 'white',
          ...Pallete.shadows[300],
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 0.6,
          borderColor: Pallete.borderCard,
          marginBottom: 10,
          marginHorizontal: 2,
          paddingHorizontal: 15,
          paddingTop: 10,
        },
        props.collapse ? { height: 40 } : { flex: 1 },
      ]}
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          justifyContent: 'space-between',
        }}
        onPress={props.onCollapseToggle}
      >
        <FancyText size={'small'} type={'bold'} color={Pallete.fonts.inactive}>
          {props.title}
        </FancyText>
        <DefaultIcons.Custom
          library={
            !props.collapse ? DefaultIconsNames['chevron-up'].library : DefaultIconsNames['chevron-down'].library
          }
          name={!props.collapse ? DefaultIconsNames['chevron-up'].name : DefaultIconsNames['chevron-down'].name}
          size={20}
          color={Pallete.icons.inactive2}
        />
      </TouchableOpacity>
      <View>{props.children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 55, overflow: 'hidden' },
});
