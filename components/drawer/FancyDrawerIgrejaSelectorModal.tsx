import { StyleSheet, View, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import FancyImage from '../images/FancyImage';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import FancyPopup from '../popup/FancyPopup';
import { ResponseLoginIgrejaDto } from '../../domain/dtos/login/login.response';
import { Pallete } from '../../constants/colors';
import { useSairDaIgreja } from '../../hooks/useSairDaIgreja';
import { FancyAlert } from '../modal/FancyAlert';

interface FancyDrawerIgrejaSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  igrejas: ResponseLoginIgrejaDto[];
  igrejaAtiva: ResponseLoginIgrejaDto | null | undefined;
  onSelectIgreja: (igreja: ResponseLoginIgrejaDto) => void;
}

export default function FancyDrawerIgrejaSelectorModal({
  visible,
  onClose,
  igrejas,
  igrejaAtiva,
  onSelectIgreja,
}: FancyDrawerIgrejaSelectorModalProps) {
  const { sairDaIgreja, validateRole, isPending } = useSairDaIgreja();

  const handleAdicionarIgreja = () => {
    onClose();
    router.push('/(app)/join-church');
  };

  const handleMinhasSolicitacoes = () => {
    onClose();
    router.push('/(app)/join-church/requests');
  };

  const handleSairDaIgreja = (igreja: ResponseLoginIgrejaDto) => {
    if (!validateRole(igreja.role)) return;
    FancyAlert.alert(
      'Sair da igreja',
      `Tem certeza que deseja sair de "${igreja.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => sairDaIgreja({ igrejaId: igreja.id, role: igreja.role }),
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
      <MenuProvider skipInstanceCheck>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose}>
          {/* Modal Content */}
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <FancyText size='extraSmall' type='semiBold' color={Pallete.fonts.inactive}>
                SUAS IGREJAS
              </FancyText>
            </View>

            {/* Lista de Igrejas */}
            <ScrollView style={styles.modalScrollView}>
              {igrejas.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FancyText type='normal' size='medium' style={styles.emptyText}>
                    Nenhuma igreja cadastrada
                  </FancyText>
                </View>
              ) : (
                <View style={{ marginVertical: 5 }}>
                  {igrejas.map((igreja, index) => {
                    const isAtiva = igreja.id === igrejaAtiva?.id;
                    const isLast = index === igrejas.length - 1;

                    return (
                      <View key={igreja.id} style={[styles.igrejaItem, !isLast && styles.igrejaItemBorder]}>
                        <TouchableOpacity
                          onPress={() => onSelectIgreja(igreja)}
                          activeOpacity={0.7}
                          style={styles.igrejaItemMain}
                        >
                          {/* Logo */}
                          {igreja.logoThumbUrl || igreja.logoUrl ? (
                            <FancyImage
                              source={{
                                uri: (igreja.logoThumbUrl || igreja.logoUrl) as string,
                              }}
                              size={28}
                              style={styles.igrejaLogo}
                            />
                          ) : (
                            <View style={styles.igrejaLogoPlaceholder}>
                              <DefaultIcons.Custom
                                library='MaterialCommunityIcons'
                                name='church'
                                size={19}
                                color={Pallete.icons.inactive}
                                style={{ marginBottom: 2 }}
                              />
                            </View>
                          )}

                          {/* Nome */}
                          <FancyText
                            size={'small'}
                            type='semiBold'
                            style={styles.igrejaNomeText}
                            numberOfLines={1}
                          >
                            {igreja.nome}
                          </FancyText>
                        </TouchableOpacity>

                        <View style={styles.igrejaItemActions}>
                          {isAtiva && (
                            <DefaultIcons.Custom
                              library='MaterialCommunityIcons'
                              name='check-bold'
                              size={16}
                              color={Pallete.icons.inactive}
                            />
                          )}
                        <FancyPopup
                          disabled={isPending}
                          items={[
                            {
                              label: 'Sair da igreja',
                              onPress: () => handleSairDaIgreja(igreja),
                              icon: { library: 'Feather', name: 'log-out', size: 16, color: Pallete.fonts.dark },
                            },
                          ]}
                          triggerComponent={
                            <View style={styles.menuTrigger}>
                              <Feather name='more-vertical' size={18} color={Pallete.icons.inactive} />
                            </View>
                          }
                        />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Divisor */}
              <View style={styles.divisor} />

              {/* Entrar em uma nova igreja */}
              <TouchableOpacity
                onPress={handleAdicionarIgreja}
                activeOpacity={0.7}
                style={styles.actionItem}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='login'
                  size={16}
                  color={Pallete.icons.inactive}
                />
                <FancyText size='small' type='medium'>
                  Entrar em uma nova igreja
                </FancyText>
              </TouchableOpacity>

              {/* Minhas Solicitações */}
              <TouchableOpacity
                onPress={handleMinhasSolicitacoes}
                activeOpacity={0.7}
                style={styles.actionItemLast}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='history'
                  size={16}
                  color={Pallete.icons.inactive}
                />
                <FancyText size='small' type='medium'>
                  Minhas solicitações
                </FancyText>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </MenuProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // MODAL
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalScrollView: {
    maxHeight: 400,
  },

  // EMPTY STATE
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontWeight: '400',
    color: '#9CA3AF',
  },

  // ITEM DA LISTA
  igrejaItem: {
    height: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  igrejaItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  igrejaItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  igrejaItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  igrejaLogo: {
    ...Pallete.shadows[200],
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 0.2,
    borderColor: Pallete.border,
    marginRight: 12,
  },
  igrejaLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  igrejaNomeText: {
    flex: 1,
    opacity: 0.8,
  },
  menuTrigger: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
  // DIVISOR
  divisor: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // ADICIONAR IGREJA
  adicionarItem: {
    height: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionItem: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionItemLast: {
    height: 40,
    paddingHorizontal: 16,
    paddingTop: 3,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adicionarText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#2D7CFF',
  },
});
