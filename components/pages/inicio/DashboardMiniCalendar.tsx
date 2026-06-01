import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FancyCalendar, { MarkedDate } from '../../calendar/FancyCalendar';
import { DashboardEscalaItemDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { ThemePalette } from '../../../constants/colors';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyModalDialog from '../../modal/FancyModalDialog';
import FancyText from '../../FancyText';
import FancyChips from '../../FancyChips';
import DefaultIcons from '../../FancyIcons';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

type DashboardMiniCalendarProps = {
  escalas?: DashboardEscalaItemDto[];
};

export default function DashboardMiniCalendar({ escalas }: DashboardMiniCalendarProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const escalasUnicas = useMemo(() => {
    const base = escalas ?? [];
    const seen = new Set<string>();

    return base.filter((escala) => {
      const signature = [
        escala.eventoData,
        escala.eventoNome?.trim().toLowerCase(),
        escala.funcaoNome?.trim().toLowerCase(),
        escala.ministerioNome?.trim().toLowerCase(),
        escala.isConfirmado ? '1' : '0',
      ].join('|');

      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
  }, [escalas]);

  const markedDates: MarkedDate[] = useMemo(() => {
    if (escalasUnicas.length === 0) return [];

    return escalasUnicas.map((escala) => ({
      date: parseISO(escala.eventoData),
      color: escala.isConfirmado ? palette.confirm : palette.warning,
    }));
  }, [escalasUnicas, palette.confirm, palette.warning]);

  const escalasDaDataSelecionada = useMemo(() => {
    if (!selectedDate) return [];

    return escalasUnicas
      .filter((escala) => {
        const dataEscala = parseISO(escala.eventoData);
        if (Number.isNaN(dataEscala.getTime())) return false;
        return isSameDay(dataEscala, selectedDate);
      })
      .sort((a, b) => parseISO(a.eventoData).getTime() - parseISO(b.eventoData).getTime());
  }, [escalasUnicas, selectedDate]);

  const today = useMemo(() => new Date(), []);

  const handleDatePress = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsDetailsModalVisible(true);
  }, []);

  return (
    <>
      <FancyCalendar
        markedDates={markedDates}
        markedDatesType='bottomPoint'
        containerStyle={styles.calendar}
        border
        minimumDate={new Date(today.getFullYear(), today.getMonth(), 1)}
        onChangeSelectedDate={handleDatePress}
        dayModeTopPadding={10}
      />

      {isDetailsModalVisible && (
        <FancyModalDialog
          title='Detalhes do dia'
          modalProps={{ visible: isDetailsModalVisible }}
          onButton1Press={() => setIsDetailsModalVisible(false)}
          button1={{ visible: false }}
          button2={{ visible: false }}
          buttonContainerComponenet={<></>}
          showCloseButton
          containerStyle={styles.modalContainer}
          centerContainerStyle={styles.modalContent}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryDateBadge}>
              <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
                {selectedDate ? format(selectedDate, 'MMM', { locale: ptBR }).toUpperCase() : '--'}
              </FancyText>
              <FancyText size='medium' type='bold' color={palette.fonts.dark}>
                {selectedDate ? format(selectedDate, 'dd', { locale: ptBR }) : '--'}
              </FancyText>
            </View>
            <View style={styles.summaryDateRow}>
              <FancyText size='small' type='semiBold' color={palette.fonts.dark}>
                {selectedDate
                  ? format(selectedDate, 'EEEE', { locale: ptBR })
                  : 'Data não selecionada'}
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                {selectedDate ? format(selectedDate, "'Dia' dd 'de' MMMM", { locale: ptBR }) : ''}
              </FancyText>
            </View>
            <FancyChips
              label={`${escalasDaDataSelecionada.length} escala(s)`}
              size='small'
              color={palette.primary}
              backgroundColor={ColorUtils.withAlpha(palette.primary, 0.12)}
              style={styles.summaryChip}
            />
          </View>

          {escalasDaDataSelecionada.length > 0 ? (
            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {escalasDaDataSelecionada.map((escala, index) => (
                <View key={`${escala.id}-${escala.eventoData}-${index}`} style={styles.eventCard}>
                  <View style={styles.eventCardHeader}>
                    <FancyText
                      size='small'
                      type='bold'
                      color={palette.fonts.dark}
                      numberOfLines={1}
                      style={{ flex: 1 }}
                    >
                      {escala.eventoNome}
                    </FancyText>
                    <FancyChips
                      label={escala.isConfirmado ? 'Confirmada' : 'Pendente'}
                      size='small'
                      color={escala.isConfirmado ? palette.confirm : palette.warning}
                      backgroundColor={
                        escala.isConfirmado
                          ? ColorUtils.withAlpha(palette.confirm, 0.14)
                          : ColorUtils.withAlpha(palette.warning, 0.14)
                      }
                    />
                  </View>

                  <View style={styles.infoRow}>
                    <DefaultIcons.Custom
                      library='MaterialCommunityIcons'
                      name='clock-time-four-outline'
                      size={14}
                      color={palette.primary}
                    />
                    <FancyText size='extraSmall' type='semiBold' color={palette.fonts.dark}>
                      {format(parseISO(escala.eventoData), 'HH:mm', { locale: ptBR })}
                    </FancyText>
                  </View>

                  <View style={styles.infoRow}>
                    <DefaultIcons.Custom
                      library='MaterialCommunityIcons'
                      name='briefcase-outline'
                      size={14}
                      color={palette.primary}
                    />
                    <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                      {escala.funcaoNome}
                    </FancyText>
                  </View>

                  <View style={styles.infoRow}>
                    <DefaultIcons.Custom
                      library='MaterialCommunityIcons'
                      name='account-group-outline'
                      size={14}
                      color={palette.primary}
                    />
                    <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                      {escala.ministerioNome}
                    </FancyText>
                  </View>

                  {escala.eventoLocal ? (
                    <View style={styles.infoRow}>
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name='map-marker-outline'
                        size={14}
                        color={palette.primary}
                      />
                      <FancyText
                        size='extraSmall'
                        type='medium'
                        color={palette.fonts.inactive}
                        numberOfLines={1}
                      >
                        {escala.eventoLocal}
                      </FancyText>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='calendar-remove-outline'
                size={20}
                color={palette.icons.inactive}
              />
              <FancyText size='small' type='medium' color={palette.fonts.inactive}>
                Nenhuma escala para esta data.
              </FancyText>
            </View>
          )}
        </FancyModalDialog>
      )}
    </>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    calendar: {
      minHeight: 260,
      borderRadius: 16,
      overflow: 'hidden',
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 0,
      backgroundColor: palette.backgroundColor4,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
    },
    modalContainer: {
      gap: 12,
    },
    modalContent: {
      gap: 10,
      maxHeight: 400,
    },
    summaryCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    summaryDateBadge: {
      width: 44,
      height: 44,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.33),
      backgroundColor: palette.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    },
    summaryDateRow: {
      flex: 1,
      justifyContent: 'center',
      gap: 1,
    },
    summaryChip: {
      alignSelf: 'center',
    },
    modalList: {
      maxHeight: 290,
    },
    modalListContent: {
      gap: 9,
      paddingBottom: 0,
    },
    eventCard: {
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.4),
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 9,
      gap: 7,
      backgroundColor: palette.backgroundColor3,
    },
    eventCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      minHeight: 16,
    },
    emptyCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.3),
      backgroundColor: palette.backgroundColor2,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  });
}
