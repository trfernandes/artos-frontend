import React, { useEffect, useRef } from 'react';
import { View, ViewProps } from 'react-native';

type TutorialTargetProps = ViewProps & {
  id: string;
  registerTarget: (id: string, ref: React.RefObject<View | null>) => void;
  unregisterTarget: (id: string) => void;
  children: React.ReactNode;
};

export function TutorialTarget({
  id,
  registerTarget,
  unregisterTarget,
  children,
  ...viewProps
}: TutorialTargetProps) {
  const ref = useRef<View>(null);

  useEffect(() => {
    registerTarget(id, ref);
    return () => unregisterTarget(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <View ref={ref} collapsable={false} {...viewProps}>
      {children}
    </View>
  );
}
