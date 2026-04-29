import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import FancyImage from '../images/FancyImage';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import FancyPopup from '../popup/FancyPopup';
import { ResponseLoginIgrejaDto } from '../../domain/dtos/login/login.response';
import { ThemePalette } from '../../constants/colors';
import { useSairDaIgreja } from '../../hooks/useSairDaIgreja';
import { FancyAlert } from '../modal/FancyAlert';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import FancyBottomSheetModal from '../modal/FancyBottomSheetModal';

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
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
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
    <FancyBottomSheetModal visible={visible} onClose={onClose} title='Selecionar igreja' avoidKeyboard={false}>
      <MenuProvider skipInstanceCheck>
        <View style={styles.content}>
          <FancyText size='extraSmall' type='semiBold' color={Pallete.fonts.inactive}>
            SUAS IGREJAS
          </FancyText>

          {igrejas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FancyText type='normal' size='medium' style={styles.emptyText}>
                Nenhuma igreja cadastrada
              </FancyText>
            </View>
          ) : (
            <View style={styles.igrejasList}>
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

                      <View style={styles.igrejaTextColumn}>
                        <FancyText
                          size='small'
                          type='semiBold'
                          style={styles.igrejaNomeText}
                          numberOfLines={1}
                        >
                          {igreja.nome}
                        </FancyText>
                        {isAtiva && (
                          <FancyText size='extraSmall' type='medium' color={Pallete.primary} numberOfLines={1}>
                            Igreja ativa
                          </FancyText>
                        )}
                      </View>
                    </TouchableOpacity>

                    <View style={styles.igrejaItemActions}>
                      {isAtiva && (
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name='check-circle'
                          size={18}
                          color={Pallete.primary}
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

          <View style={styles.actionsBlock}>
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

            <TouchableOpacity
              onPress={handleMinhasSolicitacoes}
              activeOpacity={0.7}
              style={styles.actionItem}
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
          </View>
        </View>
      </MenuProvider>
    </FancyBottomSheetModal>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
  content: {
    gap: 12,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontWeight: '400',
    color: Pallete.fonts.inactive,
  },
  igrejasList: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Pallete.borderCard,
    backgroundColor: Pallete.backgroundColor4,
  },
  igrejaItem: {
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  igrejaItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  igrejaItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  igrejaItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Pallete.borderCard,
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
    backgroundColor: Pallete.backgroundColor2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  igrejaTextColumn: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  igrejaNomeText: {
    flex: 1,
    opacity: 0.8,
  },
  menuTrigger: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
  actionsBlock: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Pallete.borderCard,
    backgroundColor: Pallete.backgroundColor,
  },
  actionItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  });
}
