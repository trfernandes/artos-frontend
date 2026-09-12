import { useEffect, useState } from 'react';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import SubstituicaoCardBase from '../../../common/SubstituicaoCardBase';
import RecusarSubstituicaoModal from '../../../common/RecusarSubstituicaoModal';
import { EscalaSubstituicoesApi } from '../../../../../domain/api/EscalaSubstituicoesApi';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  onAceitar: (id: string) => Promise<void>;
  onRecusar: (id: string, motivo: string) => Promise<void>;
  isActing?: boolean;
};

export default function SubstituicaoMinisterioCard({
  substituicao,
  onAceitar,
  onRecusar,
  isActing,
}: Props) {
  const [recusarVisible, setRecusarVisible] = useState(false);
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
    await onRecusar(substituicao.id, motivo);
  };

  return (
    <>
      <SubstituicaoCardBase
        substituicao={substituicao}
        canAct
        isSubstituto={false}
        isActing={isActing}
        avisoIndisponivel={avisoIndisponivel}
        actions={{
          onAceitar: () => onAceitar(substituicao.id),
          onRecusar: () => setRecusarVisible(true),
        }}
      />
      <RecusarSubstituicaoModal
        visible={recusarVisible}
        onClose={() => setRecusarVisible(false)}
        onConfirm={handleConfirmRecusa}
        isLoading={isActing}
      />
    </>
  );
}
