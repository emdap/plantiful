// TODO: separate into diff files, understand more about typescript interfaces/types best practices and standardize

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

export type GrowType =
  | GrowPlant
  | GrowBranch
  | GrowLeafCluster
  | GrowLeaf
  | GrowFlower
export type GrowDataKey =
  | "plants"
  | "branches"
  | "leafClusters"
  | "leaves"
  | "flowers"

export type GrowData<T> = {
  [key: number]: T
}

export interface GrowState {
  plants: GrowData<GrowPlant>
  branches: GrowData<GrowBranch>
  leafClusters: GrowData<GrowLeafCluster>
  leaves: GrowData<GrowLeaf>
  flowers: GrowData<GrowFlower>
  activeGrowPlant: GrowPlant | null
  activeEntity: GrowEntity | null
  activeEntityType: GrowDataKey | null
  growWindowActive: boolean
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

export interface LeafOptions {
  topHeight: number
  bottomHeight: number
  spacing: number
  sides: number
  area: number
}

export interface BranchOptions {
  height: number
  width: number
  angle: number
  hasLeaf: boolean
  hasFlower: boolean
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

export type Rotation = {
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
  position: Coordinate
  height: number
  width: number
}

export interface GrowEntity extends GrowBasis {
  id: number
}

export interface GrowPlant extends GrowEntity {
  name: string
  plantId: number
  showName: boolean
  leafClusters: number[]
  branches: number[]
}

export interface GrowLeafCluster extends GrowEntity {
  offSet: GrowOffSet
  leaves: number[]
}

export interface GrowLeaf extends GrowEntity {
  id: number
  shapes: GrowShape[]
}

export interface GrowFlower extends GrowEntity {
  id: number
  shapes: GrowShape[]
}

export interface GrowBranch extends GrowEntity {
  id: number
  offSet: GrowOffSet
  startPoint: Coordinate
  endPoint: Coordinate
  hasLeaf: boolean
  hasFlower: boolean
  // the height/width of the rotated branch
  // normal height/width properties are the actual size of the containing rectangle
  branchHeight: number
  branchWidth: number
  branchPosition: Coordinate
}

export interface GrowShape extends GrowBasis {
  border: GrowBorder
  color: string
  opacity?: number
}

export interface GrowOffSet {
  top: number
  left: number
}

export type Coordinate = {
  x: number
  y: number
}

export interface BorderAttribute {
  size: number
  show: boolean
}

export interface GrowBorder {
  top?: BorderAttribute
  right: BorderAttribute
  bottom?: BorderAttribute
  left: BorderAttribute
}

export interface TopGrowBorder extends GrowBorder {
  bottom: BorderAttribute
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
