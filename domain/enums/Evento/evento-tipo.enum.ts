import { DropDownItemProps } from '../../../components/fields/FancyDropDownItem';

export enum EventoTipoEnum {
  Culto = 'Culto',
  Reuniao = 'Reuniao',
  Ensaio = 'Ensaio',
}

export const EventoTipoEnumLabel: Record<EventoTipoEnum, string> = {
  [EventoTipoEnum.Culto]: 'Culto',
  [EventoTipoEnum.Reuniao]: 'Reunião',
  [EventoTipoEnum.Ensaio]: 'Ensaio',
};

export const EventoTipoEnumList: DropDownItemProps<EventoTipoEnum>[] = [
  { title: EventoTipoEnumLabel[EventoTipoEnum.Culto], value: EventoTipoEnum.Culto },
  { title: EventoTipoEnumLabel[EventoTipoEnum.Reuniao], value: EventoTipoEnum.Reuniao },
  { title: EventoTipoEnumLabel[EventoTipoEnum.Ensaio], value: EventoTipoEnum.Ensaio },
];
