import { useState } from 'react';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import SubstituicaoCardBase from '../../../common/SubstituicaoCardBase';
import RecusarSubstituicaoModal from '../../../common/RecusarSubstituicaoModal';

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

  const handleConfirmRecusa = async (motivo: string) => {
    setRecusarVisible(false);
    await onRecusar(substituicao.id, motivo);
  };

  return (
    <>
      <SubstituicaoCardBase
        substituicao={substituicao}
        canAct
        isActing={isActing}
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
