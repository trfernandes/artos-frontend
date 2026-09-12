import { useEffect, useState } from 'react';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import SubstituicaoCardBase from '../../../common/SubstituicaoCardBase';
import RecusarSubstituicaoModal from '../../../common/RecusarSubstituicaoModal';
import { EscalaSubstituicoesApi } from '../../../../../domain/api/EscalaSubstituicoesApi';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  /** Whether the current user can act on this card (i.e., is the substituto and status=Pendente). */
  canAct?: boolean;
  onAceitar?: (id: string) => Promise<void>;
  onRecusar?: (id: string, motivo: string) => Promise<void>;
  isActing?: boolean;
  isSolicitante?: boolean;
  onCancelar?: (id: string, motivo: string) => Promise<void>;
};

export default function SubstituicaoRecebidaCard({
  substituicao,
  canAct,
  onAceitar,
  onRecusar,
  isActing,
  isSolicitante,
  onCancelar,
}: Props) {
  const [recusarVisible, setRecusarVisible] = useState(false);
  const [cancelarVisible, setCancelarVisible] = useState(false);
  const [avisoIndisponivel, setAvisoIndisponivel] = useState(false);

  const isPendente = substituicao.status === EscalaSubstituicaoStatusEnum.Pendente;

  useEffect(() => {
    if (!isPendente) {
      setAvisoIndisponivel(false);
      return;
    }
    let cancelado = false;
    EscalaSubstituicoesApi.substitutoIndisponivel(substituicao.id)
      .then((indisponivel) => {
        if (!cancelado) setAvisoIndisponivel(indisponivel);
      })
      .catch(() => {
        if (!cancelado) setAvisoIndisponivel(false);
      });
    return () => {
      cancelado = true;
    };
  }, [substituicao.id, isPendente]);

  const handleConfirmRecusa = async (motivo: string) => {
    setRecusarVisible(false);
    if (onRecusar) await onRecusar(substituicao.id, motivo);
  };

  const handleConfirmCancelamento = async (motivo: string) => {
    setCancelarVisible(false);
    if (onCancelar) await onCancelar(substituicao.id, motivo);
  };

  const enabled = canAct && !!onAceitar && !!onRecusar;

  return (
    <>
      <SubstituicaoCardBase
        substituicao={substituicao}
        canAct={enabled}
        isActing={isActing}
        isSolicitante={isSolicitante}
        onCancelar={onCancelar ? () => setCancelarVisible(true) : undefined}
        avisoIndisponivel={avisoIndisponivel}
        actions={
          enabled
            ? {
                onAceitar: () => onAceitar?.(substituicao.id),
                onRecusar: () => setRecusarVisible(true),
              }
            : undefined
        }
      />
      <RecusarSubstituicaoModal
        visible={recusarVisible}
        onClose={() => setRecusarVisible(false)}
        onConfirm={handleConfirmRecusa}
        isLoading={isActing}
      />
      <RecusarSubstituicaoModal
        visible={cancelarVisible}
        onClose={() => setCancelarVisible(false)}
        onConfirm={handleConfirmCancelamento}
        isLoading={isActing}
        title='Cancelar solicitação'
        buttonLabel='Cancelar'
      />
    </>
  );
}
