import { Image, StyleSheet, View } from 'react-native';
import { useState, useMemo } from 'react';
import { MinisterioAddFormData } from './MinisterioAddForm';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import FancyList from '../../../list/FancyList';
import { FancyCardImageBaseProps, FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyChips from '../../../FancyChips';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { format } from 'date-fns';
import { VoluntarioHierarquiaEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  getMinisterioStatusColorMap,
  MinisterioVoluntarioStatusEnum,
  MinisterioVoluntarioStatusEnumLabel,
} from '../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';

function MinisterioViewCard({ item }: { item: ResponseMinisterioVoluntarioDto }) {
  const palette = usePallete();
  const styles = useThemedStyles(createViewCardStyles);
  const statusColorMap = useMemo(() => getMinisterioStatusColorMap(palette), [palette]);

  const status = item.status as MinisterioVoluntarioStatusEnum;
  const statusColor = statusColorMap[status] ?? palette.primary;
  const statusLabel = MinisterioVoluntarioStatusEnumLabel[status] ?? '';
  const logoUrl = item.ministerio?.logoThumbUrl || item.ministerio?.logoUrl;
  const initial = item.ministerio?.nome?.charAt(0)?.toUpperCase() || '?';
  const dataInicio = item.dataInicio ? format(DateUtilsApi.dateOnlyFromApi(item.dataInicio), 'dd/MM/yyyy') : '—';
  const funcao = VoluntarioHierarquiaEnumLabel[item.hierarquia] ?? '—';

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoFallback, { backgroundColor: `${palette.primary}22` }]}>
            <FancyText type='bold' size='large' color={palette.primary}>
              {initial}
            </FancyText>
          </View>
        )}
      </View>
      <View style={styles.rightSection}>
        <View style={styles.topRow}>
          <FancyText type='bold' size='medium' color={palette.fonts.dark} numberOfLines={1} style={{ flex: 1 }}>
            {item.ministerio?.nome}
          </FancyText>
          <FancyChips label={statusLabel} color={statusColor} size='small' style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.metaRow}>
          <FancyText size='extraSmall' color={palette.fonts.inactive2}>
            Início: {dataInicio}
          </FancyText>
        </View>
        <View style={[styles.metaRow, { marginTop: 2 }]}>
          <FancyText size='extraSmall' color={palette.fonts.inactive2}>
            Função: {funcao}
          </FancyText>
        </View>
      </View>
    </View>
  );
}

function createViewCardStyles(palette: ThemePalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: palette.backgroundColor4,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: `${palette.primary}2E`,
      ...palette.shadows[100],
    },
    leftSection: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 54,
      height: 54,
      borderRadius: 27,
    },
    logoFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightSection: {
      flex: 1,
      gap: 2,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}

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

  if (mode === 'view') {
    return (
      <View style={styles.container}>
        <FancyList
          data={props.ministerios}
          listEmptyProps={{
            label: 'Nenhum ministério vinculado',
            icon: { library: 'MaterialCommunityIcons', name: 'home-group-outline', size: 68 },
          }}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
          renderItem={({ item, index }) => <MinisterioViewCard key={index} item={item} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {props.ministerios ? (
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <FancyList
            data={props.ministerios}
            listEmptyProps={{
              label: 'Nenhum ministério vinculado',
              icon: { library: 'MaterialCommunityIcons', name: 'home-group-outline', size: 68 },
            }}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item, index }) => {
              const ministerioNome = item.ministerio?.nome?.trim() || 'Ministério';
              const cardProps: FancyCardImageBaseProps = {
                title: ministerioNome,
                subtitle: <FancyTextDisplayCard title='Data Inicio:' value={format(DateUtilsApi.dateOnlyFromApi(item.dataInicio), 'dd/MM/yyyy')} />,
                additionalData1: <FancyTextDisplayCard title='Função:' value={VoluntarioHierarquiaEnumLabel[item.hierarquia]} />,
                additionalData2: <FancyChips style={{ marginTop: 3 }} label={MinisterioVoluntarioStatusEnumLabel[item.status as MinisterioVoluntarioStatusEnum] ?? ''} />,
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
                return <FancyCard.Image key={index} type='letter' props={{ ...cardProps, letter: ministerioNome.charAt(0).toUpperCase() || '?' }} />;
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
