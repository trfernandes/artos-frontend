import React from 'react';
import { StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import FancyListItemCard from '../../cards/FancyListItemCard';
import FancySeparator from '../../FancySeparator';
import { AppImages } from '../../../assets/app_images';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import {
  EscalaSubstituicaoStatusEnum,
  EscalaSubstituicaoStatusEnumLabel,
} from '../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../domain/dtos/Escala/escala-substituicao.response';
import { DateUtilsApi } from '../../../utils/date_utils';
import { getFirstAndLastName } from '../../../utils/text_utils';
import { ThemePalette } from '../../../constants/colors';

type IconLib = 'MaterialIcons' | 'MaterialCommunityIcons';
type StatusVisual = { color: string; icon: string };

export function getStatusVisual(
  status: EscalaSubstituicaoStatusEnum,
  palette: ThemePalette,
): StatusVisual {
  switch (status) {
    case EscalaSubstituicaoStatusEnum.Pendente:
      return { color: palette.warning, icon: 'schedule' };
    case EscalaSubstituicaoStatusEnum.Aprovada:
      return { color: palette.confirm, icon: 'check-circle' };
    case EscalaSubstituicaoStatusEnum.Recusada:
      return { color: palette.error, icon: 'cancel' };
    case EscalaSubstituicaoStatusEnum.Cancelada:
      return { color: palette.fonts.inactive, icon: 'cancel' };
  }
}

function MetaInlineItem({
  icon,
  value,
  palette,
}: {
  icon: { library: IconLib; name: string };
  value: string;
  palette: ThemePalette;
}) {
  return (
    <View
      style={[
        styles.metaItem,
        { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1) },
      ]}
    >
      <DefaultIcons.Custom
        library={icon.library}
        name={icon.name}
        size={12}
        color={palette.primary}
      />
      <FancyText
        type='semiBold'
        size='extraSmall'
        color={palette.primary}
        numberOfLines={1}
      >
        {value}
      </FancyText>
    </View>
  );
}

function PersonRow({
  label,
  nome,
  fotoUrl,
}: {
  label: string;
  nome?: string;
  fotoUrl?: string;
}) {
  const displayName = getFirstAndLastName(nome ?? label);
  return (
    <FancyListItemCard
      title={displayName}
      subtitle={label}
      leading={{
        type: 'image',
        source: fotoUrl ? { uri: fotoUrl } : AppImages.emptyProfile,
      }}
      containerStyle={styles.personCard}
    />
  );
}

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  footer?: React.ReactNode;
};

export default function SubstituicaoCardBase({ substituicao, footer }: Props) {
  const palette = usePallete();
  const visual = getStatusVisual(substituicao.status, palette);
  const isCancelada = substituicao.status === EscalaSubstituicaoStatusEnum.Cancelada;

  const solicitanteVol = substituicao.solicitante?.voluntario;
  const substitutoVol = substituicao.substituto?.voluntario;

  const dataOcorrencia = substituicao.escalaItem?.dataOcorrencia
    ? DateUtilsApi.dateOnlyFromApi(substituicao.escalaItem.dataOcorrencia as string)
    : null;

  const dataFormatted = dataOcorrencia
    ? format(dataOcorrencia, "dd MMM · HH'h'mm", { locale: ptBR })
    : '—';

  const headerBg = ColorUtils.withAlpha(visual.color, 0.1);
  const funcaoNome = substituicao.escalaItem?.funcao?.nome;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderCard },
        palette.shadows[100],
      ]}
    >
      {/* Header tonal de status */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          <DefaultIcons.Custom
            library={'MaterialIcons' as IconLib}
            name={visual.icon}
            size={16}
            color={visual.color}
          />
          <FancyText size='small' type='semiBold' color={visual.color}>
            {EscalaSubstituicaoStatusEnumLabel[substituicao.status]}
          </FancyText>
        </View>
        <FancyText size='extraSmall' color={visual.color}>
          {dataFormatted}
        </FancyText>
      </View>

      {/* Corpo */}
      <View style={styles.body}>
        {/* Bloco de evento */}
        <View>
          <FancyText type='semiBold' size='medium' numberOfLines={2}>
            {substituicao.escalaItem?.evento?.nome ?? '—'}
          </FancyText>
          {funcaoNome ? (
            <View style={styles.metaRow}>
              <MetaInlineItem
                icon={{ library: 'MaterialIcons', name: 'work-outline' }}
                value={funcaoNome}
                palette={palette}
              />
            </View>
          ) : null}
        </View>

        {/* Trade rows: solicitante → substituto via FancyListItemCard */}
        <View>
          <PersonRow
            label='Solicitante'
            nome={solicitanteVol?.nome}
            fotoUrl={solicitanteVol?.fotoThumbUrl ?? solicitanteVol?.fotoUrl}
          />

          <View style={styles.dividerWrap}>
            <FancySeparator />
            <View
              style={[
                styles.dividerIcon,
                {
                  backgroundColor: palette.backgroundColor,
                  borderColor: palette.borderCard,
                },
              ]}
            >
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='swap-vert'
                size={14}
                color={palette.fonts.inactive}
              />
            </View>
          </View>

          <PersonRow
            label='Substituto'
            nome={substitutoVol?.nome}
            fotoUrl={substitutoVol?.fotoThumbUrl ?? substitutoVol?.fotoUrl}
          />
        </View>

        {/* Motivo do solicitante */}
        {substituicao.motivo ? (
          <View
            style={[
              styles.motivoBox,
              { backgroundColor: palette.backgroundColor2 },
            ]}
          >
            <FancyText
              size='extraSmall'
              color={palette.fonts.inactive}
              style={styles.motivoText}
            >
              &ldquo;{substituicao.motivo}&rdquo;
            </FancyText>
          </View>
        ) : null}

        {/* Motivo de cancelamento */}
        {isCancelada && substituicao.motivoCancelamento ? (
          <View
            style={[
              styles.canceledBox,
              { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08) },
            ]}
          >
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Cancelado: {substituicao.motivoCancelamento}
            </FancyText>
          </View>
        ) : null}

        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  body: {
    padding: 14,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  personCard: {
    marginBottom: 0,
  },
  dividerWrap: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dividerIcon: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivoBox: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  motivoText: {
    fontStyle: 'italic',
    lineHeight: 17,
  },
  canceledBox: {
    borderRadius: 8,
    padding: 9,
  },
});
