import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import FancyText from '../../../../FancyText';
import FancyCardIcon from '../../../../cards/Horizontal/FancyCardIcon';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { EscalaRepository } from '../../../../../domain/services/EscalaRepository';
import { EscalaParametrizacaoType } from '../../../../../domain/dtos/Escala/escala.response';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { format } from 'date-fns';
import { MinisterioVoluntariosRepository } from '../../../../../domain/services/MinisterioVoluntariosRepository';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyAvatarImage from '../../../../images/FancyImage';
import { AppImages } from '../../../../../assets/app_images';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import { getFirstAndLastName } from '../../../../../utils/text_utils';

function formatExpMinima(expMinima: string | undefined | null): string {
  if (!expMinima) return 'Qualquer';
  return EscalaTemplateExperienciaLabel[expMinima as EscalaTemplateExperienciaEnum] ?? expMinima;
}

export default function EscalaParametrizacaoModal({
  visible,
  escalaId,
  onClose,
}: {
  visible: boolean;
  escalaId: string;
  onClose: () => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const [parametrizacao, setParametrizacao] = useState<EscalaParametrizacaoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [participantesPhotos, setParticipantesPhotos] = useState<Map<string, string | null>>(new Map());

  useEffect(() => {
    if (!visible || !escalaId) return;
    setIsLoading(true);
    setHasError(false);
    EscalaRepository.getParametrizacao(escalaId)
      .then((data) => {
        setParametrizacao(data ?? null);
        if (data?.participantes?.length) {
          MinisterioVoluntariosRepository.search({
            where: {
              conditions: data.participantes.map((p) => ({
                path: 'id',
                operator: Operator.EQUALS,
                value: { type: ValueType.LITERAL, value: p.id },
              })),
              conjunction: Conjunction.OR,
            },
            relations: ['voluntario'],
          }).then((mvs) => {
            const map = new Map<string, string | null>();
            for (const mv of mvs as any[]) {
              map.set(mv.id, mv.voluntario?.fotoThumbUrl || mv.voluntario?.fotoUrl || null);
            }
            setParticipantesPhotos(map);
          });
        }
      })
      .catch(() => {
        setHasError(true);
        setParametrizacao(null);
      })
      .finally(() => setIsLoading(false));
  }, [visible, escalaId]);

  const tabs: TabItem[] = parametrizacao
    ? [
        {
          title: `Participantes${parametrizacao.participantes?.length ? ` (${parametrizacao.participantes.length})` : ''}`,
          content: parametrizacao.participantes?.length ? (
            <View style={styles.participantGrid}>
              {parametrizacao.participantes.map((p) => (
                <View key={p.id} style={styles.participantGridItem}>
                  <FancyAvatarImage
                    source={
                      participantesPhotos.get(p.id)
                        ? { uri: participantesPhotos.get(p.id)! }
                        : AppImages.emptyProfile
                    }
                    size={26}
                    style={styles.gridAvatar}
                  />
                  <FancyText
                    size='extraSmall'
                    type='semiBold'
                    color={palette.fonts.dark}
                    numberOfLines={2}
                    style={[styles.gridName, { opacity: 0.8, fontSize: 10, lineHeight: 12 }]}
                  >
                    {getFirstAndLastName(p.name)}
                  </FancyText>
                </View>
              ))}
            </View>
          ) : (
            <FancyText size='extraSmall' type='mediumItalic'>
              Nenhum participante
            </FancyText>
          ),
        },
        {
          title: `Eventos${parametrizacao.eventos?.length ? ` (${parametrizacao.eventos.length})` : ''}`,
          content: parametrizacao.eventos?.length ? (
            <View style={styles.eventoList}>
              {parametrizacao.eventos.map((evento, idx) => {
                const hasFuncoes = evento.equipe?.tipo !== 'fixo' && !!evento.equipe?.funcoes?.length;
                const hasFixos = evento.equipe?.tipo === 'fixo' && !!evento.equipe?.fixos?.length;
                const hasContent = hasFuncoes || hasFixos;
                return (
                  <FancyCardIcon
                    key={`${evento.id ?? 'evt'}-${idx}`}
                    title={evento.name}
                    subtitle={evento.date ? format(new Date(evento.date), 'dd/MM/yyyy') : undefined}
                    centerContainerStyle={{ gap: 1 }}
                    cardIcon={{
                      ...DefaultIconsNames['calendar-month'],
                      size: 18,
                      backgroundColor: palette.primary,
                    }}
                    isCollapsable={hasContent}
                    content={
                      hasContent ? (
                        hasFuncoes ? (
                          <View style={styles.funcaoList}>
                            {evento.equipe!.funcoes!.map((f, fi) => (
                              <View key={f.id ?? fi} style={styles.funcaoRow}>
                                <View style={[styles.funcaoBadge, { backgroundColor: palette.primary + '22' }]}>
                                  <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
                                    ×{f.quantidade ?? 1}
                                  </FancyText>
                                </View>
                                <FancyText size='extraSmall' type='semiBold' style={{ flex: 1 }}>
                                  {f.nome}
                                </FancyText>
                                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                                  {formatExpMinima(f.expMinima)}
                                </FancyText>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.fixoList}>
                            {evento.equipe!.fixos!.map((f, fi) => (
                              <FancyText key={`${f.voluntarioId}-${fi}`} size='extraSmall' type='medium'>
                                · {f.name ?? f.voluntarioId}
                              </FancyText>
                            ))}
                          </View>
                        )
                      ) : undefined
                    }
                  />
                );
              })}
            </View>
          ) : (
            <FancyText size='extraSmall' type='mediumItalic'>
              Nenhum evento configurado
            </FancyText>
          ),
        },
      ]
    : [];

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title='Parâmetros da Geração'>
      {isLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}>
          <ActivityIndicator size='small' color={palette.primary} />
          <FancyText size='small' type='mediumItalic' color={palette.fonts.inactive}>
            Carregando...
          </FancyText>
        </View>
      ) : hasError ? (
        <FancyText size='small' type='mediumItalic' style={{ textAlign: 'center', paddingVertical: 20 }}>
          Não foi possível carregar os parâmetros. Verifique se o backend está atualizado.
        </FancyText>
      ) : !parametrizacao ? (
        <FancyText size='small' type='mediumItalic' style={{ textAlign: 'center', paddingVertical: 20 }}>
          Esta escala não possui parametrização salva.
        </FancyText>
      ) : (
        <FancyTabs items={tabs} contentContainerStyle={{ paddingTop: 4 }} />
      )}
    </FancyBottomSheetModal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    participantGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 8,
      rowGap: 12,
      marginTop: 12,
    },
    participantGridItem: {
      width: '23%',
      alignItems: 'center',
      gap: 6,
    },
    gridAvatar: {
      borderRadius: 13,
    },
    gridName: {
      textAlign: 'center',
      marginTop: 2,
    },
    eventoList: {
      gap: 8,
    },
    funcaoList: {
      gap: 5,
      paddingTop: 4,
    },
    funcaoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    funcaoBadge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fixoList: {
      gap: 3,
      paddingTop: 2,
    },
  });
}
