import { TouchableOpacity, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';
import { format } from 'date-fns';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import DefaultIcons from '../../../../FancyIcons';
import { router } from 'expo-router';
import FancyChips from '../../../../FancyChips';
import { EscalaModel, EscalaStatusEnum, EscalaStatusEnumLabel } from '../../../../../domain/models/Escala';
import { EscalaStatusConfig } from '../../../../../app/(app)/(drawer)/ministerios/escalas';

export default function Header({
  escala,
  viewMode,
  onPublishPress,
  onFinishPress,
  onGeneratePress,
  onDeletePress,
}: {
  escala: EscalaModel;
  viewMode?: 'view' | 'edit';
  onPublishPress: () => void;
  onFinishPress: () => void;
  onGeneratePress: () => void;
  onDeletePress: () => void;
}) {
  return (
    <View style={{ borderWidth: 0, paddingHorizontal: 20, flexDirection: 'column', gap: 15 }}>
      <View style={{ gap: 10 }}>
        <View style={{ borderWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={{ borderWidth: 0, borderColor: 'coral', marginLeft: -8 }}
          >
            <DefaultIcons.Custom {...DefaultIconsNames['chevron-left']} style={{ borderWidth: 0, borderColor: 'forestgreen' }} />
          </TouchableOpacity>

          <FancyText type="bold" size="large">
            {escala.nome}
          </FancyText>
        </View>
        <View style={{ flexDirection: 'column', gap: 5 }}>
          <FancyTextDisplay
            icon={{
              library: 'MaterialIcons',
              name: 'date-range',
              size: 15,
              style: { width: 15, height: 15, lineHeight: 13 },
            }}
            title="Período:"
            value={`${format(new Date(escala.dataInicio), 'dd/MM/yyyy')} à ${format(new Date(escala.dataTermino), 'dd/MM/yyyy')}`}
          />
          <FancyTextDisplay
            icon={{
              library: 'MaterialIcons',
              name: 'donut-large',
              size: 15,
              style: { width: 15, height: 15, lineHeight: 13 },
            }}
            title="Status:"
            value={
              <FancyChips {...EscalaStatusConfig[escala.status]} label={EscalaStatusEnumLabel[escala.status]} size="small" />
            }
          />
          <FancyTextDisplay
            icon={{
              library: 'MaterialCommunityIcons',
              name: 'calendar',
              size: 15,
              style: { width: 15, height: 15, lineHeight: 15 },
            }}
            title="Criado em:"
            value={format(new Date(escala.createdAt!), 'dd/MM/yyyy')}
          />
          <FancyTextDisplay
            icon={{
              library: 'MaterialIcons',
              name: 'update',
              size: 15,
              style: { width: 15, height: 15, lineHeight: 13 },
            }}
            title="Últ. Atualização:"
            value={format(new Date(escala.updatedAt!), 'dd/MM/yyyy')}
          />
        </View>
        )
      </View>
      {!viewMode ||
        viewMode === 'edit' && (
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            {escala.status === EscalaStatusEnum.Gerada && (
              <FancyButton
                label="Publicar"
                icon={{ library: 'MaterialIcons', name: 'publish', size: 16 }}
                onPress={onPublishPress}
                containerStyle={{
                  height: 30,
                  gap: 5,
                  minWidth: 100,
                  backgroundColor: EscalaStatusConfig[EscalaStatusEnum.Publicada].color,
                }}
              />
            )}
            {escala.status === EscalaStatusEnum.Publicada && (
              <FancyButton
                label="Concluir"
                icon={{
                  library: 'MaterialIcons',
                  name: 'check',
                  size: 16,
                  style: { marginTop: -1, borderWidth: 0, width: 14 },
                }}
                onPress={onFinishPress}
                containerStyle={{
                  height: 30,
                  gap: 5,
                  minWidth: 100,
                  backgroundColor: EscalaStatusConfig[EscalaStatusEnum.Concluida].color,
                }}
              />
            )}
            <FancyButton
              label="Gerar"
              icon={{ library: 'MaterialIcons', name: 'refresh', size: 16 }}
              onPress={onGeneratePress}
              containerStyle={{ minWidth: 100, height: 30, gap: 5, paddingRight: 12, paddingLeft: 10 }}
            />
            <FancyButton
              label="Excluir"
              icon={{ ...DefaultIconsNames.delete, size: 14 }}
              onPress={onDeletePress}
              containerStyle={{
                minWidth: 100,
                height: 30,
                gap: 5,
                backgroundColor: Pallete.error,
                paddingRight: 12,
                paddingLeft: 10,
              }}
            />
          </View>
        )}
    </View>
  );
}
