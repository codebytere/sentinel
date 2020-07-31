import { IRequest } from 'src/server/interfaces';
import { api } from 'src/server/api';

// Determines whether a given version is a nightly release.
export const isNightly = v => v.includes('nightly');

// Determines whether a given version is a beta release.
export const isBeta = v => v.includes('beta');

// Determines whether a given version is a stable release.
export const isStable = v => !(isBeta(v) || isNightly(v));

// Comparison function to sort dates in descending order.
export const dateSort = (one: IRequest, two: IRequest) => {
  const d1 = new Date(one.table.createdAt);
  const d2 = new Date(two.table.createdAt);

  return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
};

// Return a date string in YYYY-MM-DD format.
export const formatDateString = (d: Date) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
};

// Returns a status icon depending on how many tests passed.
export const getStatusIcon = (failed: number, total: number) => {
  let statusIcon: string;
  if (failed > 0) {
    statusIcon = '🔴';
  } else if (total === 0) {
    statusIcon = '🟡';
  } else {
    statusIcon = '🟢';
  }
  return statusIcon;
};

// Return an object containing total and passed tests for a Request.
export const getReportStats = (request: IRequest) => {
  const version = request.table.versionQualifier;

  const stats = {
    total: request.reports.filter(rep => rep.table.status !== api.Status.NOT_RUN).length,
    passed: request.reports.filter(rep => rep.table.status === api.Status.PASSED).length,
    failed: request.reports.filter(rep => rep.table.status === api.Status.FAILED).length
  };

  let type = api.Channel.STABLE;
  if (isNightly(version)) {
    type = api.Channel.NIGHTLY;
  } else if (isBeta(version)) {
    type = api.Channel.BETA;
  }

  return { stats, type };
};
