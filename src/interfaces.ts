export interface ISpawnPromiseResult {
  code: number;
  stdout: Array<string>;
  stderr: Array<string>;
  success: boolean;
}