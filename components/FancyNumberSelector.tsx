import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import DefaultIcons from './FancyIcons';
import { DefaultIconsNames } from '../constants/icons';
import FancyTextInput from './fields/FancyTextInput';
import { Pallete } from '../constants/colors';
import { useState } from 'react';
import { MEDIUM_SIZE_FONT, SEMI_BOLD_FONT } from '../constants/font';

export type FancyNumberSelectorProps = { containerStyle?: StyleProp<ViewStyle> };

export default function FancyNumberSelector({ containerStyle }: FancyNumberSelectorProps) {
  const [value, setValue] = useState(1);

  const add = () => setValue(Math.min(9999, value + 1));
  const remove = () => setValue(Math.max(0, value - 1));

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.buttonsContainer}>
        <Pressable style={styles.button} onPress={remove}>
          <DefaultIcons.Custom
            library={DefaultIconsNames.minus.library}
            name={DefaultIconsNames.minus.name}
            size={16}
            color={'white'}
          />
        </Pressable>
      </View>
      <View style={styles.inputContainer}>
        <FancyTextInput
          readOnly
          inputContainerStyle={styles.input}
          style={{
            textAlign: 'center',
            flex: 1,
            backgroundColor: 'transparent',
            fontFamily: SEMI_BOLD_FONT,
            fontSize: MEDIUM_SIZE_FONT,
          }}
          value={value.toString()}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Pressable style={styles.button} onPress={add}>
          <DefaultIcons.Custom library={'FontAwesome'} name={'plus'} size={16} color={'white'} />
        </Pressable>
      </View>
    </View>
  );
}

const height = 45;

const styles = StyleSheet.create({
  container: {
    width: 145,
    height: height,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    gap: 5,
    paddingHorizontal: 4,
    borderColor: Pallete.terciary,
    backgroundColor: Pallete.terciary,
  },
  inputContainer: {
    flex: 1,

    borderColor: Pallete.border,
    height: '100%',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 0,
    borderRadius: 20,
    borderColor: Pallete.border,
    minHeight: '100%',
    height: '100%',
  },
  buttonsContainer: { borderWidth: 0, borderColor: 'black', height: '100%', width: 35 },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
