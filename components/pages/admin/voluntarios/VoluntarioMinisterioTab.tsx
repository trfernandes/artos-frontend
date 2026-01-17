import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { MinisterioAddFormData } from './MinisterioAddForm';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import FancyList from '../../../list/FancyList';
import { FancyCardImageBaseProps, FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyChips from '../../../FancyChips';
import { MinisterioStatusLabel } from '../../../../domain/enums/Ministerio/ministerio-status.enum';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { format } from 'date-fns';
import { VoluntarioHierarquiaEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';

export default function VoluntarioMinisterioTab({
  mode = 'edit',
  ...props
}: {
  ministerios: ResponseMinisterioVoluntarioDto[] | null | undefined;
  onEnable?: (ministerioVoluntario: ResponseMinisterioVoluntarioDto) => void;
  onDisabled?: (ministerioVoluntario: ResponseMinisterioVoluntarioDto) => void;
  onAdd?: (data: MinisterioAddFormData) => void;
  onUpdate?: (data: MinisterioAddFormData) => void;
  mode?: 'view' | 'edit';
}) {
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
          <FancyList
            data={props.ministerios}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item, index }) => {
              const cardProps: FancyCardImageBaseProps = {
                title: item.ministerio?.nome,
                subtitle: <FancyTextDisplayCard title='Data Inicio:' value={format(DateUtilsApi.dateOnlyFromApi(item.dataInicio), 'dd/MM/yyyy')} />,
                additionalData1: <FancyTextDisplayCard title='Função:' value={VoluntarioHierarquiaEnumLabel[item.hierarquia]} />,
                additionalData2: <FancyChips style={{ marginTop: 3 }} label={MinisterioStatusLabel[item.status]} />,
              };

              if (item.ministerio?.logoUrl || item.ministerio?.logoThumbUrl) {
                return (
                  <FancyCard.Image
                    key={index}
                    type='image'
                    props={{
                      ...cardProps,
                      source: { uri: item.ministerio?.logoThumbUrl || item.ministerio?.logoUrl },
                    }}
                  />
                );
              } else {
                return <FancyCard.Image key={index} type='letter' props={{ ...cardProps, letter: item.ministerio?.nome.charAt(0) || '?' }} />;
              }
            }}
          />
        </View>
      ) : null}
      {/* {mode === 'edit' && <FancyFab right={0} bottom={0} onPress={() => setAddMinisterioFormProps({ visible: true, mode: 'add' })} />}
      {mode === 'edit' && addMinisterioFormProps?.visible && (
        <MinisterioAddForm
          mode={addMinisterioFormProps.mode || 'add'}
          defaultValues={addMinisterioFormProps.data}
          ministerios={props.ministerios}
          onButton1Press={() => setAddMinisterioFormProps({ visible: false })}
          onButton2Press={(data) => {
            setAddMinisterioFormProps({ visible: false });

            if (data?.mode === 'add') {
              props.onAdd?.(data);
            } else if (data?.mode === 'edit') {
              props.onUpdate?.(data);
            }
          }}
        />
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 55, overflow: 'hidden' },
});
