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
          link: { type: 'string' }
        }
      }
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
  // Use sessionId to validate this report being 
  // sent by the correct registrant.
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
      sourceLink: { type: 'string' },
      // TODO(codebytere): make timeStart and timeStop date-time types?
      timeStart: { type: 'string' },
      timeStop: { type: 'string' },
      totalReady: { type: 'number' },
      totalPassed: { type: 'number' },
      totalSkipped: { type: 'number' },
      totalAborted: { type: 'number' },
      totalWarnings: { type: 'number' },
      totalFailed: { type: 'number' },
      workspaceGzipLink: { type: 'string' },
      logfileLink: { type: 'string' },
      ciLink: { type: 'string' },
      testAgent: { type: 'object' }
    }
  }
}