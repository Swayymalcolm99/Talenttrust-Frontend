import { site } from '@/lib/site';

const STROOPS_PER_XLM = 10_000_000n;
const BASE_RESERVE_STROOPS = 5_000_000n;

export interface AccountSummary {
  nativeBalanceStroops: bigint;
  subentryCount: number;
  reserveStroops: bigint;
  spendableStroops: bigint;
}

export type AccountSummaryResult =
  | { status: 'ready'; summary: AccountSummary }
  | { status: 'unfunded' };

function horizonUrl() {
  if (site.network === 'testnet') return 'https://horizon-testnet.stellar.org';
  if (site.network === 'futurenet') return 'https://horizon-futurenet.stellar.org';
  return 'https://horizon.stellar.org';
}

function parseXlmToStroops(value: string) {
  if (!/^\d+(?:\.\d{1,7})?$/.test(value)) {
    throw new Error('Horizon returned an invalid native balance.');
  }
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, '0'));
}

export async function loadAccountSummary(address: string): Promise<AccountSummaryResult> {
  if (!address.trim()) throw new Error('A Stellar account address is required.');

  const response = await fetch(`${horizonUrl()}/accounts/${encodeURIComponent(address)}`, {
    cache: 'no-store',
  });
  if (response.status === 404) return { status: 'unfunded' };
  if (!response.ok) throw new Error(`Horizon request failed (${response.status}).`);

  const account: unknown = await response.json();
  if (!account || typeof account !== 'object') throw new Error('Horizon returned invalid account data.');

  const data = account as {
    subentry_count?: unknown;
    balances?: unknown;
  };
  if (
    !Number.isSafeInteger(data.subentry_count) ||
    (data.subentry_count as number) < 0 ||
    !Array.isArray(data.balances)
  ) {
    throw new Error('Horizon returned incomplete account data.');
  }

  const nativeBalance = data.balances.find(
    (balance): balance is { asset_type: 'native'; balance: string } =>
      !!balance &&
      typeof balance === 'object' &&
      'asset_type' in balance &&
      balance.asset_type === 'native' &&
      'balance' in balance &&
      typeof balance.balance === 'string',
  );
  if (!nativeBalance) throw new Error('Horizon account data has no native balance.');

  const nativeBalanceStroops = parseXlmToStroops(nativeBalance.balance);
  const subentryCount = data.subentry_count as number;
  const reserveStroops = BigInt(2 + subentryCount) * BASE_RESERVE_STROOPS;

  return {
    status: 'ready',
    summary: {
      nativeBalanceStroops,
      subentryCount,
      reserveStroops,
      spendableStroops: nativeBalanceStroops - reserveStroops,
    },
  };
}

export function parseDepositAmount(amount: string | number): bigint | null {
  const value = typeof amount === 'number' ? String(amount) : amount.trim();
  if (!/^\d+(?:\.\d{1,7})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  const stroops = BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, '0'));
  return stroops > 0n ? stroops : null;
}

export type DepositValidation =
  | { status: 'ok' }
  | { status: 'insufficient'; shortBy: bigint }
  | { status: 'unfunded' }
  | { status: 'invalid' };

export function validateDepositAmount(
  amount: string | number,
  summary: AccountSummaryResult,
  feeBufferStroops = 1_000_000n,
): DepositValidation {
  if (summary.status === 'unfunded') return { status: 'unfunded' };
  const amountStroops = parseDepositAmount(amount);
  if (amountStroops === null || feeBufferStroops < 0n) return { status: 'invalid' };

  const available = summary.summary.spendableStroops - feeBufferStroops;
  if (amountStroops > available) {
    return { status: 'insufficient', shortBy: amountStroops - available };
  }
  return { status: 'ok' };
}

export function formatStroops(stroops: bigint): string {
  const negative = stroops < 0n;
  const absolute = negative ? -stroops : stroops;
  const whole = absolute / STROOPS_PER_XLM;
  const fraction = (absolute % STROOPS_PER_XLM).toString().padStart(7, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}
