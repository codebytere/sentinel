import { IRequest } from 'src/server/interfaces';
import { api } from 'src/server/api';

export const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// Comparison function to sort dates in increasing order.
export const dateSort = (one: IRequest, two: IRequest) => {
  const d1 = new Date(one.table.createdAt);
  const d2 = new Date(two.table.createdAt);

  return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
};

// Returns a status icon depending on how many tests passed.
export const getStatusIcon = (failed: number, total: number) => {
  let statusIcon: string;
  if (total === 0) {
    statusIcon = '🟡';
  } else if (failed > 0) {
    statusIcon = '🔴';
  } else {
    statusIcon = '🟢';
  }

  return statusIcon;
};

// Return an object containing total and passed tests for a Request.
export const getReportStats = (request: IRequest) => {
  return {
    total: request.reports.filter(
      rep => rep.table.status !== api.Status.NOT_RUN
    ).length,
    passed: request.reports.filter(
      rep => rep.table.status === api.Status.PASSED
    ).length,
    failed: request.reports.filter(
      rep => rep.table.status === api.Status.FAILED
    ).length
  };
};
