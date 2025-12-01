import FancyCalendar, { FancyCalendarProps } from '../calendar/FancyCalendar';

export type FancyDatePickerProps = {
  calendarProps?: FancyCalendarProps;
};

export default function FancyDatePicker({ calendarProps }: FancyDatePickerProps) {
  return <FancyCalendar {...calendarProps} />;
}
