import * as os from 'os'

export async function testAgent() {
  return {
    arch: os.arch(),
    platform: os.platform(),
    cpus: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
      speed: os.cpus()[0].speed
    },
    freemem: os.freemem(),
    release: os.release(),
    totalmem: os.totalmem(),
    type: os.type(),
    endianness: os.endianness()
  }
}