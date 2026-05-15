import { StyleSheet, View } from 'react-native';
import FancyText from '../../../FancyText';
import { ThemePalette } from '../../../../constants/colors';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import FancyContainerList from '../../../container_list/FancyContainerList';
import FancyCheckbox from '../../../FancyCheckbox';
import DefaultIcons from '../../../FancyIcons';
import { ResponseMinisterioVoluntarioPermissaoDto } from '../../../../domain/dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.response';
import {
  RecursoPermissaoEnum,
  RecursoPermissaoEnumLabel,
  RecursosPermissoesTable,
  TipoPermissaoEnumLabel,
} from '../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

export default function PermissoesManager(props: { data: ResponseMinisterioVoluntarioPermissaoDto[]; disabled?: boolean }) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  return (
    <FancyContainerList
      data={(Object.entries(RecursosPermissoesTable) as [RecursoPermissaoEnum, (typeof RecursosPermissoesTable)[RecursoPermissaoEnum]][]).filter(
        ([_, permissoes]) => permissoes && permissoes.length > 0,
      )}
      contentContainerStyle={{ paddingVertical: 5 }}
      renderItem={({ item: [recurso, permissoes] }) => (
        <View style={styles.permissaoContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <DefaultIcons.Custom library='MaterialIcons' name='arrow-right' style={{ borderWidth: 0, marginLeft: -8 }} />
            <FancyText type='bold' size={'small'} color={props.disabled ? Pallete.icons.inactive : Pallete.icons.dark}>
              {RecursoPermissaoEnumLabel[recurso]}
            </FancyText>
          </View>
          <View style={styles.permissaoItemContainer}>
            <View style={styles.permissaoItemHeader}>
              {permissoes?.map((item, index) => (
                <FancyText
                  key={index}
                  size={'extraSmall'}
                  type={props.disabled ? 'semiBoldItalic' : 'semiBold'}
                  color={props.disabled ? Pallete.icons.inactive : Pallete.icons.dark}
                >
                  {TipoPermissaoEnumLabel[item]}
                </FancyText>
              ))}
            </View>
            <View style={styles.permissaoItemCheck}>
              {permissoes?.map((item, index) => (
                <View style={{ alignItems: 'center' }} key={index}>
                  {/* Esse texto é somente para poder centralizar o check com o header, ele nao aparece na tela */}
                  <FancyText
                    size={'extraSmall'}
                    style={{ opacity: 0, height: 0 }}
                    type={props.disabled ? 'semiBoldItalic' : 'semiBold'}
                  >
                    {TipoPermissaoEnumLabel[item]}
                  </FancyText>
                  <FancyCheckbox
                    disabled={props.disabled}
                    size={16}
                    value={props.data.some(
                      (permissao) => permissao.recurso === recurso && permissao.permissoes?.includes(item),
                    )}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
      title='Permissões'
    />
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: 15,
      backgroundColor: palette.backgroundColor,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 10,
    },
    permissaoContainer: { gap: 5, borderWidth: 0, paddingHorizontal: 5, paddingVertical: 5 },
    permissaoItemContainer: {
      paddingHorizontal: 16,
      gap: 6,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    permissaoItemHeader: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
    permissaoItemCheck: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  });
}
