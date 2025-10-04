import { StyleSheet } from 'react-native';
import FancyList, { FancyListProps } from '../../list/FancyList';
import FancyBasePage, { FancyBasePageProps } from './FancyBasePage';

type FancyBaseListPageProps<ItemT> = {
  listProps: FancyListProps<ItemT>;
  children?: React.ReactNode;
};

export default function FancyListPage<ItemT>(props: FancyBasePageProps & FancyBaseListPageProps<ItemT>) {
  return (
    <FancyBasePage
      {...props}
      children={
        <>
          <FancyList
            {...props.listProps}
            contentContainerStyle={{ flex: 1, gap: 10 }}
            containerStyle={{ flex: 1 }}
          />
          {props.children}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10, gap: 15, borderWidth: 0 },
});
