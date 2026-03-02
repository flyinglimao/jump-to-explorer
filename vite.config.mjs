import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const viemChainsEntry = path.join(projectDir, 'node_modules', 'viem', '_esm', 'chains', 'index.js');
const virtualModuleId = 'virtual:chain-explorer-map';
const resolvedVirtualModuleId = '\0' + virtualModuleId;

function chainExplorerMapPlugin() {
  return {
    name: 'chain-explorer-map',
    resolveId(source) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      return null;
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null;
      }

      const chainDefinitions = await import(pathToFileURL(viemChainsEntry).href);
      const chainExplorerById = {};

      for (const value of Object.values(chainDefinitions)) {
        if (
          value &&
          typeof value === 'object' &&
          typeof value.id === 'number' &&
          value.blockExplorers?.default?.url &&
          !(value.id in chainExplorerById)
        ) {
          chainExplorerById[value.id] = value.blockExplorers.default.url;
        }
      }

      return `export const chainExplorerById = ${JSON.stringify(chainExplorerById)};`;
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [chainExplorerMapPlugin()]
});
