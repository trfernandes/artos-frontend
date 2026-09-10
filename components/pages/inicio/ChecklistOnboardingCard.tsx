import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import FancyText from '../../FancyText';
import FancyButton from '../../buttons/FancyButton';
import FancyModalDialog from '../../modal/FancyModalDialog';
import DefaultIcons from '../../FancyIcons';
import ChecklistOnboardingRing from './ChecklistOnboardingRing';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { ResponseChecklistOnboardingDto } from '../../../domain/dtos/ChecklistOnboarding/checklist-onboarding.response';

type Papel = 'admin' | 'lider';

type PassoConteudo = {
  hint: string;
  ctaLabel: string;
  onPress: () => void;
};

const CONTEUDO_ADMIN: Record<string, PassoConteudo> = {
  ministerio: {
    hint: 'Todo mundo em Diakonia é organizado por ministério (Louvor, Recepção, Mídia...). Crie o primeiro pra começar.',
    ctaLabel: 'Criar ministério',
    onPress: () => router.push('/(app)/(drawer)/admin/ministerios/add'),
  },
  funcao: {
    hint: 'Funções são os papéis dentro de um ministério (ex: Vocal, Guitarra). Abra um ministério pra cadastrar a primeira.',
    ctaLabel: 'Ir para ministérios',
    onPress: () => router.push('/(app)/(drawer)/admin/ministerios'),
  },
  voluntario: {
    hint: 'Convide alguém pra entrar na igreja e virar voluntário — sem isso não dá pra montar escala.',
    ctaLabel: 'Convidar voluntário',
    onPress: () =>
      router.push({ pathname: '/admin/solicitacoes', params: { tab: 'convites' } } as never),
  },
  vincular: {
    hint: 'Depois de ter voluntário e ministério, vincule um ao outro pra ele poder ser escalado.',
    ctaLabel: 'Ir para ministérios',
    onPress: () => router.push('/(app)/(drawer)/admin/ministerios'),
  },
  atribuir: {
    hint: 'Atribua uma função ao voluntário já vinculado, assim ele aparece disponível na hora de montar a escala.',
    ctaLabel: 'Ir para ministérios',
    onPress: () => router.push('/(app)/(drawer)/admin/ministerios'),
  },
  evento: {
    hint: 'Eventos são os cultos/encontros que recebem escala (ex: Culto de Domingo). Crie o primeiro.',
    ctaLabel: 'Criar evento',
    onPress: () => router.push('/(app)/(drawer)/admin/eventos/add'),
  },
};

function conteudoLider(ministerioId: string): Record<string, PassoConteudo> {
  return {
    funcao: {
      hint: 'Funções são os papéis dentro do seu ministério (ex: Vocal, Guitarra). Cadastre a primeira.',
      ctaLabel: 'Cadastrar função',
      onPress: () =>
        router.push({ pathname: '/ministerios/funcoes', params: { ministerioId } } as never),
    },
    voluntario: {
      hint: 'Convide alguém pra entrar no seu ministério — sem isso não dá pra montar escala.',
      ctaLabel: 'Convidar voluntário',
      onPress: () =>
        router.push({ pathname: '/ministerios/integrantes/add', params: { ministerioId } } as never),
    },
    vincular: {
      hint: 'Vincule um voluntário já cadastrado ao seu ministério pra ele poder ser escalado.',
      ctaLabel: 'Vincular voluntário',
      onPress: () =>
        router.push({ pathname: '/ministerios/integrantes/add', params: { ministerioId } } as never),
    },
    atribuir: {
      hint: 'Atribua uma função ao voluntário vinculado, assim ele aparece disponível na escala.',
      ctaLabel: 'Atribuir função',
      onPress: () =>
        router.push({ pathname: '/ministerios/integrantes/add', params: { ministerioId } } as never),
    },
    evento: {
      hint: 'Falta um evento vinculado a este ministério pra gerar a primeira escala. Só o Admin cria eventos — peça pra ele vincular um culto ao seu ministério.',
      ctaLabel: 'Ver agenda',
      onPress: () =>
        router.push({ pathname: '/ministerios/agenda', params: { ministerioId } } as never),
    },
  };
}

type ChecklistOnboardingCardProps = {
  papel: Papel;
  checklist: ResponseChecklistOnboardingDto;
  ministerioId?: string;
};

export default function ChecklistOnboardingCard({
  papel,
  checklist,
  ministerioId,
}: ChecklistOnboardingCardProps) {
  const Pallete = usePallete();
  const [listaAberta, setListaAberta] = useState(false);
  const { passos, concluidos, total, proximoPendente } = checklist;

  if (!proximoPendente || total === 0) {
    return null;
  }

  const conteudo =
    papel === 'admin' ? CONTEUDO_ADMIN : conteudoLider(ministerioId ?? '');
  const passoConteudo = conteudo[proximoPendente.chave];

  const tint = ColorUtils.lightenColor(Pallete.primary, 0.96);

  return (
    <View style={[styles.card, { backgroundColor: tint, borderColor: Pallete.borderCard }]}>
      <ChecklistOnboardingRing concluidos={concluidos} total={total} />

      <FancyText
        size='extraSmall'
        type='bold'
        color={Pallete.primary}
        style={styles.eyebrow}
      >
        PRÓXIMO PASSO
      </FancyText>
      <FancyText size='medium' type='bold' style={styles.stepName}>
        {proximoPendente.label}
      </FancyText>
      {!!passoConteudo?.hint && (
        <FancyText size='small' color={Pallete.fonts.inactive} style={styles.hint}>
          {passoConteudo.hint}
        </FancyText>
      )}

      <FancyButton
        label={passoConteudo?.ctaLabel ?? 'Continuar'}
        onPress={passoConteudo?.onPress}
        containerStyle={styles.button}
      />

      <View style={styles.dots}>
        {passos.map((passo, index) => (
          <View
            key={passo.chave}
            style={[
              styles.dot,
              {
                backgroundColor: passo.concluido ? Pallete.primary : Pallete.disabled3,
                width: passo.concluido ? 14 : 5,
              },
            ]}
          />
        ))}
      </View>

      <Pressable onPress={() => setListaAberta(true)}>
        <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.verTudo}>
          Ver checklist completo
        </FancyText>
      </Pressable>

      {listaAberta && (
        <FancyModalDialog
          title='Checklist de configuração'
          modalProps={{ visible: listaAberta }}
          onButton1Press={() => setListaAberta(false)}
          onButton2Press={() => setListaAberta(false)}
          button1={{ visible: false }}
          button2={{ label: 'Fechar', type: 'outlined' }}
          showCloseButton
        >
          {passos.map((passo) => (
            <View key={passo.chave} style={styles.listaItem}>
              {DefaultIcons.Custom({
                library: 'Ionicons',
                name: passo.concluido ? 'checkmark-circle' : 'ellipse-outline',
                size: 20,
                color: passo.concluido ? Pallete.confirm : Pallete.disabled3,
              })}
              <FancyText
                size='small'
                type={passo.concluido ? 'normal' : 'medium'}
                color={passo.concluido ? Pallete.fonts.inactive : Pallete.fonts.dark}
              >
                {passo.label}
              </FancyText>
            </View>
          ))}
        </FancyModalDialog>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 0.4,
    marginTop: 12,
  },
  stepName: {
    marginTop: 4,
    textAlign: 'center',
  },
  hint: {
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 14,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  verTudo: {
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  listaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
});
