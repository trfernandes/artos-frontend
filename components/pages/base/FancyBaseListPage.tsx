import { StyleSheet } from 'react-native';
import FancyList, { FancyListProps } from '../../list/FancyList';
import FancyBasePage, { FancyBasePageProps } from './FancyBasePage';

type FancyBaseListPageProps<ItemT> = {
  listProps: FancyListProps<ItemT>;
  children?: React.ReactNode;
  topContent?: React.ReactNode;
};

export default function FancyListPage<ItemT>(props: FancyBasePageProps & FancyBaseListPageProps<ItemT>) {
  return (
    <FancyBasePage
      {...props}
      children={
        <>
          {props.topContent}
          <FancyList
            {...props.listProps}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 15 }}
            containerStyle={{ flex: 1 }}
            bottomSpace={40}
          />
          {props.children}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, borderWidth: 0 },
});
