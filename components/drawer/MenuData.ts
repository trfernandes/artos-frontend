import { UserLoginData, UserMinisterio } from '../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../domain/models/Ministerio';
import { HierarquiaEnum } from '../../domain/models/MinisterioVoluntario';
import { VoluntarioPapelEnum } from '../../domain/models/Voluntario';
import { CustomIconProps } from '../FancyIcons';

const normalizeMinisterioTipo = (tipo: UserMinisterio['tipo']): MinisterioTipoEnum => {
  const rawTipo = tipo?.toString() ?? '';
  const viaKey = (MinisterioTipoEnum as Record<string, MinisterioTipoEnum>)[rawTipo];

  if (viaKey) {
    return viaKey;
  }

  return (Object.values(MinisterioTipoEnum) as string[]).includes(rawTipo)
    ? (rawTipo as MinisterioTipoEnum)
    : MinisterioTipoEnum.Outros;
};

export type DrawerItemData = {
  logo?: { type: 'logo'; value: string } | { type: 'icon'; value: CustomIconProps };
  title: string;
  subtitle?: string;
  items?: DrawerItemData[];
  type?: 'RunMethod' | 'GoToRoute';
  onPress?:
    | { type: 'RunMethod'; method: () => void }
    | { type: 'GoToRoute'; routeName: string };
};

const BASE_MENU: DrawerItemData[] = [
  {
    logo: { type: 'icon', value: { name: 'home', library: 'Octicons', size: 18 } },
    title: 'Início',
    onPress: { type: 'GoToRoute', routeName: '/' },
  },
  {
    title: 'Indisponibilidade',
    logo: {
      type: 'icon',
      value: { name: 'calendar-times', library: 'FontAwesome6', size: 18 },
    },
    onPress: { type: 'GoToRoute', routeName: '/pessoal/indisponibilidade' },
  },
  {
    title: 'Minhas Escalas',
    logo: {
      type: 'icon',
      value: { name: 'calendar-today', library: 'MaterialCommunityIcons', size: 21 },
    },
    onPress: { type: 'GoToRoute', routeName: '/pessoal/escalas' },
  },
];

const ADMIN_MENU: DrawerItemData[] = [
  {
    logo: {
      type: 'icon',
      value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 21 },
    },
    title: 'Eventos',
    onPress: { type: 'GoToRoute', routeName: '/admin/eventos' },
  },
  {
    logo: { type: 'icon', value: { name: 'grid', library: 'Feather', size: 18 } },
    title: 'Ministérios',
    onPress: { type: 'GoToRoute', routeName: '/admin/ministerios' },
  },
  {
    logo: { type: 'icon', value: { name: 'people', library: 'Octicons', size: 18 } },
    title: 'Voluntários',
    onPress: { type: 'GoToRoute', routeName: '/admin/voluntarios' },
  },
];

const getMenuForMinisterio = (ministerio: UserMinisterio): DrawerItemData[] => {
  const ministerioTipo = normalizeMinisterioTipo(ministerio.tipo);
  const routeParams = `?ministerioId=${ministerio.id}`;

  switch (ministerioTipo) {
    case MinisterioTipoEnum.Louvor:
      return [
        {
          logo: ministerio.logo
            ? { type: 'logo', value: ministerio.logo }
            : { type: 'icon', value: { name: 'music', library: 'Feather', size: 18 } },
          title: ministerio.nome ?? 'Ministério',
          subtitle: ministerio.hierarquia ? HierarquiaEnum[ministerio.hierarquia!] : '',
          items: [
            {
              title: 'Escalas',
              logo: {
                type: 'icon',
                value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 21 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/escalas${routeParams}` },
            },
            {
              title: 'Integrantes',
              logo: { type: 'icon', value: { name: 'people', library: 'Octicons', size: 18 } },
              onPress: {
                type: 'GoToRoute',
                routeName: `/ministerios/integrantes${routeParams}`,
              },
            },
            {
              title: 'Funções',
              logo: {
                type: 'icon',
                value: { library: 'FontAwesome6', name: 'person-rays', size: 18 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/funcoes${routeParams}` },
            },
            {
              title: 'Substituições',
              logo: {
                type: 'icon',
                value: {
                  name: 'file-send-outline',
                  library: 'MaterialCommunityIcons',
                  size: 20,
                },
              },
              onPress: {
                type: 'GoToRoute',
                routeName: `/ministerios/substituicoes${routeParams}`,
              },
            },
            {
              title: 'Templates de Equipe',
              logo: {
                type: 'icon',
                value: {
                  name: 'file-document-outline',
                  library: 'MaterialCommunityIcons',
                  size: 20,
                },
              },
              onPress: {
                type: 'GoToRoute',
                routeName: `/ministerios/templates_equipe${routeParams}`,
              },
            },
          ],
        },
      ];
    case MinisterioTipoEnum.Outros:
      return [
        {
          logo: ministerio.logo
            ? { type: 'logo', value: ministerio.logo }
            : { type: 'icon', value: { name: 'grid', library: 'Feather', size: 18 } },
          title: ministerio.nome ?? 'Minist�rio',
          subtitle: ministerio.hierarquia ? HierarquiaEnum[ministerio.hierarquia!] : '',
          items: [
            {
              title: 'Escalas',
              logo: {
                type: 'icon',
                value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 21 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/escalas${routeParams}` },
            },
            {
              title: 'Funções',
              logo: {
                type: 'icon',
                value: { library: 'FontAwesome6', name: 'person-rays', size: 18 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/funcoes${routeParams}` },
            },
            {
              title: 'Integrantes',
              logo: { type: 'icon', value: { name: 'people', library: 'Octicons', size: 18 } },
              onPress: {
                type: 'GoToRoute',
                routeName: `/ministerios/integrantes${routeParams}`,
              },
            },
          ],
        },
      ];
    default:
      return [];
  }
};

export function getMenuForUser(
  user: UserLoginData
): { section: string; items: DrawerItemData[] }[] {
  const sections: { section: string; items: DrawerItemData[] }[] = [];

  // Sempre base
  sections.push({ section: 'Pessoal', items: BASE_MENU });

  if (user?.ministerios?.length >= 1) {
    const ministeriosMenus = user?.ministerios
      .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? ''))
      .map(ministerio => {
        return getMenuForMinisterio(ministerio);
      });
    sections.push({ section: 'Ministérios', items: ministeriosMenus.flat() });
  }

  if (user?.papel === VoluntarioPapelEnum.Admin) {
    sections.push({ section: 'Administração', items: ADMIN_MENU });
  }

  return sections;
}
