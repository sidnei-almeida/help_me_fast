import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// isDev when NODE_ENV is NOT explicitly 'production'
// electron:dev  → NODE_ENV unset → isDev=true  (sourcemaps, no minify)
// electron:build → NODE_ENV=production → isDev=false (no sourcemaps, minify)
const isDev = process.env.NODE_ENV !== 'production'

async function buildElectron() {
  try {
    const sharedOptions = {
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      bundle: true,
      external: ['electron'],
      sourcemap: isDev,
      minify: !isDev,
      treeShaking: true,
    }

    // Build main process — CJS because Electron loads main via require()
    await build({
      ...sharedOptions,
      entryPoints: [join(__dirname, 'electron/main.ts')],
      outfile: join(__dirname, 'dist-electron/main.cjs'),
    })

    // Build preload script — CJS because Electron injects preload via require()
    await build({
      ...sharedOptions,
      entryPoints: [join(__dirname, 'electron/preload.ts')],
      outfile: join(__dirname, 'dist-electron/preload.cjs'),
    })

    console.log(`Electron build completed (${isDev ? 'dev' : 'production'})!`)
  } catch (error) {
    console.error('Electron build failed:', error)
    process.exit(1)
  }
}

buildElectron()
