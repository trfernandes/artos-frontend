import { View } from 'react-native';
import React from 'react';
import { Pallete } from '../../../../../constants/colors';
import DefaultIcons from '../../../../FancyIcons';
import FancyPopup from '../../../../popup/FancyPopup';

export default function EscaladoMenuPopup() {
  return (
    <FancyPopup
      showSeparator
      items={[
        {
          label: 'Detalhes do Voluntário',
          icon: {
            library: 'MaterialIcons',
            name: 'person',
            size: 18,
            color: Pallete.icons.dark,
          },
        },
        {
          label: 'Detalhes da Função',
          icon: {
            library: 'FontAwesome6',
            name: 'person-rays',
            size: 14,
            color: Pallete.icons.dark,
          },
        },
      ]}
      triggerComponent={
        <View
          style={{
            backgroundColor: Pallete.primary,
            borderRadius: 100,
            width: 22,
            height: 22,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <DefaultIcons.Custom library="Entypo" name="dots-three-vertical" size={11} color={Pallete.icons.light} />
        </View>
      }
    />
  );
}
