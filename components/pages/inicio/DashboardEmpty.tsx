import React from 'react';
import { View, StyleSheet } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons, { IconLibrary } from '../../FancyIcons';
import { usePallete } from '../../../hooks/usePallete';

type DashboardEmptyCategory = 'escalas' | 'eventos' | 'solicitacoes' | 'ministerios' | 'generic';

type DashboardEmptyProps = {
  label?: string;
  category?: DashboardEmptyCategory;
};

const categoryConfig: Record<
  DashboardEmptyCategory,
  { library: IconLibrary; name: string; defaultLabel: string }
> = {
  escalas: {
    library: 'MaterialCommunityIcons',
    name: 'calendar-blank-outline',
    defaultLabel: 'Nenhuma escala próxima',
  },
  eventos: {
    library: 'MaterialCommunityIcons',
    name: 'calendar-star',
    defaultLabel: 'Nenhum evento próximo',
  },
  solicitacoes: {
    library: 'MaterialCommunityIcons',
    name: 'inbox-outline',
    defaultLabel: 'Nenhuma solicitação pendente',
  },
  ministerios: {
    library: 'MaterialCommunityIcons',
    name: 'account-group-outline',
    defaultLabel: 'Nenhum ministério encontrado',
  },
  generic: {
    library: 'MaterialCommunityIcons',
    name: 'emoticon-happy-outline',
    defaultLabel: 'Tudo tranquilo por aqui!',
  },
};

export default function DashboardEmpty({ label, category = 'generic' }: DashboardEmptyProps) {
  const Pallete = usePallete();
  const config = categoryConfig[category];

  return (
    <View style={styles.container}>
      <DefaultIcons.Custom
        library={config.library}
        name={config.name}
        size={18}
        color={Pallete.fonts.inactive2}
      />
      <FancyText size='small' type='mediumItalic' color={Pallete.fonts.inactive2}>
        {label || config.defaultLabel}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 10,
    opacity: 0.5,
  },
});
