import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FancyImage from '../images/FancyImage';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { useAuth } from '../../contexts/AuthContext';
import { ResponseLoginIgrejaDto } from '../../domain/dtos/login/login.response';
import FancyDrawerIgrejaSelectorModal from './FancyDrawerIgrejaSelectorModal';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export default function FancyDrawerIgrejaSelector() {
  const styles = useThemedStyles(createStyles);
  const { user, igrejaAtiva, setIgrejaAtiva } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const igrejasReais = (user?.igrejas || []).filter((igreja) => igreja.id && igreja.nome);

  const handleTrocarIgreja = async (igreja: ResponseLoginIgrejaDto) => {
    if (igreja.id !== igrejaAtiva?.id) {
      await setIgrejaAtiva(igreja);
    }
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        style={styles.row}
        accessibilityRole='button'
        accessibilityLabel={`Igreja ativa: ${igrejaAtiva?.nome || 'Selecionar igreja'}`}
        accessibilityHint='Toque para trocar de igreja'
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {igrejaAtiva?.logoThumbUrl || igrejaAtiva?.logoUrl ? (
          <FancyImage
            source={{
              uri: (igrejaAtiva.logoThumbUrl || igrejaAtiva.logoUrl) as string,
            }}
            size={18}
            style={styles.logo}
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='church'
              color='#FFFFFF'
              size={10}
            />
          </View>
        )}

        <FancyText size='extraSmall' type='semiBold' color='rgba(255, 255, 255, 0.92)' numberOfLines={1} style={styles.nomeText}>
          {igrejaAtiva?.nome || 'Selecionar igreja'}
        </FancyText>

        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='chevron-down'
          size={15}
          color='rgba(255, 255, 255, 0.7)'
        />
      </TouchableOpacity>

      <FancyDrawerIgrejaSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        igrejas={igrejasReais}
        igrejaAtiva={igrejaAtiva}
        onSelectIgreja={handleTrocarIgreja}
      />
    </>
  );
}

function createStyles(_palette: ThemePalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      maxWidth: '100%',
      paddingVertical: 5,
      paddingLeft: 6,
      paddingRight: 8,
      borderRadius: 999,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    logo: {
      width: 16,
      height: 16,
      borderRadius: 9999,
      boxShadow: 'none',
    },
    logoPlaceholder: {
      width: 16,
      height: 16,
      borderRadius: 999,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nomeText: {
      color: 'rgba(255, 255, 255, 0.92)',
      flexShrink: 1,
    },
  });
}
