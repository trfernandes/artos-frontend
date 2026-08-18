import { DropDownItemProps } from '../../../components/fields/FancyDropDownItem';
import { ThemePalette } from '../../../constants/colors';

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

export function getVoluntarioHierarquiaColorMap(
  palette: Pick<ThemePalette, 'secondary' | 'warning' | 'terciary'>,
): Record<VoluntarioHierarquiaEnum, string> {
  return {
    [VoluntarioHierarquiaEnum.Lider]: palette.secondary,
    [VoluntarioHierarquiaEnum.Auxiliar]: palette.warning,
    [VoluntarioHierarquiaEnum.Voluntario]: palette.terciary,
  };
}
