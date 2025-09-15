import { StyleSheet } from 'react-native';
import FancyCalendar, { FancyCalendarProps } from '../calendar/FancyCalendar';

export type FancyDatePickerProps = {
  calendarProps?: FancyCalendarProps;
};

export default function FancyDatePicker({ calendarProps }: FancyDatePickerProps) {
  return <FancyCalendar {...calendarProps} />;
}

const styles = StyleSheet.create({});
