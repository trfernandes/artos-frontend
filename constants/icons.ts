import { IconLibrary } from '../components/FancyIcons';

export type Icon = {
  library: IconLibrary;
  name: string;
};

type IconName =
  | 'save'
  | 'delete'
  | 'edit'
  | 'cancel'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-top'
  | 'arrow-down'
  | 'info'
  | 'add'
  | 'minus'
  | 'open'
  | 'calendar-month'
  | 'calendar-day'
  | 'time'
  | 'list'
  | 'list-clear'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'options'
  | 'group'
  | 'sort'
  | 'refresh'
  | 'confirm'
  | 'menu';

export const DefaultIconsNames: Record<IconName, Icon> = {
  save: {
    library: 'Ionicons',
    name: 'save',
  },

  delete: {
    library: 'MaterialIcons',
    name: 'delete',
  },

  edit: {
    library: 'MaterialIcons',
    name: 'edit',
  },

  cancel: {
    library: 'Ionicons',
    name: 'close',
  },
  'arrow-left': {
    library: 'Feather',
    name: 'arrow-left',
  },
  'arrow-right': {
    library: 'Feather',
    name: 'arrow-right',
  },
  'arrow-top': {
    library: 'Feather',
    name: 'arrow-top',
  },
  'arrow-down': {
    library: 'Feather',
    name: 'arrow-down',
  },
  info: {
    library: 'Feather',
    name: 'info',
  },
  add: {
    library: 'Entypo',
    name: 'plus',
  },
  minus: {
    library: 'FontAwesome',
    name: 'minus',
  },
  open: {
    library: 'MaterialCommunityIcons',
    name: 'open-in-new',
  },
  'calendar-month': {
    library: 'MaterialCommunityIcons',
    name: 'calendar-month',
  },
  'calendar-day': {
    library: 'MaterialCommunityIcons',
    name: 'calendar',
  },
  time: {
    library: 'Feather',
    name: 'clock',
  },
  list: {
    library: 'Entypo',
    name: 'list',
  },
  'list-clear': {
    library: 'MaterialCommunityIcons',
    name: 'delete-sweep',
  },
  'chevron-left': {
    library: 'Entypo',
    name: 'chevron-left',
  },
  'chevron-right': {
    library: 'Entypo',
    name: 'chevron-right',
  },
  'chevron-down': {
    library: 'Entypo',
    name: 'chevron-down',
  },
  'chevron-up': {
    library: 'Entypo',
    name: 'chevron-up',
  },
  options: {
    library: 'Ionicons',
    name: 'options',
  },
  group: {
    library: 'MaterialCommunityIcons',
    name: 'account-group',
  },
  sort: {
    library: 'FontAwesome5',
    name: 'list-ol',
  },
  confirm: {
    library: 'FontAwesome6',
    name: 'check',
  },
  refresh: {
    library: 'Feather',
    name: 'refresh-ccw',
  },
  menu: { library: 'Feather', name: 'menu' },
};
