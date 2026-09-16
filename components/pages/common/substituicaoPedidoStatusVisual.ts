import { ThemePalette } from '../../../constants/colors';
import { SubstituicaoPedidoStatusEnum } from '../../../domain/enums/SubstituicaoPedido/substituicao-pedido-status.enum';

export function getStatusVisual(status: SubstituicaoPedidoStatusEnum, palette: ThemePalette) {
  switch (status) {
    case SubstituicaoPedidoStatusEnum.Aberto:
      return { color: palette.warning, icon: 'schedule' };
    case SubstituicaoPedidoStatusEnum.Resolvido:
      return { color: palette.confirm, icon: 'check-circle' };
    case SubstituicaoPedidoStatusEnum.Cancelado:
      return { color: palette.fonts.inactive, icon: 'cancel' };
    case SubstituicaoPedidoStatusEnum.SemCandidato:
      return { color: palette.error, icon: 'person-off' };
  }
}
