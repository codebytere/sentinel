import { AlertManager } from 'react-alert'

export interface IRegistrant {
  appName: string
  username: string
  password: string
  webhooks?: Record<string, string>
}

export interface IAlertProps {
  alert: AlertManager
}

export interface INavBarState {
  open: boolean
  user?: {
    name: string
    id: number
  }
}

export interface ISignupState {
  newRegistrant: IRegistrant
}

export interface IRegistrantState {
  registrant: {
    username: string
    password: string
  }
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

export interface IReportListProps {
  reports: IReportInfo[]
  changeReport: (id: string) => void
}

export interface HomeState {
  reports?: any
  loading: boolean
  selectedReport?: string
}
