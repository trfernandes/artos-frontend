import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  Entypo,
  Feather,
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Octicons,
  Fontisto,
} from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

type IconRenderer = (size?: number, color?: string) => React.ReactNode;

export type IconLibrary =
  | 'MaterialIcons'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'FontAwesome6'
  | 'Ionicons'
  | 'Entypo'
  | 'Feather'
  | 'AntDesign'
  | 'Foundation'
  | 'MaterialCommunityIcons'
  | 'Octicons'
  | 'Fontisto';

export interface CustomIconProps {
  library: IconLibrary;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// Dicionário de bibliotecas disponíveis
const libraries = {
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  Entypo,
  Feather,
  AntDesign,
  MaterialCommunityIcons,
  Octicons,
  Fontisto,
} as const;

const DefaultIcons = {
  Edit: (size = 24, color = 'black', style?: StyleProp<TextStyle>) => (
    <MaterialIcons name="edit" size={size} color={color} style={style} />
  ),
  View: (size = 24, color = 'black', style?: StyleProp<TextStyle>) => (
    <FontAwesome name="eye" size={size} color={color} style={style} />
  ),
  Delete: (size = 24, color = 'black', style?: StyleProp<TextStyle>) => (
    <MaterialIcons name="delete" size={size} color={color} style={style} />
  ),
  Add: (size = 24, color = 'black', style?: StyleProp<TextStyle>) => (
    <Ionicons name="add-circle-outline" size={size} color={color} style={style} />
  ),

  // Componente customizável
  Custom: ({ library, name, size = 24, color = 'black', style }: CustomIconProps) => {
    const IconComponent = libraries[library];
    if (!IconComponent) {
      console.warn(`Icon library "${library}" not found`);
      return null;
    }

    return <IconComponent name={name as any} size={size} color={color} style={style} />;
  },
};

export default DefaultIcons;
