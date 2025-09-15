import { DropDownItemProps } from '../components/fields/FancyDropDownItem';

export const EnumUtils = {
  getDropDownItems<T extends number | string>(enumObject: any, labelRecord: Record<T, string>): DropDownItemProps<T>[] {
    return Object.values(enumObject)
      .filter(value => typeof value === 'number' || typeof value === 'string')
      .map(value => {
        const key = value as T;
        return {
          title: labelRecord[key],
          value: key,
        };
      });
  },
};
