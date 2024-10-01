export interface HostColor {
  host: string
  color: string
}

export interface HostColorsState {
  readonly hostColors: HostColor[]
}

interface createHostColorAction {
  type: 'createHostColor'
  annotation: HostColor
}

interface updateHostColorAction {
  type: 'updateHostColor'
  payload: HostColor
}

interface deleteHostColorAction {
  type: 'deleteHostColor'
  annotation: HostColor
}

export type HostColorsActionTypes = createHostColorAction |
  updateHostColorAction |
  deleteHostColorAction