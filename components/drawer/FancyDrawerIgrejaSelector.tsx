import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FancyImage from '../images/FancyImage';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { useAuth } from '../../contexts/AuthContext';
import { ResponseLoginIgrejaDto } from '../../domain/dtos/login/login.response';
import FancyDrawerIgrejaSelectorModal from './FancyDrawerIgrejaSelectorModal';
import { Pallete } from '../../constants/colors';

export default function FancyDrawerIgrejaSelector() {
  const { user, igrejaAtiva, setIgrejaAtiva } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  // Filtra igrejas válidas (apenas remove igrejas sem id ou nome)
  const igrejasReais = (user?.igrejas || []).filter((igreja) => igreja.id && igreja.nome);

  const handleTrocarIgreja = async (igreja: ResponseLoginIgrejaDto) => {
    if (igreja.id !== igrejaAtiva?.id) {
      await setIgrejaAtiva(igreja);
    }
    setModalVisible(false);
  };

  return (
    <>
      {/* CARD COLAPSADO */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        style={styles.cardContainer}
      >
        {/* Logo - QUADRADO ARREDONDADO */}
        {igrejaAtiva?.logoThumbUrl || igrejaAtiva?.logoUrl ? (
          <FancyImage
            source={{
              uri: (igrejaAtiva.logoThumbUrl || igrejaAtiva.logoUrl) as string,
            }}
            size={28}
            style={styles.logo}
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='church'
              color='#FFFFFF'
              size={14}
              style={{ marginBottom: 1 }}
            />
          </View>
        )}

        {/* Nome */}
        <FancyText style={styles.nomeText} size='medium' type='semiBold' numberOfLines={1}>
          {igrejaAtiva?.nome || 'Selecione uma igreja'}
        </FancyText>

        {/* Chevron */}
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='chevron-down'
          size={18}
          color='rgba(255, 255, 255, 0.6)'
        />
      </TouchableOpacity>

      {/* MODAL */}
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

const styles = StyleSheet.create({
  // CARD COLAPSADO
  cardContainer: {
    marginRight: 10,
    marginBottom: 8,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 0.2,
    borderColor: Pallete.border,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#2D7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nomeText: {
    flex: 1,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
