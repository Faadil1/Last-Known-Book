export const NETWORKS = Object.freeze({
  shannon: Object.freeze({
    key: 'shannon',
    name: 'Somnia Shannon',
    chainId: 50312,
    rpcUrl: 'https://dream-rpc.somnia.network/',
    collateral: Object.freeze({
      symbol: 'tUSDC',
      address: '0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E',
      expectedDecimals: 6
    })
  }),
  mainnet: Object.freeze({
    key: 'mainnet',
    name: 'Somnia Mainnet',
    chainId: 5031,
    rpcUrl: 'https://api.infra.mainnet.somnia.network',
    collateral: Object.freeze({
      symbol: 'USDso',
      address: '0x00000022dA000002656c64D9eA6011ea952D008A',
      expectedDecimals: 18
    })
  })
});

const DECIMALS_SELECTOR = '0x313ce567';

export function getNetworkProfile(network = 'shannon') {
  const profile = NETWORKS[String(network).toLowerCase()];
  if (!profile) throw new Error(`Unsupported network: ${network}`);
  return profile;
}

export function parseHumanUnits(value, decimals) {
  const input = String(value).trim();
  if (!/^\d+(?:\.\d+)?$/.test(input)) throw new Error('Amount must be a non-negative decimal string');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error('Invalid decimals');
  const [whole, fraction = ''] = input.split('.');
  if (fraction.length > decimals) throw new Error(`Amount exceeds ${decimals} decimal places`);
  const padded = fraction.padEnd(decimals, '0');
  return (BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(padded || '0')).toString();
}

export function formatRawUnits(raw, decimals) {
  if (!/^\d+$/.test(String(raw))) throw new Error('Raw amount must be a non-negative integer string');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error('Invalid decimals');
  const value = BigInt(raw);
  if (decimals === 0) return value.toString();
  const scale = 10n ** BigInt(decimals);
  const whole = value / scale;
  const fraction = (value % scale).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

async function rpc(url, method, params = [], fetchFn = fetch) {
  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC_${body.error.code ?? 'ERROR'}`);
  return body.result;
}

export async function verifyNetworkNormalization(network = 'shannon', { fetchFn = fetch } = {}) {
  const profile = getNetworkProfile(network);
  const [chainHex, decimalsHex] = await Promise.all([
    rpc(profile.rpcUrl, 'eth_chainId', [], fetchFn),
    rpc(profile.rpcUrl, 'eth_call', [{ to: profile.collateral.address, data: DECIMALS_SELECTOR }, 'latest'], fetchFn)
  ]);
  const observedChainId = Number.parseInt(chainHex, 16);
  const observedDecimals = Number(BigInt(decimalsHex));
  return {
    schema: 'LKB-NETWORK-NORMALIZATION-CHECK-v0.1',
    network: profile.key,
    name: profile.name,
    expectedChainId: profile.chainId,
    observedChainId,
    collateral: {
      symbol: profile.collateral.symbol,
      address: profile.collateral.address,
      expectedDecimals: profile.collateral.expectedDecimals,
      observedDecimals
    },
    pass: observedChainId === profile.chainId && observedDecimals === profile.collateral.expectedDecimals,
    scalingRule: 'READ_DECIMALS_DO_NOT_HARDCODE_CROSS_NETWORK_SCALE',
    writesAttempted: false,
    checkedAt: new Date().toISOString()
  };
}
