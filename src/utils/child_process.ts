import { spawn, SpawnOptions } from 'child_process';
import * as dayjs from 'dayjs';
import { ISpawnPromiseResult } from '../interfaces';

/**
 * Spawns a promise, logging along the way.
 *
 * @param {string} cmd - the process to spawn.
 * @param {Array<string>} [args=[]] - list of string arguments for the spawned command.
 * @param {SpawnOptions} [options] - Extra options for the spawned process.
 * @returns
 */
export async function spawnLoggedPromise(
  cmd: string,
  args: Array<string> = [],
  options?: SpawnOptions,
) {
  return new Promise<ISpawnPromiseResult>(resolve => {
    const logCmd = `"${cmd} ${args.join(' ')}"`;
    const creationTime = dayjs();
    const stdout: Array<string> = [];
    const stderr: Array<string> = [];
    const allLogs: Array<string> = [];

    console.info(`Spawning "${logCmd}"`);

    const logUpdates = setInterval(() => {
      const minutes = dayjs().diff(creationTime, 'minute');
      const lastInfo = getLastSeenOutputString(stdout, stderr);
      console.info(`${logCmd} has been running for ${minutes} minutes. ${lastInfo}`);
    }, 1000 * 60);

    const child = spawn(cmd, args, options!);

    child.stderr!.on('data', (data: Buffer) => {
      stderr.push(data.toString());
      allLogs.push(data.toString());
    });

    child.stdout!.on('data', (data: Buffer) => {
      stdout.push(data.toString());
      allLogs.push(data.toString());
    });

    child.on('close', (code: number) => {
      clearInterval(logUpdates);

      const minutes = `${creationTime.diff(dayjs(), 'minute')} minutes`;
      const lastInfo = getLastSeenOutputString(stdout, stderr);

      console.info(`${logCmd} ran for ${minutes} and exited with code ${code}. ${lastInfo}`);
      console.error(
        `Detailed Child Process Logs:\n  - CMD: ${logCmd}\n  - LOGS:\n${allLogs.join('')}\n\n`,
      );

      resolve({ code, stderr, stdout, success: code === 0 });
    });
  });
}

/**
 * Returns a loggable string about the last seen output.
 *
 * @param {Array<string>} stdout
 * @param {Array<string>} stderr
 * @returns {string} - the last seen output.
 */
export function getLastSeenOutputString(stdout: Array<string>, stderr: Array<string>): string {
  return (
    `Last seen output:\n` +
    `stdout: ${stdout[stdout.length - 1] || '(None)'}` +
    `stderr: ${stderr[stderr.length - 1] || '(None)'}`
  );
}
