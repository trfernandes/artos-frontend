import { useSyncExternalStore } from 'react';
import { subscribeSlowRequest, getIsSlowRequest } from '../core/network/slowRequestBridge';

export function useSlowRequest() {
  return useSyncExternalStore(subscribeSlowRequest, getIsSlowRequest, getIsSlowRequest);
}
