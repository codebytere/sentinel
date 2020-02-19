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

export interface ISignupProps {
  newRegistrant: IRegistrant
}

export interface IRegistrantState {
  registrant: {
    username: string
    password: string
  }
}
