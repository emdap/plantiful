// TODO: organize this file

export interface FilterParams {
  filter?: Filter
  filter_not?: Filter
}

export interface Filter {
  [key: string]: string[]
}

export type FilterType = "filter" | "filter_not"

export type PageLinkKey = "first" | "prev" | "next" | "last"

export type PageLinks = {
  [key in PageLinkKey]?: string
}

export interface PageButton {
  text: string
  nav: PageLinkKey
}

export interface ActivePlantInfo {
  text: string
  value?: number | string | null
}

export interface Basis {
  rotation?: GrowRotation
  transitionSpeed?: number
  zIndex?: number
  tabIndex?: number
}

// TODO: does it make sense to keep all of these optional?
export interface GrowBasis extends Basis {
  position?: GrowPosition
  height?: number
  width?: number
}

// TODO: rename interfaces that are used by widgets and grow
export interface WidgetBasis extends Basis {
  position: WidgetPosition
  height: number | string | undefined
  width: number | string | undefined
}

export interface GrowEntity extends GrowBasis {
  name: string
  id: string // plant id - instance of plant id
  plantId: number
  shapes: GrowShape[]
}

export interface GrowShape extends GrowBasis {
  border: GrowBorder
  color: string
  opacity?: number
}

export interface GrowPosition {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface WidgetPosition {
  top: number | string
  left: number | string
}

export type RequiredPositions = "top" | "left"
export type Positions = RequiredPositions | "right" | "bottom"
export type Dimensions = "height" | "width"

export interface GrowRotation {
  x: number
  y: number
  z: number
}

export interface GrowBorder {
  top?: BorderAttribute
  right?: BorderAttribute
  bottom?: BorderAttribute
  left?: BorderAttribute
}

export interface BorderAttribute {
  size: number
  show: boolean
}

// for API response interfaces, only targetting fields that are used
export interface PlantSnippet {
  id: number
  common_name: string
  scientific_name: string
  family_common_name: string
  family: string
  image_url: string
}

export type LeafTexture = "fine" | "medium" | "coarse"

export interface MainSpecies extends PlantSnippet {
  flower: {
    color: null | string[]
  }
  foliage: {
    texture: null | LeafTexture
    color: null | string[]
  }
  specifications: {
    shape_and_orientation: null | string
    average_height: {
      cm: null | number
    }
  }
  growth: {
    spread: {
      cm: null | number
    }
  }
}

export interface PlantListResponse {
  data: PlantSnippet[]
  links: PageLinks
  meta: {
    total: number
  }
}

export interface Plant extends PlantSnippet {
  main_species_id: number
  main_species: MainSpecies
}

export interface PlantResponse {
  data: Plant
}

export interface PlantListPayload {
  page: number
  filter: string
  query: string
  newSearch: boolean
}

export interface PageLinkPayload {
  page: number
  apiLink: string
}

export interface RootState {
  garden: {}
  grow: {}
  window: {}
}

export interface GardenState {
  plantList: PlantSnippet[]
  pageLinks: PageLinks
  activePlant: Plant | null
  currentPage: number
  lastPage: number
  pageCache: Record<number, PlantListResponse>
  plantCache: Record<number, Plant>
  loading: {
    plantList: boolean
    plant: boolean
  }
}

export interface WindowState {
  widgets: WidgetState[]
}

export interface WidgetState {
  name: string
  icon?: string
  order: number
  open: boolean
  docked: boolean
  inMenu: boolean
}

export const WidgetStateOptionals = ["open", "docked", "inMenu"] as const

export interface WidgetStateProp {
  name: string
  icon?: string
  order?: number
  open?: boolean
  docked?: boolean
  inMenu?: boolean
}

export const DefaultWidget = {
  open: true,
  docked: true,
  inMenu: true
}
