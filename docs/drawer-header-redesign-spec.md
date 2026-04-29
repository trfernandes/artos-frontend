# Spec v2: Redesign do Drawer Header — "Identity Strip"

> Implementação para o Sonnet no Claude Code. Seguir **exatamente** as decisões abaixo. Esta é a v2 — substitui completamente a v1 anterior.

## Conceito

Header compacto inspirado em Slack / Gmail / Notion: **uma única "identity strip" densa** com avatar à esquerda, nome do usuário ao lado, e a igreja embutida logo abaixo do nome como **subtítulo interativo** (não como card separado).

- ❌ Sem "Olá," (apps maduros não cumprimentam no drawer — vira ruído)
- ❌ Sem card destacado para a igreja (vira linha de texto secundária)
- ❌ Sem anel duplo no avatar (border simples)
- ❌ Avatar deixa de ser à direita — vai para a **esquerda**, alinhado com o eixo dos ícones do menu
- ✅ Header total ~110–120px (vs ~180px atual), devolve espaço pra lista
- ✅ Touch target do avatar = perfil; touch target da igreja-row = modal de troca

## Arquivos a modificar

- `artos_frontend/components/drawer/FancyDrawerHeader.tsx` — reescrita parcial significativa
- `artos_frontend/components/drawer/FancyDrawerIgrejaSelector.tsx` — vira uma linha de texto secundária, não mais um chip/card
- `artos_frontend/components/drawer/FancyDrawer.tsx` — remoção do `marginTop: -15` e do `borderColor: 'red'`

**Não criar arquivos novos.**

---

## Anatomia visual da proposta

```
┌──────────────────────────────────────────────┐
│ ╔═══ gradiente (paddingTop=topInset+12,    ╗ │
│ ║         paddingBottom=14, paddingX=16)    ║ │
│ ║                                           ║ │
│ ║  ┌────┐  Carlos Marques                   ║ │  ← linha 1 (TouchableOpacity → perfil)
│ ║  │ 👤 │                                   ║ │
│ ║  │44px│  🏛 Diakonia Church  ⇄            ║ │  ← linha 2 (TouchableOpacity → modal)
│ ║  └────┘                                   ║ │
│ ║                                           ║ │
│ ╚═══════════════════════════════════════════╝ │
│                                              │
│  Pessoal                                     │  ← lista, primeiro separator
│  🏠  Início                                  │
└──────────────────────────────────────────────┘
```

Estrutura JSX conceitual:

```
<LinearGradient style={container}>
  <View style={identityStrip}>          // flexDirection=row, alignItems=center, gap=12
    <TouchableOpacity onPress={perfil}>  // wrapping do avatar
      <Avatar 44px />
    </TouchableOpacity>
    <View style={textColumn}>            // flex=1, gap=2
      <Nome />                            // FancyText size=large bold white
      <FancyDrawerIgrejaSelector />       // agora renderiza apenas uma linha de texto+ícones
    </View>
  </View>
</LinearGradient>
```

> Importante: o `TouchableOpacity` do avatar e o `TouchableOpacity` interno do `FancyDrawerIgrejaSelector` ficam **separados** — toques em áreas diferentes acionam ações diferentes. Não envolver tudo num único Touchable.

---

## 1. `FancyDrawerHeader.tsx` — reescrita

Substitua o componente inteiro por isso (mantendo imports do projeto que já existiam):

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StyleProp, ImageStyle, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { router } from 'expo-router';
import FancyText from '../FancyText';
import FancyAvatarImage from '../images/FancyImage';
import FancyDrawerIgrejaSelector from './FancyDrawerIgrejaSelector';
import { ThemePalette } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { AppImages } from '../../assets/app_images';
import { useTopSafeInset } from '../../hooks/useTopSafeInset';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export default function FancyDrawerHeader() {
  const auth = useAuth();
  const topInset = useTopSafeInset();
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  const nomeCompleto = auth.user?.user?.nome ?? '';

  return (
    <LinearGradient
      colors={palette.gradients.drawerHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.container, { paddingTop: topInset + 12 }]}
    >
      <View style={styles.identityStrip}>
        <TouchableOpacity
          onPress={() => router.push('pessoal/perfil')}
          activeOpacity={0.8}
          accessibilityRole='button'
          accessibilityLabel={`Perfil de ${nomeCompleto || 'usuário'}`}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <FancyAvatarImage
            size={44}
            source={
              auth.user?.user?.fotoThumbUrl || auth.user?.user?.fotoUrl
                ? { uri: auth.user?.user?.fotoThumbUrl || auth.user?.user?.fotoUrl || '' }
                : AppImages.emptyProfile
            }
            style={styles.avatar as StyleProp<ImageStyle>}
          />
        </TouchableOpacity>

        <View style={styles.textColumn}>
          <FancyText
            size='large'
            type='bold'
            color={palette.fonts.light}
            numberOfLines={1}
          >
            {nomeCompleto}
          </FancyText>
          <FancyDrawerIgrejaSelector />
        </View>
      </View>
    </LinearGradient>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    identityStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    },
    textColumn: {
      flex: 1,
      gap: 2,
      justifyContent: 'center',
    },
    avatar: {
      backgroundColor: palette.backgroundColor2,
      height: 44,
      width: 44,
      aspectRatio: 1,
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.35)',
    },
  });
}
```

### O que saiu vs o que entrou

| Removido | Motivo |
|---|---|
| `useVoluntariosCrud` + `params` + `useMemo` do params | Não estava sendo usado para nada (variável `data` ficava sem uso) |
| `DefaultIcons` import | Não usado nesse arquivo |
| `Operator`, `ValueType` imports | Junto com o crud removido |
| `<View style={infoContainer}>` com saudação "Olá," em duas linhas | Substituído por nome em uma linha só |
| `<View style={avatarRing}>` | Border vai direto no avatar |
| `dataContainer` style | Substituído por `identityStrip` |
| `buttonContainer`, `button` styles | Eram lixo (não usados) |
| `paddingBottom: 26`, `gap: 15` | Header ficava alto demais |

> ⚠️ **Atenção**: se `useVoluntariosCrud` aqui tinha algum efeito colateral importante (cache pre-fetch, etc.), **mantenha a chamada mas confirme antes**. Pelo código atual, `data` não é usado em lugar nenhum no JSX, então é seguro remover.

---

## 2. `FancyDrawerIgrejaSelector.tsx` — vira "subtitle row"

O componente continua sendo o gatilho do modal de troca, mas o visual deixa de ser um card. Vira **uma linha de texto** com logo pequena + nome + ícone swap. Sem fundo, sem borderRadius de card.

Substitua o componente inteiro:

```tsx
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

  const nomeIgreja = igrejaAtiva?.nome || 'Selecionar igreja';
  const temLogo = Boolean(igrejaAtiva?.logoThumbUrl || igrejaAtiva?.logoUrl);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        style={styles.row}
        accessibilityRole='button'
        accessibilityLabel={`Igreja ativa: ${nomeIgreja}`}
        accessibilityHint='Toque para trocar de igreja'
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {temLogo ? (
          <FancyImage
            source={{
              uri: (igrejaAtiva!.logoThumbUrl || igrejaAtiva!.logoUrl) as string,
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
              size={11}
            />
          </View>
        )}

        <FancyText
          size='small'
          type='medium'
          numberOfLines={1}
          style={styles.nomeText}
        >
          {nomeIgreja}
        </FancyText>

        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='swap-horizontal'
          size={14}
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
      gap: 6,
      alignSelf: 'flex-start',
      paddingVertical: 2,
      paddingRight: 4,
      // sem backgroundColor, sem borderRadius, sem border — é texto, não card
    },
    logo: {
      width: 18,
      height: 18,
      borderRadius: 9999,
    },
    logoPlaceholder: {
      width: 18,
      height: 18,
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
```

### Mudanças-chave

| Item | Antes | Depois |
|---|---|---|
| Visual | Card pílula com `backgroundColor: rgba(255,255,255,0.15)` | Linha de texto sem fundo |
| Largura | Quase total do drawer (height 38 + padding) | `alignSelf: flex-start`, ocupa só o necessário |
| Logo | 24–26px com border | 18px sem border |
| Texto | `size='medium'` `type='semiBold'` `color='#FFFFFF'` | `size='small'` `type='medium'` `color='rgba(255,255,255,0.92)'` |
| Ícone | `chevron-down` 18px | `swap-horizontal` 14px |
| Touch target | Implícito do card | `hitSlop={8}` em todas as direções (linha + 16 = ~32px+, suficiente para uma ação ocasional alinhada com a faixa de identidade) |

> Sobre touch target: a linha em si é pequena (~22px de altura). Combinada com `hitSlop=8` chega em ~38px. Não atinge 44px estrito do WCAG, mas para uma **ação ocasional** (trocar igreja) embutida num bloco de identidade, é aceitável — é o mesmo trade-off que Gmail e Slack fazem com seus seletores de conta. Se o time quiser rigor 44px, aumentar `paddingVertical` para 6 e `hitSlop` para 12.

---

## 3. `FancyDrawer.tsx` — limpar lixo

**Atual** (linhas 72–80):

```tsx
<View
  style={{
    width: '100%',
    flex: 1,
    borderColor: 'red',
    zIndex: 10,
    marginTop: -15,
  }}
>
```

**Novo:**

```tsx
<View
  style={{
    width: '100%',
    flex: 1,
    zIndex: 10,
  }}
>
```

> Removidos: `borderColor: 'red'` (debug) e `marginTop: -15` (era a causa raiz da sobreposição entre header e primeira linha da lista).

---

## Antes / Depois

```
ANTES (~180px de altura)              DEPOIS (~110-120px de altura)
┌──────────────────────────┐          ┌──────────────────────────┐
│ Olá,                [👤]│          │  [👤]  Carlos Marques    │
│ Carlos Marques      ⊙   │          │  44px  🏛 Diakonia ⇄     │
│                          │          └──────────────────────────┘
│ ┌─────────────────────┐ │          Pessoal
│ │🏛 Diakonia Church ⌄│ │          🏠 Início
│ └─────────────────────┘ │          📅 Minhas Indisponibilidades
└──────────────────────────┘          ...
[lista cortada/sobreposta]
```

---

## Checklist de validação

Antes de marcar como pronto:

- [ ] `cd artos_frontend && npx tsc --noEmit` passa sem erros
- [ ] Header tem **uma linha de identidade** (avatar à esquerda + nome + igreja-row em coluna ao lado)
- [ ] Saudação "Olá," não existe mais
- [ ] Avatar está à **esquerda** (não mais à direita)
- [ ] Avatar é 44px, com border 1.5 branca @ 35% opacidade — sem anel duplo
- [ ] Igreja não é mais um card — é uma linha de texto com logo 18px + texto small + ícone swap 14px
- [ ] Ícone do seletor é `swap-horizontal` (não `chevron-down`)
- [ ] Tocar no avatar abre `pessoal/perfil`
- [ ] Tocar na igreja-row abre o modal de troca de igreja
- [ ] Header total tem ~110–120px (medir aproximado)
- [ ] Primeiro separator da lista ("Pessoal") fica visível, não sobreposto pelo gradiente
- [ ] Testado em dark mode (gradiente + texto branco continuam OK)
- [ ] Igreja-row não estica para a largura inteira — `alignSelf: flex-start`
- [ ] Sem `Text` nativo, sem `TouchableOpacity` para botões com semântica de botão (os usados aqui são wrappers de áreas customizadas, OK)
- [ ] Modal de seleção de igreja continua funcionando exatamente igual

## O que NÃO fazer

- Não envolver avatar + texto-column num único `TouchableOpacity` — toques em áreas diferentes acionam ações diferentes (perfil vs trocar-igreja).
- Não criar componente novo `FancyChip` ou `FancyIdentityStrip` — toda a estrutura vive dentro de `FancyDrawerHeader.tsx` + `FancyDrawerIgrejaSelector.tsx`.
- Não tocar em `FancyDrawerIgrejaSelectorModal.tsx`.
- Não trocar `TouchableOpacity` por `FancyButton` — os toques aqui são em conteúdos compostos, não em "botões".
- Não mexer em `palette.gradients.drawerHeader` (cores) — está OK.
- Não adicionar `Olá,` "só por garantia" — a decisão é remover.
- Não adicionar label "Meus ministérios" — o `FancyDrawerSeparator` já existe e a primeira seção da lista (`Pessoal`) já dá a estrutura.

## Referências de inspiração (para entender a intenção)

- **Gmail Android** — drawer header: avatar à esquerda + nome + email/conta abaixo com chevron pequeno.
- **Slack mobile** — workspace switcher: linha de identidade compacta, sem cards barulhentos.
- **Notion mobile** — workspace switcher como pílula mínima embutida na área de identidade do usuário.
- **Linear mobile** — workspace + user em uma única linha de altura ~64px.

A intenção visual é **densidade respeitosa**: o header é contexto, não é o herói. Quem manda é a lista.
