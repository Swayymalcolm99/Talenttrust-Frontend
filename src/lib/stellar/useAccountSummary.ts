'use client';

import { useCallback, useEffect, useState } from 'react';
import { AccountSummaryResult, loadAccountSummary } from './account';

export type AccountSummaryState =
  | { status: 'disconnected' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | AccountSummaryResult;

export function useAccountSummary(address: string | null) {
  const [state, setState] = useState<AccountSummaryState>({ status: 'disconnected' });

  const refresh = useCallback(async () => {
    if (!address) {
      setState({ status: 'disconnected' });
      return;
    }

    setState({ status: 'loading' });
    try {
      setState(await loadAccountSummary(address));
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Could not load the Stellar account.',
      });
    }
  }, [address]);

  useEffect(() => {
    void refresh();
    if (!address) return;

    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [address, refresh]);

  return { state, refresh };
}
