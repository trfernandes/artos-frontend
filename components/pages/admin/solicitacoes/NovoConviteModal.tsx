import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FancyText from '../../../FancyText';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyChips from '../../../FancyChips';
import FancyModalDialog from '../../../modal/FancyModalDialog';
import DefaultIcons from '../../../FancyIcons';
import { Pallete } from '../../../../constants/colors';
import { CreateIgrejaConviteDto } from '../../../../domain/dtos/Igreja/create-igreja-convite.dto';
import { addDays } from 'date-fns';

type NovoConviteModalProps = {
  visible: boolean;
  onClose: () => void;
  onCriar: (dto: CreateIgrejaConviteDto) => void;
  isLoading?: boolean;
};

// Opções de validade
const VALIDADE_OPTIONS = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: 'Sem limite', value: null },
];

// Opções de max uses
const MAX_USES_OPTIONS = [
  { label: '1 uso', value: 1 },
  { label: '5 usos', value: 5 },
  { label: '10 usos', value: 10 },
  { label: 'Ilimitado', value: null },
];

export default function NovoConviteModal({
  visible,
  onClose,
  onCriar,
  isLoading = false,
}: NovoConviteModalProps) {
  const [descricao, setDescricao] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [maxUses, setMaxUses] = useState<number | null>(1);
  const [validadeDias, setValidadeDias] = useState<number | null>(7);

  const handleCriar = () => {
    const dto: CreateIgrejaConviteDto = {
      descricao: descricao.trim() || undefined,
      autoApprove,
      maxUses: maxUses ?? undefined,
      expiresAt: validadeDias ? addDays(new Date(), validadeDias).toISOString() : undefined,
    };
    onCriar(dto);
  };

  const handleClose = () => {
    // Reset form
    setDescricao('');
    setAutoApprove(false);
    setMaxUses(1);
    setValidadeDias(7);
    onClose();
  };

  return (
    <FancyModalDialog
      modalProps={{ visible }}
      title='Novo Convite'
      showCloseButton
      onButton1Press={handleClose}
      onButton2Press={handleCriar}
      button1={{ label: 'Cancelar' }}
      button2={{
        label: isLoading ? 'Gerando...' : 'Gerar Convite',
        icon: {
          library: 'MaterialCommunityIcons',
          name: 'ticket-confirmation-outline',
          size: 16,
          color: Pallete.fonts.light,
        },
        disabled: isLoading,
        isLoading: isLoading,
      }}
      centerContainerStyle={styles.content}
    >
      {/* Descrição */}
      <View style={styles.section}>
        <FancyTextInput
          label='Descrição (opcional)'
          placeholder='Ex: Convite para louvor, Ministério infantil...'
          value={descricao}
          disabled={isLoading}
          inputProps={{
            onChangeText: setDescricao,
            maxLength: 100,
          }}
        />
      </View>

      {/* Toggle de entrada imediata - Redesenhado */}
      <View style={styles.entryTypeSection}>
        <FancyText size='small' type='semiBold' style={[styles.sectionLabel, { opacity: 0.8 }]}>
          Tipo de Entrada
        </FancyText>

        <View style={styles.entryTypeCards}>
          <TouchableOpacity
            style={[
              styles.entryTypeCard,
              !autoApprove && styles.entryTypeCardActive,
              !autoApprove && { borderColor: Pallete.warning, backgroundColor: `${Pallete.warning}10` },
            ]}
            onPress={() => setAutoApprove(false)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='hourglass-empty'
              size={24}
              color={!autoApprove ? Pallete.warning : Pallete.fonts.inactive}
            />
            <FancyText
              type={!autoApprove ? 'semiBold' : 'normal'}
              size='small'
              color={!autoApprove ? Pallete.warning : Pallete.fonts.inactive}
            >
              Com Aprovação
            </FancyText>
            <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.entryTypeDesc}>
              Você aprova cada solicitação
            </FancyText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.entryTypeCard,
              autoApprove && styles.entryTypeCardActive,
              autoApprove && { borderColor: Pallete.confirm, backgroundColor: `${Pallete.confirm}10` },
            ]}
            onPress={() => setAutoApprove(true)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='flash-on'
              size={24}
              color={autoApprove ? Pallete.confirm : Pallete.fonts.inactive}
            />
            <FancyText
              type='bold'
              size='small'
              color={autoApprove ? Pallete.confirm : Pallete.fonts.inactive}
            >
              Entrada Imediata
            </FancyText>
            <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.entryTypeDesc}>
              Entra automaticamente
            </FancyText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Número de usos */}
      <View style={styles.section}>
        <FancyText size='small' type='semiBold' style={[styles.sectionLabel, { opacity: 0.8 }]}>
          Número de Usos
        </FancyText>
        <View style={styles.chipsRow}>
          {MAX_USES_OPTIONS.map((opt) => (
            <FancyChips
              key={opt.label}
              label={opt.label}
              color={maxUses === opt.value ? Pallete.primary : Pallete.fonts.inactive}
              outlined={maxUses !== opt.value}
              size='small'
              style={styles.chip}
              onPress={() => setMaxUses(opt.value)}
            />
          ))}
        </View>
      </View>

      {/* Validade */}
      <View style={styles.section}>
        <FancyText size='small' type='semiBold' style={[styles.sectionLabel, { opacity: 0.8 }]}>
          Validade
        </FancyText>
        <View style={styles.chipsRow}>
          {VALIDADE_OPTIONS.map((opt) => (
            <FancyChips
              key={opt.label}
              label={opt.label}
              color={validadeDias === opt.value ? Pallete.primary : Pallete.fonts.inactive}
              outlined={validadeDias !== opt.value}
              size='small'
              style={styles.chip}
              onPress={() => setValidadeDias(opt.value)}
            />
          ))}
        </View>
      </View>

      {/* Preview do convite */}
      <View style={styles.previewSection}>
        <View style={styles.previewCard}>
          <View style={styles.previewRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='ticket-confirmation-outline'
              size={16}
              color={Pallete.fonts.inactive}
            />
            <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
              {descricao.trim() || 'Convite'} • {maxUses ? `${maxUses} uso(s)` : 'Ilimitado'} • {validadeDias ? `${validadeDias} dias` : 'Sem expiração'}
            </FancyText>
          </View>
        </View>
      </View>
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    marginBottom: 2,
  },
  entryTypeSection: {
    gap: 10,
  },
  entryTypeCards: {
    flexDirection: 'row',
    gap: 10,
  },
  entryTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Pallete.borderCard,
    backgroundColor: Pallete.backgroundColor2,
    gap: 6,
  },
  entryTypeCardActive: {
    borderWidth: 2,
  },
  entryTypeDesc: {
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  previewSection: {
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 10,
    padding: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
