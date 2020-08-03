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

// Return an object containing total and passed tests for a Request.
export const getReportStats = (request: IRequest) => {
  const version = request.table.versionQualifier;
  const type = getChannelForVersion(version);
  const stats = {
    total: request.reports.filter(rep => rep.table.status !== api.Status.NOT_RUN).length,
    passed: request.reports.filter(rep => rep.table.status === api.Status.PASSED).length,
    failed: request.reports.filter(rep => rep.table.status === api.Status.FAILED).length
  };

  return { stats, type };
};
