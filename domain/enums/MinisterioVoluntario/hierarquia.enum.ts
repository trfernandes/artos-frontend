import { DropDownItemProps } from '../../../components/fields/FancyDropDownItem';

export enum VoluntarioHierarquiaEnum {
  Voluntario = '0',
  Lider = '1',
  Auxiliar = '2',
}

export const VoluntarioHierarquiaEnumLabel: Record<VoluntarioHierarquiaEnum, string> = {
  [VoluntarioHierarquiaEnum.Voluntario]: 'Voluntário',
  [VoluntarioHierarquiaEnum.Lider]: 'Líder',
  [VoluntarioHierarquiaEnum.Auxiliar]: 'Auxiliar',
};

export const VoluntarioHierarquiaEnumMap: Record<string, VoluntarioHierarquiaEnum> = {
  '0': VoluntarioHierarquiaEnum.Voluntario,
  '1': VoluntarioHierarquiaEnum.Lider,
  '2': VoluntarioHierarquiaEnum.Auxiliar,
};

export const VoluntarioHierarquiaEnumList: DropDownItemProps<VoluntarioHierarquiaEnum>[] = [
  {
    title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Voluntario],
    value: VoluntarioHierarquiaEnum.Voluntario,
  },
  {
    title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Lider],
    value: VoluntarioHierarquiaEnum.Lider,
  },
  {
    title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Auxiliar],
    value: VoluntarioHierarquiaEnum.Auxiliar,
  },
];

export const VoluntarioHierarquiaLideresEnumList: DropDownItemProps<VoluntarioHierarquiaEnum>[] = [
  {
    title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Lider],
    value: VoluntarioHierarquiaEnum.Lider,
  },
  {
    title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Auxiliar],
    value: VoluntarioHierarquiaEnum.Auxiliar,
  },
];
