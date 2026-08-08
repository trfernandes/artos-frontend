import { StyleSheet } from 'react-native';
import FancyList, { FancyListProps } from '../../list/FancyList';
import FancyBasePage, { FancyBasePageProps } from './FancyBasePage';
import FancyLoading from '../../FancyLoading';

type FancyBaseListPageProps<ItemT> = {
  listProps: FancyListProps<ItemT>;
  children?: React.ReactNode;
  topContent?: React.ReactNode;
  /** Substitui a lista por um spinner centralizado, mantendo search bar e FAB fixos. */
  contentLoading?: boolean;
};

export default function FancyListPage<ItemT>(
  props: FancyBasePageProps & FancyBaseListPageProps<ItemT>,
) {
  return (
    <FancyBasePage
      {...props}
      children={
        <>
          {props.topContent}
          {props.contentLoading ? (
            <FancyLoading containerStyle={{ flex: 1 }} />
          ) : (
            <FancyList
              {...props.listProps}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 15, paddingTop: 4 }}
              containerStyle={{ flex: 1 }}
              bottomSpace={40}
            />
          )}
          {props.children}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, borderWidth: 0 },
});
