import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';

export default function FancyErrorText(props: { message: string }) {
  const Pallete = usePallete();
  return (
    props.message && (
      <FancyText size='extraSmall' type='medium' color={Pallete.error}>
        {props.message}
      </FancyText>
    )
  );
}
