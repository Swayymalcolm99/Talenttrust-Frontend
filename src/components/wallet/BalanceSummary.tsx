'use client';

import { AccountSummaryState } from '@/lib/stellar/useAccountSummary';
import { formatStroops } from '@/lib/stellar/account';
import { site } from '@/lib/site';

interface BalanceSummaryProps {
  state: AccountSummaryState;
  onRetry: () => void;
  compact?: boolean;
}

export function BalanceSummary({ state, onRetry, compact = false }: BalanceSummaryProps) {
  if (state.status === 'disconnected') {
    return <p className="small muted">Connect a wallet to view its XLM balance.</p>;
  }
  if (state.status === 'loading') {
    return <p className="small muted" role="status">Loading XLM balance...</p>;
  }
  if (state.status === 'error') {
    return (
      <div className="wallet-balance-error" role="alert">
        <p className="small">{state.error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Retry balance
        </button>
      </div>
    );
  }
  if (state.status === 'unfunded') {
    return (
      <div className="wallet-balance-error">
        <p className="small" role="status">This account has not been funded yet.</p>
        {site.network === 'testnet' && (
          <a
            className="btn btn-secondary btn-sm"
            href={`https://friendbot.stellar.org/?addr=${encodeURIComponent(
              typeof window === 'undefined' ? '' : window.localStorage.getItem('talenttrust-wallet-address') || '',
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Fund testnet account with Friendbot
          </a>
        )}
      </div>
    );
  }

  const { summary } = state;
  return (
    <dl className={`balance-summary${compact ? ' balance-summary-compact' : ''}`}>
      <div><dt>Spendable</dt><dd>{formatStroops(summary.spendableStroops)} XLM</dd></div>
      <div><dt>Reserve</dt><dd>{formatStroops(summary.reserveStroops)} XLM</dd></div>
      <div><dt>Total</dt><dd>{formatStroops(summary.nativeBalanceStroops)} XLM</dd></div>
    </dl>
  );
}
