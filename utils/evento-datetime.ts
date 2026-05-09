import { combineAppDateWithTime, DateLike } from './date_utils';

export function combineOccurrenceWithEventTime(
  dataOcorrencia: DateLike,
  eventTimeSource: DateLike,
  dayOffset = 0,
): Date {
  return combineAppDateWithTime(dataOcorrencia, eventTimeSource, dayOffset);
}

export function getOccurrenceDateTimeIso(
  dataOcorrencia: DateLike,
  eventTimeSource: DateLike,
): string {
  return combineOccurrenceWithEventTime(dataOcorrencia, eventTimeSource).toISOString();
}
