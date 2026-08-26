import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import FancyAvatarImage from '../../../images/FancyImage';
import FancyScrollView from '../../../FancyScrollView';
import FancyText from '../../../FancyText';
import { format } from 'date-fns';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';
import FancyValueLine from '../../../fields/FancyValueLine';
import DefaultIcons from '../../../FancyIcons';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import { IgrejaVoluntarioRoleEnum } from '../../../../domain/enums/Igreja/voluntario-role.enum';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { AppImages } from '../../../../assets/app_images';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';

export const ROLE_LABELS: Record<IgrejaVoluntarioRoleEnum, string> = {
  [IgrejaVoluntarioRoleEnum.ADMIN]: 'Administrador',
  [IgrejaVoluntarioRoleEnum.LIDER]: 'Líder',
  [IgrejaVoluntarioRoleEnum.VOLUNTARIO]: 'Voluntário',
};

export const ROLE_ICONS: Record<IgrejaVoluntarioRoleEnum, string> = {
  [IgrejaVoluntarioRoleEnum.ADMIN]: 'shield-account-outline',
  [IgrejaVoluntarioRoleEnum.LIDER]: 'star-outline',
  [IgrejaVoluntarioRoleEnum.VOLUNTARIO]: 'account-outline',
};

export const ROLE_COLOR_KEYS: Record<
  IgrejaVoluntarioRoleEnum,
  'warning' | 'secondary' | 'terciary'
> = {
  [IgrejaVoluntarioRoleEnum.ADMIN]: 'warning',
  [IgrejaVoluntarioRoleEnum.LIDER]: 'secondary',
  [IgrejaVoluntarioRoleEnum.VOLUNTARIO]: 'terciary',
};

const ROLE_OPTIONS = Object.values(IgrejaVoluntarioRoleEnum);

function RoleCardSelector(props: {
  value?: IgrejaVoluntarioRoleEnum;
  onChange: (role: IgrejaVoluntarioRoleEnum) => void;
}) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createRoleCardStyles);

  return (
    <View style={{ gap: 14 }}>
      <FancyText size='small' type='bold' style={{ opacity: 0.9 }}>
        Função
      </FancyText>
      <View style={styles.row}>
        {ROLE_OPTIONS.map((role) => {
          const active = props.value === role;
          const accent = Pallete[ROLE_COLOR_KEYS[role]];

          return (
            <Pressable
              key={role}
              onPress={() => props.onChange(role)}
              style={[
                styles.card,
                {
                  borderColor: active ? accent : Pallete.borderCard,
                  backgroundColor: active
                    ? ColorUtils.withAlpha(accent, 0.1)
                    : Pallete.backgroundColor,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: active ? accent : Pallete.backgroundColor3,
                  },
                ]}
              >
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name={ROLE_ICONS[role]}
                  size={18}
                  color={active ? Pallete.icons.light : Pallete.icons.inactive}
                />
              </View>
              <FancyText
                type='semiBold'
                size='extraSmall'
                color={active ? accent : Pallete.fonts.inactive}
                numberOfLines={1}
              >
                {ROLE_LABELS[role]}
              </FancyText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createRoleCardStyles(palette: ThemePalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    card: {
      flex: 1,
      minHeight: 44,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    iconCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default function VoluntarioDadosTab(props: {
  voluntario: ResponseVoluntarioDto;
  role?: IgrejaVoluntarioRoleEnum;
  isLoadingRole?: boolean;
  canChangeRole?: boolean;
  onChangeRole?: (role: IgrejaVoluntarioRoleEnum) => void;
}) {
  const Pallete = usePallete();

  if (!props.voluntario) {
    return;
  }

  return (
    <FancyScrollView contentContainerStyle={styles.container} fill>
      <View style={{ gap: 20 }}>
        <FancyAvatarImage
          source={
            props.voluntario.fotoUrl || props.voluntario.fotoThumbUrl
              ? { uri: props.voluntario.fotoThumbUrl || props.voluntario.fotoUrl || '' }
              : AppImages.emptyProfile
          }
          disabled
          size={100}
          style={{ alignSelf: 'center' }}
        />
        <View style={{ alignItems: 'center', gap: 4, width: '100%' }}>
          <FancyText size={'large'} type='bold' style={{ opacity: 0.8 }}>
            {props.voluntario.nome}
          </FancyText>
          <FancyText
            size={'medium'}
            type='normalItalic'
            numberOfLines={1}
            ellipsizeMode='middle'
            style={{ maxWidth: '100%' }}
          >
            {props.voluntario.email}
          </FancyText>
        </View>
      </View>
      <FancyVerticalSpacer height={40} />
      <View style={{ gap: 15 }}>
        <FancyValueLine
          title='Data de Nascimento:'
          value={
            props.voluntario.dataNascimento
              ? format(DateUtilsApi.dateOnlyFromApi(props.voluntario.dataNascimento), 'dd/MM/yyyy')
              : 'Não definido'
          }
          showSeparator={true}
        />
        <FancyValueLine
          title='Telefone:'
          value={props.voluntario.telefone || 'Não definido'}
          showSeparator={true}
        />
        <FancyValueLine
          title='Endereço:'
          value={props.voluntario.endereco || 'Não definido'}
          showSeparator={true}
        />
        <FancyValueLine
          title='Sexo:'
          value={
            props.voluntario.sexo === 'M'
              ? 'Masculino'
              : props.voluntario.sexo === 'F'
                ? 'Feminino'
                : 'N/A'
          }
          showSeparator={true}
        />
        {props.isLoadingRole ? (
          <ActivityIndicator size='small' color={Pallete.primary} />
        ) : props.canChangeRole ? (
          <RoleCardSelector value={props.role} onChange={(role) => props.onChangeRole?.(role)} />
        ) : (
          <FancyValueLine title='Função:' value={props.role ? ROLE_LABELS[props.role] : 'N/A'} />
        )}
      </View>
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 20, flex: 1, borderWidth: 0, borderColor: 'red' },
  dataDisplay: { width: '100%', justifyContent: 'space-between' },
});
