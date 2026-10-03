import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const origin = 'http://127.0.0.1:4173/granada-historica/'
const testArguments = process.argv.slice(2)
const useInternalBuild = testArguments.some((argument) => argument.includes('m10-4'))
const server = spawn(process.execPath, [resolve('scripts/serve-dist.mjs')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    E2E_DIST_DIR: useInternalBuild ? 'dist-internal' : 'dist',
  },
})

let exitCode = 1
try {
  await waitForServer(origin)
  const runner = spawn(
    process.execPath,
    [resolve('node_modules/@playwright/test/cli.js'), 'test', ...testArguments],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        M10_INTERNAL_E2E: useInternalBuild ? '1' : '0',
      },
    },
  )
  exitCode = await childExitCode(runner)
} finally {
  if (server.exitCode === null) server.kill('SIGTERM')
  await Promise.race([
    childExitCode(server),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 2_000)),
  ])
  if (server.exitCode === null) server.kill('SIGKILL')
}

process.exitCode = exitCode

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) throw new Error('El servidor E2E terminó antes de estar listo.')
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw new Error(`El servidor E2E no respondió en ${origin}.`)
}

function childExitCode(child) {
  if (child.exitCode !== null) return Promise.resolve(child.exitCode)
  return new Promise((resolveExit, rejectExit) => {
    child.once('error', rejectExit)
    child.once('exit', (code) => resolveExit(code ?? 1))
  })
}
