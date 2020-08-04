import { IRequest } from 'src/server/interfaces';
import { api } from 'src/server/api';
import { NextApiRequest } from 'next';

// Determines whether a given version is a nightly, beta, or stable release.
export const getChannelForVersion = (v: string) => {
  if (v.includes('nightly')) {
    return api.Channel.NIGHTLY;
  } else if (v.includes('beta')) {
    return api.Channel.BETA;
  } else {
    return api.Channel.STABLE;
  }
};

// Comparison function to sort dates in descending order.
export const dateSort = (one: IRequest, two: IRequest) => {
  const d1 = new Date(one.table.createdAt);
  const d2 = new Date(two.table.createdAt);

  return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
};

// Returns a base URL for API calls.
export const getBaseURL = (req: NextApiRequest | null) => {
  const host = req?.headers?.host ? req.headers.host : window.location.host;
  const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host);
  return isLocalHost ? 'http://localhost:3000' : `https://${host}`;
};

// Return a date string in YYYY-MM-DD format.
export const formatDateString = (d: Date) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
};

// Return an object containing Report, platform, and TestData stats.
export const getStats = (reports: api.Report[]) => {
  const reportStats = {
    total: reports.filter(rep => rep.status !== api.Status.NOT_RUN).length,
    passed: reports.filter(rep => rep.status === api.Status.PASSED).length
  };

  const testStats = { total: 0, passed: 0 };
  const platformStats = { total: 0, passed: 0 };

  for (const report of reports) {
    const testData: api.TestData[] = report.TestData!;
    for (const td of testData) {
      platformStats.total++;
      if (td.status === api.Status.PASSED) {
        platformStats.passed++;
      }

      testStats.total += td.totalTests;
      testStats.passed += td.totalPassed;
    }
  }

  return { report: reportStats, platform: platformStats, test: testStats };
};
