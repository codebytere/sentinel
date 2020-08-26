// Schema for POST /trigger
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
};

// Schema for POST /register
export const registerSchema = {
  body: {
    type: 'object',
    required: ['appName', 'username', 'password', 'channel'],
    properties: {
      appName: { type: 'string' },
      username: { type: 'string' },
      password: { type: 'string' },
      channel: { type: 'number' },
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
};

// Schema for POST /update-user
export const updateSettingsSchema = {
  body: {
    type: 'object',
    properties: {
      channel: { type: 'number' },
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
};

// Schema for POST /login
export const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  }
};

// Schema for GET /requests/:requestId
export const getRequestSchema = {
  headers: {
    type: 'object',
    required: ['authToken'],
    properties: {
      authToken: { type: 'string' }
    }
  },
  params: {
    type: 'object',
    required: ['requestId'],
    properties: {
      requestId: { type: 'number' }
    }
  }
};

// Schema for GET /registrant/data/:username
export const registrantSchema = {
  headers: {
    type: 'object',
    required: ['authToken'],
    properties: {
      authToken: { type: 'string' }
    }
  },
  params: {
    type: 'object',
    required: ['username'],
    properties: {
      reportId: { type: 'string' }
    }
  }
};

export const getReportsByChannelSchema = {
  headers: {
    type: 'object',
    required: ['authToken'],
    properties: {
      authToken: { type: 'string' }
    }
  },
  params: {
    type: 'object',
    required: ['channel', 'date'],
    properties: {
      channel: { type: 'string' },
      date: { type: 'string' }
    }
  }
};

// Schema for POST /report/:reportId
export const newReportSchema = {
  params: {
    type: 'object',
    required: ['reportId'],
    properties: {
      reportId: { type: 'number' }
    }
  },
  headers: {
    type: 'object',
    required: ['authorization'],
    properties: {
      authorization: { type: 'string' }
    }
  },
  body: {
    type: 'object',
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
      totalTests: { type: 'number' },
      totalPassed: { type: 'number' },
      totalSkipped: { type: 'number' },
      totalWarnings: { type: 'number' },
      totalFailed: { type: 'number' },
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
};

export const authHeaderSchema = {
  headers: {
    type: 'object',
    required: ['authToken'],
    properties: {
      authToken: { type: 'string' }
    }
  }
};
