import { StyleSheet } from 'react-native';
import FancyText from '../FancyText';

export default function FancyErrorText(props: { message: string }) {
  return (
    props.message && (
      <FancyText size='extraSmall' type='medium' color='red'>
        {props.message}
      </FancyText>
    )
  );
}

const styles = StyleSheet.create({
  text: {},
});
