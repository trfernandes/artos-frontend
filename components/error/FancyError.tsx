import { View, StyleSheet } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyButton from '../buttons/FancyButton';
import { DefaultIconsNames } from '../../constants/icons';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import { EXTRA_SMALL_SIZE_FONT, SEMI_BOLD_FONT } from '../../constants/font';

export interface FancyErrorProps {
  title: string;
  subtitle?: string;
  icon?: CustomIconProps;
  onUpdate?: () => void;
  showTryAgain?: boolean;
}

export default function FancyError({
  title = '',
  subtitle,
  icon,
  showTryAgain = true,
  onUpdate,
}: FancyErrorProps) {
  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', gap: 25 }}>
        {icon && <DefaultIcons.Custom {...icon} />}
        <View style={{ gap: 6, alignItems: 'center' }}>
          <FancyText size={'medium'} type="bold" color={Pallete.fonts.inactive}>
            {title}
          </FancyText>
          {subtitle && (
            <FancyText size={'small'} type="medium" color={Pallete.fonts.inactive}>
              {subtitle}
            </FancyText>
          )}
        </View>
      </View>
      {showTryAgain && (
        <FancyButton
          icon={{ ...DefaultIconsNames.refresh, size: 15, color: Pallete.icons.inactive }}
          type="outlined"
          containerStyle={{
            paddingHorizontal: 20,
            borderColor: Pallete.border,
            borderWidth: 0.9,
            height: 38,
          }}
          labelStyle={{
            color: Pallete.fonts.inactive,
            fontSize: EXTRA_SMALL_SIZE_FONT,
            fontFamily: SEMI_BOLD_FONT,
          }}
          label="Tentar novamente"
          onPress={onUpdate}
        />
      )}
    </View>
  );
}

FancyError.Connection = ({
  title = 'Não foi possível conectar',
  subtitle = 'Verifique sua conexão e tente novamente',
  ...props
}: { title?: string; subtitle?: string } & Pick<FancyErrorProps, 'onUpdate'>) => {
  return (
    <FancyError
      title={title}
      subtitle={subtitle}
      icon={{ library: 'Feather', name: 'cloud-off', color: Pallete.icons.inactive2, size: 80 }}
      {...props}
    />
  );
};

FancyError.Default = (props: Pick<FancyErrorProps, 'onUpdate'>) => {
  return (
    <FancyError
      title="Ocorreu um erro inesperado"
      subtitle="Por favor tente novamente"
      icon={{
        library: 'FontAwesome5',
        name: 'car-crash',
        color: Pallete.icons.inactive2,
        size: 80,
      }}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Pallete.backgroundColor,
    gap: 30,
  },
});
