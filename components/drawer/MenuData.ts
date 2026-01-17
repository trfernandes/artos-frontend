import { ResponseLoginDto, ResponseLoginMinisterioDto } from '../../domain/dtos/login/login.response';
import { CustomIconProps } from '../FancyIcons';
import { MinisterioTipoEnum } from '../../domain/enums/Ministerio/ministerio-tipo.enum';
import { IgrejaVoluntarioRoleEnum } from '../../domain/enums/Igreja/voluntario-role.enum';
import { VoluntarioHierarquiaEnumLabel } from '../../domain/enums/MinisterioVoluntario/hierarquia.enum';

const normalizeMinisterioTipo = (tipo: ResponseLoginMinisterioDto['tipo']): MinisterioTipoEnum => {
  const rawTipo = tipo?.toString() ?? '';
  const viaKey = (MinisterioTipoEnum as Record<string, MinisterioTipoEnum>)[rawTipo];

  if (viaKey) {
    return viaKey;
  }

  return (Object.values(MinisterioTipoEnum) as string[]).includes(rawTipo) ? (rawTipo as MinisterioTipoEnum) : MinisterioTipoEnum.Outros;
};

export type DrawerItemData = {
  logo?: { type: 'logo'; value: string } | { type: 'icon'; value: CustomIconProps };
  title: string;
  subtitle?: string;
  items?: DrawerItemData[];
  type?: 'RunMethod' | 'GoToRoute';
  onPress?: { type: 'RunMethod'; method: () => void } | { type: 'GoToRoute'; routeName: string };
};

const BASE_MENU: DrawerItemData[] = [
  {
    logo: { type: 'icon', value: { name: 'home', library: 'Octicons', size: 18 } },
    title: 'Inicio',
    onPress: { type: 'GoToRoute', routeName: '/' },
  },
  {
    title: 'Minhas Indisponibilidades',
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

const getMenuForMinisterio = (ministerio: ResponseLoginMinisterioDto): DrawerItemData[] => {
  const ministerioTipo = normalizeMinisterioTipo(ministerio.tipo);
  const routeParams = `?ministerioId=${ministerio.id}`;

  const baseItems: DrawerItemData[] = [
    {
      title: 'Agenda',
      logo: {
        type: 'icon',
        value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 21 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/agenda${routeParams}` },
    },
    {
      title: 'Escalas',
      logo: {
        type: 'icon',
        value: { name: 'calendar-account', library: 'MaterialCommunityIcons', size: 21 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/escalas${routeParams}` },
    },
  ];

  switch (ministerioTipo) {
    case MinisterioTipoEnum.Louvor:
      return [
        {
          logo: ministerio.logoThumbUrl
            ? { type: 'logo', value: ministerio.logoThumbUrl }
            : { type: 'icon', value: { name: 'music', library: 'Feather', size: 18 } },
          title: ministerio.nome ?? 'Ministerio',
          subtitle: ministerio.hierarquia ? VoluntarioHierarquiaEnumLabel[ministerio.hierarquia] : '',
          items: [
            ...baseItems,
            {
              title: 'Indisponibilidades',
              logo: {
                type: 'icon',
                value: { name: 'calendar-times', library: 'FontAwesome6', size: 18 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/indisponibilidades${routeParams}` },
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
            // {
            //   title: 'Substituicoes',
            //   logo: {
            //     type: 'icon',
            //     value: {
            //       name: 'file-send-outline',
            //       library: 'MaterialCommunityIcons',
            //       size: 20,
            //     },
            //   },
            //   onPress: {
            //     type: 'GoToRoute',
            //     routeName: `/ministerios/substituicoes${routeParams}`,
            //   },
            // },
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
          logo: ministerio.logoThumbUrl
            ? { type: 'logo', value: ministerio.logoThumbUrl }
            : { type: 'icon', value: { name: 'grid', library: 'Feather', size: 18 } },
          title: ministerio.nome ?? 'Ministerio',
          subtitle: ministerio.hierarquia ? VoluntarioHierarquiaEnumLabel[ministerio.hierarquia] : '',
          items: [
            ...baseItems,
            {
              title: 'Funções',
              logo: {
                type: 'icon',
                value: { library: 'FontAwesome6', name: 'person-rays', size: 18 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/funcoes${routeParams}` },
            },
            {
              title: 'Indisponibilidades',
              logo: {
                type: 'icon',
                value: { name: 'calendar-times', library: 'FontAwesome6', size: 18 },
              },
              onPress: { type: 'GoToRoute', routeName: `/ministerios/indisponibilidades${routeParams}` },
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

export function getMenuForUser(user: ResponseLoginDto): { section: string; items: DrawerItemData[] }[] {
  const sections: { section: string; items: DrawerItemData[] }[] = [];

  sections.push({ section: 'Pessoal', items: BASE_MENU });

  const ministerios = user?.igrejas?.flatMap((igreja) => igreja.ministerios || []) || [];

  if (ministerios.length >= 1) {
    const ministeriosMenus = ministerios
      .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR', { sensitivity: 'base' }))
      .map((ministerio) => getMenuForMinisterio(ministerio));
    sections.push({ section: 'Ministérios', items: ministeriosMenus.flat() });
  }

  const isAdmin = user?.igrejas?.some((igreja) => igreja.role === IgrejaVoluntarioRoleEnum.ADMIN);
  if (isAdmin) {
    sections.push({ section: 'Administração', items: ADMIN_MENU });
  }

  return sections;
}
