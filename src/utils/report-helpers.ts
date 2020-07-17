import { IRequest } from 'src/server/interfaces';
import { api } from 'src/server/api';

export const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// Converts a version qualifier (v10.0.0-nightly.20200505)
// to a Date object using the 20200505 nightly extension.
export const getDate = (versionQualifier: string) => {
  const pattern = /\d+.\d+.\d+-nightly.(\d{8})/;

  const match = versionQualifier.match(pattern);
  if (!match) {
    throw new Error(`Invalid date for versionQualifier: ${versionQualifier}`);
  }

  const yyyy = parseInt(match[1].substr(0, 4));
  const mm = parseInt(match[1].substr(4, 2));
  const dd = parseInt(match[1].substr(6, 2));

  return new Date(yyyy, mm, dd);
};

// Comparison function to sort dates in increasing order.
export const dateSort = (one: IRequest, two: IRequest) => {
  const d1 = getDate(one.table.versionQualifier);
  const d2 = getDate(two.table.versionQualifier);

  return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
};

// Returns a status icon depending on how many tests passed.
export const getStatusIcon = (passed: number, total: number) => {
  let statusIcon: string;
  if (total === 0) {
    statusIcon = '🟡';
  } else if (passed === total) {
    statusIcon = '🟢';
  } else {
    statusIcon = '🔴';
  }

  return statusIcon;
};

// Return an object containing total and passed tests for a Request.
export const getReportStats = (request: IRequest) => {
  return {
    total: request.reports.length,
    passed: request.reports.filter(
      rep => rep.table.status === api.Status.PASSED
    ).length
  };
};
