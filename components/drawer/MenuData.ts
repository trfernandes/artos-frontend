import {
  ResponseLoginIgrejaDto,
  ResponseLoginMinisterioDto,
} from '../../domain/dtos/login/login.response';
import { CustomIconProps } from '../FancyIcons';
import {
  MinisterioTipoEnum,
  MinisterioTipoLabel,
} from '../../domain/enums/Ministerio/ministerio-tipo.enum';
import { IgrejaVoluntarioRoleEnum } from '../../domain/enums/Igreja/voluntario-role.enum';
import {
  VoluntarioHierarquiaEnum,
  VoluntarioHierarquiaEnumLabel,
} from '../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

const normalizeMinisterioTipo = (tipo: ResponseLoginMinisterioDto['tipo']): MinisterioTipoEnum => {
  const rawTipo = tipo?.toString() ?? '';
  const viaKey = (MinisterioTipoEnum as Record<string, MinisterioTipoEnum>)[rawTipo];

  if (viaKey) {
    return viaKey;
  }

  return (Object.values(MinisterioTipoEnum) as string[]).includes(rawTipo)
    ? (rawTipo as MinisterioTipoEnum)
    : MinisterioTipoEnum.Padrao;
};

export type DrawerItemData = {
  logo?: { type: 'logo'; value: string } | { type: 'icon'; value: CustomIconProps };
  title: string;
  subtitle?: string;
  disabled?: boolean;
  items?: DrawerItemData[];
  type?: 'RunMethod' | 'GoToRoute';
  onPress?: { type: 'RunMethod'; method: () => void } | { type: 'GoToRoute'; routeName: string };
};

const sortDrawerItemsByTitle = (items: DrawerItemData[]) =>
  [...items].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));

// Menu pessoal - disponível para todos
const BASE_MENU: DrawerItemData[] = [
  {
    logo: { type: 'icon', value: { name: 'home', library: 'Octicons', size: 14 } },
    title: 'Inicio',
    onPress: { type: 'GoToRoute', routeName: '/inicio' },
  },
  {
    title: 'Minhas Indisponibilidades',
    logo: {
      type: 'icon',
      value: { name: 'calendar-times', library: 'FontAwesome6', size: 14 },
    },
    onPress: { type: 'GoToRoute', routeName: '/pessoal/indisponibilidade' },
  },
  {
    title: 'Minhas Escalas',
    logo: {
      type: 'icon',
      value: { name: 'calendar-today', library: 'MaterialCommunityIcons', size: 17 },
    },
    onPress: { type: 'GoToRoute', routeName: '/pessoal/escalas' },
  },
];

// Menu da Igreja - somente ADMIN (owner)
const getIgrejaMenu = (): DrawerItemData[] => [
  {
    logo: {
      type: 'icon',
      value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 17 },
    },
    title: 'Eventos',
    onPress: { type: 'GoToRoute', routeName: '/admin/eventos' },
  },
  {
    logo: { type: 'icon', value: { name: 'grid', library: 'Feather', size: 14 } },
    title: 'Ministérios',
    onPress: { type: 'GoToRoute', routeName: '/admin/ministerios' },
  },
  {
    logo: { type: 'icon', value: { name: 'people', library: 'Octicons', size: 14 } },
    title: 'Voluntários',
    onPress: { type: 'GoToRoute', routeName: '/admin/voluntarios' },
  },
  {
    logo: {
      type: 'icon',
      value: { name: 'account-clock', library: 'MaterialCommunityIcons', size: 17 },
    },
    title: 'Solicitações e Convites',
    onPress: { type: 'GoToRoute', routeName: '/admin/solicitacoes' },
  },
  {
    logo: { type: 'icon', value: { name: 'cog', library: 'MaterialCommunityIcons', size: 17 } },
    title: 'Configurações',
    onPress: { type: 'GoToRoute', routeName: '/configuracoes' },
  },
];

// Menus básicos do ministério (apenas Agenda e Escalas) - para voluntários comuns
const getMinisterioBasicItems = (ministerio: ResponseLoginMinisterioDto): DrawerItemData[] => {
  const ministerioId = ministerio.id;
  const ministerioTipo = normalizeMinisterioTipo(ministerio.tipo);
  const routeParams = `?ministerioId=${ministerioId}`;
  const items: DrawerItemData[] = [
    {
      title: 'Agenda',
      logo: {
        type: 'icon',
        value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 17 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/agenda${routeParams}` },
    },
    {
      title: 'Escalas',
      logo: {
        type: 'icon',
        value: { name: 'calendar-account', library: 'MaterialCommunityIcons', size: 17 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/escalas${routeParams}` },
    },
  ];

  if (ministerioTipo === MinisterioTipoEnum.Louvor) {
    items.push({
      title: 'Repertório',
      logo: {
        type: 'icon',
        value: {
          name: 'queue-music',
          library: 'MaterialIcons',
          size: 17,
        },
      },
      onPress: {
        type: 'GoToRoute',
        routeName: `/ministerios/louvor/repertorio${routeParams}`,
      },
    });
  }

  return sortDrawerItemsByTitle(items);
};

const hasMinisterioPermission = (
  ministerio: ResponseLoginMinisterioDto,
  recurso: RecursoPermissaoEnum,
  permissao: TipoPermissaoEnum,
) => {
  return (ministerio.permissoes ?? []).some(
    (item) => item.recurso === recurso && item.permissoes?.includes(permissao),
  );
};

// Menus completos do ministério - para líderes e admin
const getMinisterioFullItems = (ministerio: ResponseLoginMinisterioDto): DrawerItemData[] => {
  const ministerioTipo = normalizeMinisterioTipo(ministerio.tipo);
  const routeParams = `?ministerioId=${ministerio.id}`;

  const baseItems = getMinisterioBasicItems(ministerio);

  const commonItems: DrawerItemData[] = [
    {
      title: 'Substituições',
      logo: {
        type: 'icon',
        value: { name: 'swap-horiz', library: 'MaterialIcons', size: 18 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/escalas/substituicoes${routeParams}` },
    },
    {
      title: 'Acessos',
      logo: {
        type: 'icon',
        value: { name: 'shield-account-outline', library: 'MaterialCommunityIcons', size: 17 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/acessos${routeParams}` },
    },
    {
      title: 'Indisponibilidades',
      logo: {
        type: 'icon',
        value: { name: 'calendar-times', library: 'FontAwesome6', size: 14 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/indisponibilidades${routeParams}` },
    },
    {
      title: 'Integrantes',
      logo: { type: 'icon', value: { name: 'people', library: 'Octicons', size: 14 } },
      onPress: {
        type: 'GoToRoute',
        routeName: `/ministerios/integrantes${routeParams}`,
      },
    },
    {
      title: 'Funções',
      logo: {
        type: 'icon',
        value: { library: 'FontAwesome6', name: 'person-rays', size: 14 },
      },
      onPress: { type: 'GoToRoute', routeName: `/ministerios/funcoes${routeParams}` },
    },
  ];

  const templatesItem = {
    title: 'Templates de Equipe',
    logo: {
      type: 'icon' as const,
      value: {
        name: 'file-document-outline',
        library: 'MaterialCommunityIcons' as const,
        size: 16,
      },
    },
    onPress: {
      type: 'GoToRoute' as const,
      routeName: `/ministerios/templates_equipe${routeParams}`,
    },
  };

  return sortDrawerItemsByTitle([...baseItems, ...commonItems, templatesItem]);
};

// Monta o menu de um ministério baseado na hierarquia do usuário
const getMenuForMinisterio = (
  ministerio: ResponseLoginMinisterioDto,
  isAdmin: boolean,
  isVoluntarioRole: boolean,
): DrawerItemData[] => {
  // Comparação robusta da hierarquia
  const hierarquia = ministerio.hierarquia?.toString();
  const isLider = hierarquia === VoluntarioHierarquiaEnum.Lider || hierarquia === '1';
  const isAuxiliar = hierarquia === VoluntarioHierarquiaEnum.Auxiliar || hierarquia === '2';

  // Admin ou líder do ministério: todos os menus
  const showFullMenu = isAdmin || isLider;

  let items = showFullMenu
    ? getMinisterioFullItems(ministerio)
    : getMinisterioBasicItems(ministerio);

  if (isAuxiliar && !isAdmin) {
    const routeParams = `?ministerioId=${ministerio.id}`;
    const ministerioTipo = normalizeMinisterioTipo(ministerio.tipo);
    const filteredItems: DrawerItemData[] = [];

    if (
      hasMinisterioPermission(
        ministerio,
        RecursoPermissaoEnum.AgendaEventos,
        TipoPermissaoEnum.Visualizar,
      )
    ) {
      filteredItems.push({
        title: 'Agenda',
        logo: {
          type: 'icon',
          value: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 17 },
        },
        onPress: { type: 'GoToRoute', routeName: `/ministerios/agenda${routeParams}` },
      });
    }

    if (
      hasMinisterioPermission(
        ministerio,
        RecursoPermissaoEnum.Escalas,
        TipoPermissaoEnum.Visualizar,
      )
    ) {
      filteredItems.push({
        title: 'Escalas',
        logo: {
          type: 'icon',
          value: { name: 'calendar-account', library: 'MaterialCommunityIcons', size: 17 },
        },
        onPress: { type: 'GoToRoute', routeName: `/ministerios/escalas${routeParams}` },
      });
    }

    if (
      hasMinisterioPermission(
        ministerio,
        RecursoPermissaoEnum.Integrantes,
        TipoPermissaoEnum.Visualizar,
      )
    ) {
      filteredItems.push({
        title: 'Integrantes',
        logo: { type: 'icon', value: { name: 'people', library: 'Octicons', size: 14 } },
        onPress: {
          type: 'GoToRoute',
          routeName: `/ministerios/integrantes${routeParams}`,
        },
      });
    }

    if (
      hasMinisterioPermission(
        ministerio,
        RecursoPermissaoEnum.FuncoesTemplates,
        TipoPermissaoEnum.Visualizar,
      )
    ) {
      filteredItems.push({
        title: 'Funções',
        logo: {
          type: 'icon',
          value: { library: 'FontAwesome6', name: 'person-rays', size: 14 },
        },
        onPress: { type: 'GoToRoute', routeName: `/ministerios/funcoes${routeParams}` },
      });
      filteredItems.push({
        title: 'Templates de Equipe',
        logo: {
          type: 'icon',
          value: {
            name: 'file-document-outline',
            library: 'MaterialCommunityIcons',
            size: 16,
          },
        },
        onPress: {
          type: 'GoToRoute',
          routeName: `/ministerios/templates_equipe${routeParams}`,
        },
      });
    }

    if (ministerioTipo === MinisterioTipoEnum.Louvor) {
      filteredItems.push({
        title: 'Repertório',
        logo: {
          type: 'icon',
          value: {
            name: 'queue-music',
            library: 'MaterialIcons',
            size: 17,
          },
        },
        onPress: {
          type: 'GoToRoute',
          routeName: `/ministerios/louvor/repertorio${routeParams}`,
        },
      });
    }

    items = sortDrawerItemsByTitle(filteredItems);
  }

  if (isVoluntarioRole && !isAuxiliar && !showFullMenu) {
    items = items.filter((item) => item.title !== 'Escalas');
  }

  const ministerioTipo = normalizeMinisterioTipo(ministerio.tipo);
  const defaultIcon =
    ministerioTipo === MinisterioTipoEnum.Louvor
      ? { name: 'music', library: 'Feather' as const, size: 14 }
      : { name: 'grid', library: 'Feather' as const, size: 14 };

  return [
    {
      logo: ministerio.logoThumbUrl
        ? { type: 'logo', value: ministerio.logoThumbUrl }
        : { type: 'icon', value: defaultIcon },
      title: ministerio.nome ?? 'Ministério',
      subtitle:
        String(ministerio.hierarquia) === VoluntarioHierarquiaEnum.Lider
          ? VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Lider]
          : isAdmin
            ? MinisterioTipoLabel[ministerioTipo]
            : ministerio.hierarquia
              ? (VoluntarioHierarquiaEnumLabel[ministerio.hierarquia as VoluntarioHierarquiaEnum] ??
                '')
              : '',
      items,
    },
  ];
};

export function getMenuForIgreja(
  igreja: ResponseLoginIgrejaDto | null,
): { section: string; items: DrawerItemData[] }[] {
  if (!igreja) {
    return [{ section: 'Pessoal', items: BASE_MENU }];
  }

  const sections: { section: string; items: DrawerItemData[] }[] = [];
  // Comparação robusta do role (case insensitive)
  const roleUpper = igreja.role?.toString().toUpperCase();
  const isAdmin = roleUpper === IgrejaVoluntarioRoleEnum.ADMIN || roleUpper === 'OWNER';
  const isVoluntarioRole = roleUpper === IgrejaVoluntarioRoleEnum.VOLUNTARIO;

  // Seção Pessoal - sempre disponível
  sections.push({ section: 'Pessoal', items: BASE_MENU });

  // Seção Igreja - somente para ADMIN (owner)
  if (isAdmin) {
    sections.push({ section: 'Igreja', items: getIgrejaMenu() });
  }

  // Seção Ministérios
  const ministerios = igreja.ministerios || [];

  if (ministerios.length >= 1) {
    const ministeriosMenus = ministerios
      .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR', { sensitivity: 'base' }))
      .map((ministerio) => getMenuForMinisterio(ministerio, isAdmin, isVoluntarioRole));
    sections.push({ section: 'Ministérios', items: ministeriosMenus.flat() });
  }

  return sections;
}

// Mantém compatibilidade com código antigo (deprecated)
export function getMenuForUser(user: {
  igrejas?: ResponseLoginIgrejaDto[];
}): { section: string; items: DrawerItemData[] }[] {
  const primeiraIgreja = user?.igrejas?.[0] || null;
  return getMenuForIgreja(primeiraIgreja);
}
