import { View } from 'react-native';
import { format } from 'date-fns';
import { Pallete } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import ListaVoluntariosTable from './ListaVoluntariosTable';
import { ResultadoDataType, ResultadoEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import { useMemo, useState } from 'react';
import SubstituirVoluntarioModal, { SubstituicaoConfirmDialog } from './SubstituirVoluntarioModal';

export interface EventoTableProps {
  data: ResultadoDataType;
  viewMode?: 'view' | 'edit';
  ministerioId: string;
  onChangeVoluntario?: (data: SubstituicaoConfirmDialog) => Promise<boolean>;
}

export default function EventoTable({ data, viewMode, ministerioId, onChangeVoluntario }: EventoTableProps) {
  const [substituicaoModalProps, setSubstituicaoModalProps] = useState<{ isOpen: boolean; data?: ResultadoEquipeType }>({
    isOpen: false,
  });

  const { borderColor, expandableIconColor, lightenColor, textColor, headerBackgroundColor } = useMemo(() => {
    const border = ColorUtils.darkenColor(data.evento.cor || Pallete.primary, 0);
    return {
      borderColor: border,
      expandableIconColor: ColorUtils.darkenColor(data.evento.cor || Pallete.primary, 0.4),
      lightenColor: ColorUtils.lightenColor(data.evento.cor || Pallete.primary, 0.96),
      textColor: ColorUtils.getTextColorForBackground(border),
      headerBackgroundColor: ColorUtils.lightenColor(data.evento.cor || Pallete.primary, 0.2),
    };
  }, [data.evento.cor]);

  return (
    <>
      <FancyAccordeon
        title=<View
          style={{
            paddingVertical: 10,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            flex: 1,
          }}
        >
          <View style={{ gap: 3 }}>
            <FancyText type="bold" size="small">
              {data.evento.nome}
            </FancyText>
            <FancyText type="medium" size="extraSmall" style={{}}>{`${format(
              data.dataOcorrencia,
              'dd/MM/yyyy'
            )} - ${`${format(data.evento.dataInicio!, 'HH:mm')} à ${format(
              data.evento.dataTermino!,
              'HH:mm'
            )}`}`}</FancyText>
          </View>
        </View>
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 15, borderWidth: 0, backgroundColor: 'white' }}
        headerContainerStyle={{ backgroundColor: lightenColor }}
        headerExpandedContainerStyle={{
          borderBottomWidth: 1.35,
          borderColor: borderColor,
          backgroundColor: lightenColor,
        }}
        containerContainerStyle={{
          borderColor: borderColor,
          borderRadius: 12,
          borderWidth: 1.35,
          backgroundColor: lightenColor,
        }}
        containerExpandedContainerStyle={{
          borderColor: borderColor,
          borderRadius: 12,
          borderWidth: 1.35,
          backgroundColor: 'white',
          paddingBottom: 15,
          marginBottom: 10,
        }}
        iconProps={{ color: expandableIconColor }}
      >
        <ListaVoluntariosTable
          data={data.equipe}
          onSubstituicaoButtonPressed={data => {
            setSubstituicaoModalProps({ isOpen: true, data });
          }}
        />
      </FancyAccordeon>

      {substituicaoModalProps.isOpen && (
        <SubstituirVoluntarioModal
          data={{
            ...substituicaoModalProps.data!,
            evento: {
              dataInicio: data.evento.dataInicio!,
              dataTermino: data.evento.dataTermino!,
              dataOcorrencia: data.dataOcorrencia,
            },
            ministerioId,
          }}
          OnButton2Press={async data => {
            const result = await onChangeVoluntario?.(data);
            if (result) {
              setSubstituicaoModalProps({ isOpen: false });
            }
          }}
          onButton1Press={() => setSubstituicaoModalProps({ isOpen: false })}
          modalProps={{
            visible: substituicaoModalProps.isOpen,
          }}
        />
      )}
    </>
  );
}
