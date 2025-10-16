import { View } from 'react-native';
import FancyDropDown from '../../../fields/FancyDropDown';
import { ImageUtils } from '../../../../utils/image_utils';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';

export interface DataType {
  foto?: string;
  nome: string;
  email: string;
}

interface VoluntariosAddFormProps {
  voluntarioList: DataType[];
}

export default function VoluntariosAddForm({ voluntarioList }: VoluntariosAddFormProps) {
  return (
    <View>
      <FancyDropDown
        label="Nome"
        listItems={voluntarioList.map((value, index) => {
          return { title: value.nome, value: index.toString(), left: { type: 'image', source: value.foto ? ImageUtils.rawToDataUri(value.foto) ?? value.foto : undefined } } as DropDownItemProps;
        })}
      />
    </View>
  );
}
