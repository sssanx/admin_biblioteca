// esbuild.config.js
require('esbuild').build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: ['node14']
  
}).catch(() => process.exit(1))
