import { View, StyleSheet } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';
import FancyText from '../../../FancyText';
import { Pallete } from '../../../../constants/colors';
import DefaultIcons from '../../../FancyIcons';
import { ColorUtils } from '../../../../utils/color_utils';

type SummaryItemProps = {
  label: string;
  value?: string;
  hidden?: boolean;
};

function SummaryItem({ label, value, hidden = false }: SummaryItemProps) {
  if (hidden || !value) return null;
  return (
    <View style={styles.summaryItem}>
      <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
        {label}:
      </FancyText>
      <FancyText size='extraSmall' type='medium' style={{ flex: 1 }} numberOfLines={1}>
        {value}
      </FancyText>
    </View>
  );
}

type SummarySectionProps = {
  icon: { library: string; name: string };
  title: string;
  children: React.ReactNode;
};

function SummarySection({ icon, title, children }: SummarySectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <DefaultIcons.Custom library={icon.library as any} name={icon.name} size={18} color={Pallete.primary} />
        </View>
        <FancyText size='small' type='bold' color={Pallete.primary}>
          {title}
        </FancyText>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function CreateIgrejaAccountTabPronto() {
  const { getValues } = useFormContext<LoginCreateIgrejaFormData>();
  const values = getValues();

  // Formata o WhatsApp para exibição
  const formatWhatsApp = (phone: string) => {
    if (!phone) return '';
    const nums = phone.replace(/\D/g, '');
    if (nums.length === 11) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    }
    return phone;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.checkIconContainer}>
          <DefaultIcons.Custom library='MaterialCommunityIcons' name='check' size={20} color='white' />
        </View>
        <View style={styles.headerTextContainer}>
          <FancyText type='bold' size='medium'>
            Tudo pronto!
          </FancyText>
          <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
            Revise os dados antes de criar sua igreja
          </FancyText>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <SummarySection icon={{ library: 'MaterialCommunityIcons', name: 'church' }} title='Dados da Igreja'>
          <SummaryItem label='Nome' value={values.nome} />
          <SummaryItem label='Código de Identificação' value={values.codigo} />
          <SummaryItem label='Localização' value={values.cidade && values.uf ? `${values.cidade} - ${values.uf}` : undefined} />
        </SummarySection>

        <View style={styles.divider} />

        <SummarySection icon={{ library: 'Feather', name: 'user' }} title='Responsável'>
          <SummaryItem label='Nome' value={values.responsavelNome} />
          <SummaryItem label='E-mail' value={values.responsavelEmail} />
          <SummaryItem label='WhatsApp' value={formatWhatsApp(values.responsavelWhatsapp)} />
        </SummarySection>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
    gap: 2,
  },
  checkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Pallete.confirm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.95),
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    gap: 6,
    paddingLeft: 36,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Pallete.borderCard,
  },
});
