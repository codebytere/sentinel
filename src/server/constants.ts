export const PORT = ((process.env.PORT as unknown) as number) || 3000;

export const {
  HOST = '0.0.0.0',
  REPORT_WEBHOOK = 'http://localhost:3000',
  DATABASE_URL = 'postgres://postgres@localhost:5432/postgres',
  SESSION_SECRET = 'myverylongsupersecretthatisloadedfromenv',
  NODE_ENV
} = process.env;

export const SENTINEL_LOGO =
  'https://user-images.githubusercontent.com/2036040/88888382-1357ca00-d1f3-11ea-8e06-ff27d744e5ac.png';

// Valid platforms where CI may be run.
export const PLATFORMS = [
  'win32-ia32',
  'win32-x64',
  'win32-arm64',
  'win32-arm64-x64',
  'darwin-x64',
  'mas-x64',
  'linux-armv7l',
  'linux-arm64',
  'linux-ia32',
  'linux-x64'
];
