import { AlertManager } from 'react-alert'
import { api } from './api'

// Props

export interface IHomeProps {
  requests: IRequest[]
}

export interface IAlertProps {
  alert: AlertManager
}

export interface ISettingsProps {
  alert: AlertManager
  webhooks: Record<string, string> | null
  channel: api.ReleaseChannel
}

export interface IReportListProps {
  reports: IReportInfo[]
  changeReport: (id: string) => void
}

export interface IReportProps {
  reports: IReport[]
  versionQualifier: string
}

// State

export interface INavBarState {
  open: boolean
  user?: {
    name: string
    id: number
  }
}

export interface IRegistrantState {
  registrant: {
    username: string
    password: string
  }
}

export interface ISignupState {
  newRegistrant: IRegistrant
}

export interface IReportState {
  platformOptions: string[]
  registrants: string[]
  currentPlatformData?: { table: api.TestData }
  currentReport: IReport
}

// Other Interfaces

export interface IRegistrant {
  appName: string
  username: string
  password: string
  channel: api.ReleaseChannel
  webhooks?: Record<string, string>
}

export interface IReportInfo {
  id: number
  registrantId: number
  requestId: number
  name: string
  reportsExpected: number
  sessionToken: string
  createdAt: Date
  updatedAt: Date
}

export interface IRequest {
  table: api.Request
  reports: IReport[]
}

export interface IReport {
  table: api.Report
  testData: { table: api.TestData }[]
}
