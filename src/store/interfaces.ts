import Vue from "vue"

// States/stores
export interface RootState {
  garden: {}
  grow: {}
  container: {}
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

export interface GrowState {
  entities: GrowEntity[]
  activeEntity: GrowEntity | null
  showControls: boolean
  hasKeyListeners: boolean
}

export interface ContainerState {
  widgets: WidgetEntity[]
}

// Plants
export interface PlantSnippet {
  id: number
  common_name: string
  scientific_name: string
  family_common_name: string
  family: string
  image_url: string
}

export interface Plant extends PlantSnippet {
  main_species_id: number
  main_species: MainSpecies
}

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

export interface ActivePlantInfo {
  text: string
  value?: number | string | null
}

// Types
export type LeafTexture = "fine" | "medium" | "coarse"

// API responses
export interface PlantListResponse {
  data: PlantSnippet[]
  links: PageLinks
  meta: {
    total: number
  }
}

export interface PlantResponse {
  data: Plant
}

// Function payloads
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

// General
export interface Filter {
  [key: string]: string[]
}

export interface FilterParams {
  filter?: Filter
  filter_not?: Filter
}

export interface PageButton {
  text: string
  nav: PageLinkKey
}

// Types
export type FilterType = "filter" | "filter_not"

export type PageLinkKey = "first" | "prev" | "next" | "last"

export type PageLinks = {
  [key in PageLinkKey]?: string
}

// Used for both widgets and grow
export interface InteractableBasis {
  rotation?: Rotation
  transitionSpeed?: number
  zIndex?: number
  tabIndex?: number
}

export interface Rotation {
  x: number
  y: number
  z: number
  translate: number
}

export type RequiredPositions = "top" | "left"

export type Positions = RequiredPositions | "right" | "bottom"

// Widgets and grow have similar attributes
// but are different in what is required
// and how the user is allowed to change/move them

// Grow
export interface GrowBasis extends InteractableBasis {
  rotation: Rotation
  position: GrowPosition
  height: number
  width: number
}

export interface GrowEntity extends GrowBasis {
  name: string
  id: string // plant id - instance of plant id
  plantId: number
  shapes: GrowShape[]
  // startX: number | null
  // startY: number | null
  // trackRotation: boolean
}

export interface GrowShape extends GrowBasis {
  border: GrowBorder
  color: string
  opacity?: number
}

export type GrowPosition = {
  [key in Positions]?: number
}

export interface BorderAttribute {
  size: number
  show: boolean
}

export interface GrowBorder {
  top?: BorderAttribute
  right?: BorderAttribute
  bottom?: BorderAttribute
  left?: BorderAttribute
}

// Widgets
export interface WidgetEntity {
  name: string
  icon?: string
  order?: number
  open: boolean
  docked: boolean
  inMenu: boolean
}

// these are used to style the widget. Leave blank = that attribute is not styled
export interface WidgetDisplay {
  flexGrow?: boolean
  showOverflow?: boolean
  top?: number | string
  left?: number | string
  height?: number | string
  width?: number | string
  minHeight?: number
  minWidth?: number
}

export interface WidgetInit {
  entity: WidgetEntity
  display: WidgetDisplay
}

export type WidgetPosition = {
  [key in RequiredPositions]: number | string
}

export interface WidgetBasis extends InteractableBasis {
  position: WidgetPosition
  height: number | string | undefined
  width: number | string | undefined
}

// Constants & types
export const WidgetStateOptionals = ["open", "docked", "inMenu"] as const

export const DefaultWidget = {
  open: false,
  docked: false,
  inMenu: false
}

export type Dimensions = "height" | "width"
