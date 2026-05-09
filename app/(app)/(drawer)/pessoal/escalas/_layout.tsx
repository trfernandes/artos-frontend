import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';
import SubstituicoesHeaderButton from '../../../../../components/pages/pessoal/escalas/index/SubstituicoesHeaderButton';

export default function EscalasLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Minhas Escalas',
          headerRight: () => (
            <>
              <SubstituicoesHeaderButton />
              <MainHeaderButtons />
            </>
          ),
        }}
      />
      <Stack.Screen
        name='evento'
        options={{
          title: 'Detalhes de Evento',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
      <Stack.Screen
        name='setlist/[itemId]'
        options={{
          title: 'Música do SetList',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
      <Stack.Screen
        name='substituicoes'
        options={{
          title: 'Substituições',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
    </Stack>
  );
}
