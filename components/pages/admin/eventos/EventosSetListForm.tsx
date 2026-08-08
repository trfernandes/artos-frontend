import FancyContainerList from '../../../container_list/FancyContainerList';
import { DefaultIconsNames } from '../../../../constants/icons';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { usePallete } from '../../../../hooks/usePallete';
import { useState } from 'react';
import FancyTextArea from '../../../fields/FancyTextArea';
import { View } from 'react-native';
import FancyModalDialog from '../../../modal/FancyModalDialog';
import FancyDropDown from '../../../fields/FancyDropDown';
import FancyTextInput from '../../../fields/FancyTextInput';

interface Music {
  order: Number;
  nome: string;
  artista: string;
  tom: string;
  bpm: string;
  observacoes?: string;
}

const TONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const MUSIC_LIST = [
  {
    order: 1,
    nome: 'Somos um',
    artista: 'Salz Band',
    tom: 'C',
    bpm: '152',
    observacoes: 'Não vamos cantar a ponte',
    categoria: 'Celebração',
  },
  {
    order: 2,
    nome: 'Quero Jesus',
    artista: 'Brasa Music',
    tom: 'D',
    bpm: '130',
    categoria: 'Adoração',
  },
  {
    order: 3,
    nome: 'Nada mais',
    artista: 'Fhop music',
    tom: 'G',
    bpm: '130',
    categoria: 'Adoração',
  },
  { order: 4, nome: 'Altar', artista: 'Brasa music', tom: 'G', bpm: '130', categoria: 'Adoração' },
  {
    order: 5,
    nome: 'Meu Salvador',
    artista: 'Avivah music',
    tom: 'B',
    bpm: '128',
    categoria: 'Celebração',
  },
  {
    order: 6,
    nome: 'Batendo a Porta',
    artista: 'FHOP Music',
    tom: 'F',
    bpm: '126',
    categoria: 'Adoração',
  },
  { order: 7, nome: 'Sublime', artista: 'FHOP Music', tom: 'G', bpm: '132', categoria: 'Adoração' },
];

export default function EventosSetListForm() {
  const Pallete = usePallete();
  const [data, setData] = useState<Array<Music>>(MUSIC_LIST);

  const [musicFormParams, setMusicFormParams] = useState<{
    visible: boolean;
    mode: 'add' | 'edit';
    music: Music;
  }>({
    visible: false,
    mode: 'add',
    music: { order: 0, nome: '', artista: '', tom: '', bpm: '' },
  });

  return (
    <View style={{ flex: 1, gap: 15 }}>
      <FancyContainerList<Music>
        title={'Músicas'}
        data={data}
        renderItem={({ item }) => (
          <FancyCard.Image
            type='letter'
            props={{
              title: item.nome,
              subtitle: item.artista,
              additionalData1: `Tom: ${item.tom}  |  Bpm: ${item.bpm}`,
              letter: item.order.toString(),
              containerStyle: {},
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 18 },
                  onPress: () =>
                    setMusicFormParams((prev) => ({
                      ...prev,
                      visible: true,
                      mode: 'edit',
                      music: item,
                    })),
                },
                { icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error } },
              ],
            }}
          />
        )}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 18 },
            onPress: () => setMusicFormParams((prev) => ({ ...prev, visible: true, mode: 'add' })),
          },
          { icon: { ...DefaultIconsNames.sort, size: 11 } },
          { icon: { ...DefaultIconsNames['list-clear'], size: 16, style: { marginLeft: 2 } } },
        ]}
      />
      <FancyTextArea label='Observações Gerais' />
      {musicFormParams.visible && (
        <FancyModalDialog
          title={musicFormParams.mode === 'add' ? 'Adicionar música' : 'Editar música'}
          modalProps={{ visible: musicFormParams.visible }}
          onButton1Press={() => setMusicFormParams((prev) => ({ ...prev, visible: false }))}
          onButton2Press={() => setMusicFormParams((prev) => ({ ...prev, visible: false }))}
          centerContainerStyle={{ gap: 15 }}
        >
          <FancyDropDown
            label='Música'
            value={musicFormParams.music.order.toString()}
            listItems={data.map((musica) => ({
              title: musica.nome,
              subtitle: musica.artista,
              value: musica.order.toString(),
            }))}
            onChange={(value) =>
              setMusicFormParams((prev) => ({
                ...prev,
                music: { ...prev.music, order: Number(value) },
              }))
            }
          />
          <FancyDropDown
            label='Tom'
            value={musicFormParams.music.tom}
            listItems={TONS.map((tom) => ({ title: tom, value: tom }))}
            onChange={(value) =>
              setMusicFormParams((prev) => ({ ...prev, music: { ...prev.music, tom: value } }))
            }
          />
          <FancyTextInput
            label='Bpm'
            value={musicFormParams.music.bpm}
            inputProps={{
              keyboardType: 'numeric',
              maxLength: 3,
              onChangeText: (value) =>
                setMusicFormParams((prev) => ({ ...prev, music: { ...prev.music, bpm: value } })),
            }}
          />
          <FancyTextArea
            label='Observações'
            value={musicFormParams.music.observacoes}
            inputProps={{
              onChangeText: (value) =>
                setMusicFormParams((prev) => ({
                  ...prev,
                  music: { ...prev.music, observacoes: value },
                })),
            }}
          />
        </FancyModalDialog>
      )}
    </View>
  );
}
