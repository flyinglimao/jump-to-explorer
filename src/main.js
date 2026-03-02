import { chainExplorerById } from 'virtual:chain-explorer-map';

const statusNode = document.querySelector('[data-role="status"]');
const detailNode = document.querySelector('[data-role="detail"]');
const linkNode = document.querySelector('[data-role="link"]');
const routePattern = /^#\/chain\/([^/]+)\/([^/]+)\/([^/?#]+)$/i;

const resourceAliases = {
  tx: 'tx',
  transaction: 'tx',
  transactions: 'tx',
  address: 'address',
  account: 'address',
  wallet: 'address',
  contract: 'address',
  token: 'token',
  erc20: 'token',
  block: 'block',
  blocks: 'block'
};

const explorerPathBuilders = {
  tx: (id) => `/tx/${encodeURIComponent(id)}`,
  address: (id) => `/address/${encodeURIComponent(id)}`,
  token: (id) => `/token/${encodeURIComponent(id)}`,
  block: (id) => `/block/${encodeURIComponent(id)}`
};

function setStatus(message, detail, href) {
  statusNode.textContent = message;
  detailNode.textContent = detail;

  if (href) {
    linkNode.href = href;
    linkNode.hidden = false;
  } else {
    linkNode.hidden = true;
    linkNode.removeAttribute('href');
  }
}

function parseChainId(segment) {
  if (/^0x[0-9a-f]+$/i.test(segment)) {
    return Number.parseInt(segment, 16);
  }

  if (/^\d+$/.test(segment)) {
    return Number.parseInt(segment, 10);
  }

  return Number.NaN;
}

function normalizeExplorerUrl(url) {
  return url.replace(/\/+$/, '');
}

function resolveTarget(hash) {
  if (!hash) {
    return {
      idle: true
    };
  }

  const match = routePattern.exec(hash);

  if (!match) {
    return {
      error: 'Invalid route.',
      detail: 'Use #/chain/<chain>/<resource>/<id>.'
    };
  }

  const [, chainSegment, resourceSegment, resourceId] = match;
  const chainId = parseChainId(chainSegment);
  const resourceType = resourceAliases[resourceSegment.toLowerCase()];

  if (!Number.isFinite(chainId)) {
    return {
      error: `Unsupported chain id: ${chainSegment}`,
      detail: 'Use a decimal chain id like 1 or a hex chain id like 0x1.'
    };
  }

  if (!resourceType) {
    return {
      error: `Unsupported resource: ${resourceSegment}`,
      detail: 'Supported resources include tx, transaction, address, account, wallet, contract, token, erc20, and block.'
    };
  }

  const explorerBaseUrl = chainExplorerById[chainId];

  if (!explorerBaseUrl) {
    return {
      error: `Chain ${chainId} is not available in viem/chains.`,
      detail: 'The requested chain is not present in the generated explorer map.'
    };
  }

  return {
    targetUrl: `${normalizeExplorerUrl(explorerBaseUrl)}${explorerPathBuilders[resourceType](resourceId)}`,
    detail: `Resolved chain ${chainId} via viem's default explorer.`
  };
}

function redirectFromHash() {
  const { idle, error, detail, targetUrl } = resolveTarget(window.location.hash);

  if (idle) {
    setStatus(
      'Ready to redirect.',
      'Append a supported hash route to this URL, or click the example link below.'
    );
    return;
  }

  if (error) {
    setStatus(error, detail);
    return;
  }

  setStatus(`Redirecting to ${targetUrl}`, detail, targetUrl);
  window.location.replace(targetUrl);
}

window.addEventListener('hashchange', redirectFromHash);
redirectFromHash();
