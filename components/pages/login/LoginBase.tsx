import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pallete } from '../../../constants/colors';

export default function LoginBase({
  children,
  containerStyle,
}: {
  children: React.ReactNode | React.ReactNode[];
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <>
      <LinearGradient colors={['#3B82F6', '#234C90']} style={styles.gradient} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} />
      {children}
    </>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    borderWidth: DESIGN_MODE,
    borderColor: 'gold',
    gap: 25,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [{ skewY: '140deg' }, { translateY: -240 }],
    borderRadius: 10,
  },
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    borderWidth: DESIGN_MODE,
    borderColor: 'gold',
    paddingHorizontal: 40,
    gap: 25,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    flex: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    justifyContent: 'center',
  },
  centerContainer: { flex: 3, borderWidth: DESIGN_MODE, borderColor: 'chocolate' },
  fieldsContainer: {
    borderWidth: DESIGN_MODE,
    borderRadius: 15,
    borderColor: 'firebrick',
    // flex: 1,
    padding: 25,
    gap: 15,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
  bottomSpacer: { flex: 1, borderWidth: DESIGN_MODE, borderColor: 'deepskyblue' },
});
