// Schema for /trigger
export const triggerSchema = {
  body: {
    type: 'object',
    required: ['commitHash', 'versionQualifier', 'platformInstallData'],
    properties: {
      commitHash: { type: 'string' },
      versionQualifier: { type: 'string' },
      platformInstallData: {
        type: 'object',
        required: ['platform', 'link'],
        properties: {
          platform: { type: 'string' },
          link: {
            type: 'string',
            format: 'uri',
            pattern: '^https?://'
          }
        }
      }
    }
  }
}

// Schema for /register
export const registerSchema = {
  body: {
    type: 'object',
    required: ['appName', 'username', 'password'],
    properties: {
      appName: { type: 'string' },
      username: { type: 'string' },
      password: { type: 'string' },
      webhooks: {
        type: 'object',
        properties: {
          'win32-ia32': { type: 'string' },
          'win32-x64': { type: 'string' },
          'win32-arm64': { type: 'string' },
          'win32-arm64-x64': { type: 'string' },
          'darwin-x64': { type: 'string' },
          'mas-x64': { type: 'string' },
          'linux-armv7l': { type: 'string' },
          'linux-arm64': { type: 'string' },
          'linux-ia32': { type: 'string' },
          'linux-x64': { type: 'string' }
        }
      }
    }
  }
}

// Schema for /login
export const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  }
}

// Schema for /report/:reportId
export const reportSchema = {
  params: {
    type: 'object',
    required: ['reportId'],
    properties: {
      reportId: { type: 'number' }
    }
  },
  headers: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    // TODO(codebytere): determine what we want to require from consumers?
    properties: {
      name: { type: 'string' },
      status: { type: 'string' },
      arch: { type: 'string' },
      os: { type: 'string' },
      id: { type: 'number' },
      reportId: { type: 'number' },
      sourceLink: {
        type: 'string',
        format: 'uri',
        pattern: '^https?://'
      },
      timeStart: { type: 'string' },
      timeStop: { type: 'string' },
      totalPassed: { type: 'number' },
      totalSkipped: { type: 'number' },
      totalAborted: { type: 'number' },
      totalWarnings: { type: 'number' },
      totalFailed: { type: 'number' },
      workspaceGzipLink: {
        type: 'string',
        format: 'uri',
        pattern: '^https?://'
      },
      logfileLink: {
        type: 'string',
        format: 'uri',
        pattern: '^https?://'
      },
      ciLink: {
        type: 'string',
        format: 'uri',
        pattern: '^https?://'
      },
      testAgent: { type: 'object' }
    }
  }
}
