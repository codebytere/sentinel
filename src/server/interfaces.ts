import { AlertManager } from 'react-alert';
import { api } from './api';
import { mRegistrant } from './database';

// Props

export interface IHomeProps {
  requests: IRequest[];
  registrants: mRegistrant[];
}

export interface IReleaseChannelProps {
  channel: api.Channel;
  requests: IRequest[];
}

export interface IRegistrantProps {
  registrant: mRegistrant;
}

export interface IAlertProps {
  alert: AlertManager;
}

export interface ISettingsProps {
  alert: AlertManager;
  webhooks?: Record<string, string> | null;
  channel?: api.ReleaseChannel;
}

export interface IReportProps {
  reports: IReport[];
  channel: string;
  date: string;
  versionQualifier: string;
}

// State

export interface ISettingsState {
  updatedSettings: {
    channel: api.ReleaseChannel;
    password: string;
  };
}

export interface INavBarState {
  open: boolean;
  user?: {
    name: string;
    id: number;
  };
}

export interface IRegistrantState {
  registrant: {
    username: string;
    password: string;
  };
}

export interface ISignupState {
  newRegistrant: api.Registrant;
}

// Other Interfaces

export interface IReportInfo {
  id: number;
  registrantId: number;
  requestId: number;
  name: string;
  reportsExpected: number;
  sessionToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequest {
  table: api.Request;
  reports: IReport[];
}

export interface IReport {
  table: api.Report;
  testData: { table: api.TestData }[];
}
