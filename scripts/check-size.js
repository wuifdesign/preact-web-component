/* oxlint-disable no-console */
import { readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const DIST = 'dist'
const LIMIT = 10_000 // bytes (10 kB)

const files = readdirSync(DIST).filter((file) => ['.js', '.cjs'].includes(extname(file)))

if (files.length === 0) {
  console.error(`No output files found in ${DIST}/, run the build first`)
  process.exit(1)
}

let failed = false
for (const file of files) {
  const size = statSync(join(DIST, file)).size
  const ok = size < LIMIT
  failed ||= !ok
  console.log(`${ok ? '✔' : '✖'} ${DIST}/${file}  ${(size / 1000).toFixed(2)} kB`)
}

if (failed) {
  console.error(`Size limit of ${LIMIT / 1000} kB exceeded`)
  process.exit(1)
}
