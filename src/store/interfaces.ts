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

export interface ContainerState {
  widgets: {
    [key: string]: WidgetEntity
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

export type GrowData<Type> = {
  [key: number]: Type
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
export const LeafTextureValues = ["fine", "medium", "coarse"] as const
export type LeafTexture = typeof LeafTextureValues[number]
export const PlantOrientationValues = [
  "erect",
  "semi-erect",
  "decumbent"
] as const
export type PlantOrientation = typeof PlantOrientationValues[number]

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
  position: Position
  height: number
  width: number
  zIndex: number
}

export interface GrowEntity<OptionsType = {}> extends GrowBasis {
  id: number
  optionsReference: OptionsType
}

export interface GrowPlant extends GrowEntity<PlantOptions> {
  name: string
  plantId: number
  showName: boolean
  leafClusters: number[]
  branches: number[]
}

export interface GrowLeafCluster extends GrowEntity<LeafClusterOptions> {
  offSet: GrowOffSet
  leaves: number[]
  order: number
}

export interface GrowLeaf extends GrowEntity<LeafOptions> {
  shapes: GrowShape[]
  order: number
}

export interface GrowFlower extends GrowEntity<FlowerOptions> {
  id: number
  shapes: GrowShape[]
  order: number
}

export interface GrowBranch extends GrowEntity<BranchOptions> {
  id: number
  offSet: GrowOffSet
  startPoint: Position
  endPoint: Position
  hasLeaf: boolean
  hasFlower: boolean
  // the height/width of the rotated branch
  // normal height/width properties are the actual size of the containing rectangle
  branchHeight: number
  branchWidth: number
  branchPosition: Position
  order: number
  optionsReference: BranchOptions
}

export interface GrowShape extends GrowBasis {
  border: GrowBorder
  color: string
  opacity?: number
}

export type BranchOutGlobals = {
  branches: GrowBranch[]
  clustersWithLeaves: { leafCluster: GrowLeafCluster; leaves: GrowLeaf[] }[]
  plantOptions: PlantOptions
  // leafClusterOptions: LeafClusterOptions
}

export type BranchOutOptions = {
  order: number
  zIndex: number
  heightLeft: number
  widthLeft: number
}

export interface FlowerOptions {
  color: string
}

export interface LeafOptions {
  color: string
  topHeight: number
  bottomHeight: number
  width: number
  rotation: Rotation
}

export interface LeafClusterOptions {
  colors: string[]
  spacing: number
  sides: number
  area: number
  texture: LeafTexture
  // custom?: LeafOptions
}

export interface BranchOptions {
  startPoint: Position
  branchHeight: number
  branchWidth: number
  angle: number
  growthHeight: number
  // hasLeaf: boolean
  // hasFlower: boolean
  // zIndex: number
}

export interface PlantOptions {
  height: number
  spread: number
  flowerColors: string[]
  leafColors: string[]
  orientation: string
  leafTexture: LeafTexture
  leafDensity: number // not in API that i know of
}

export interface GrowOffSet {
  top: number
  left: number
}

export type Position = {
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

export interface GrowPlantReturn {
  branches: GrowBranch[]
  clustersWithLeaves: {
    leafCluster: GrowLeafCluster
    leaves: GrowLeaf[]
  }[]
  plant:
    | GrowPlant
    | { height: number; width: number; optionsReference: PlantOptions }
}

// Controls
export const ControlInputTypes = ["number", "color-list", "color"] as const

export type GrowControlKeys =
  | keyof GrowPlant
  | keyof GrowBranch
  | keyof GrowLeafCluster
  | keyof GrowFlower
export type GrowOptionsControlKeys =
  | keyof PlantOptions
  | keyof BranchOptions
  | keyof LeafClusterOptions
  | keyof LeafOptions
  | keyof FlowerOptions

export type GrowOptionsType =
  | PlantOptions
  | LeafOptions
  | LeafClusterOptions
  | BranchOptions
export type PossibleNestedControl =
  | Rotation
  | Position
  | (Rotation & Position)
  | {}

type ControlBase<Type> = {
  property: keyof Type
  text: string
}

export interface Control<Type> extends ControlBase<Type> {
  dataType: typeof ControlInputTypes[number]
}

export interface DropdownControl<Type> extends ControlBase<Type> {
  dataType: "dropdown"
  options: readonly string[] | readonly number[]
}

const plant = {} as GrowPlant
type test = keyof typeof plant.rotation

export type NestedControl<Parent, Child> = {
  property: keyof Parent
  text: string
  children: Control<Child>[]
}

// type ControlTypes = GrowPlant | GrowBranch | GrowLeafCluster | PlantOptions | LeafOptions

export type AnyControl<Parent, Child> =
  | Control<Parent>
  | DropdownControl<Parent>
  | NestedControl<Parent, Child>

export type ControlList<Parent, Child = {}> = AnyControl<Parent, Child>[]

// Widgets
export interface WidgetEntity {
  name: string
  text: string
  order: number // higher order = higher z index
  icon?: string
  open: boolean
  isDocked?: boolean
  launchDocked: boolean
  inMenu: boolean
  display: WidgetDisplay
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

// export interface WidgetInit {
//   entity: WidgetEntity
//   display: WidgetDisplay
// }

export type WidgetPosition = {
  [key in RequiredPositions]: number | string
}

// widget info that is NOT stored in state, modified directly from Widget.vue
export interface WidgetBasis extends InteractableBasis {
  position: WidgetPosition
  height: number | string | undefined
  width: number | string | undefined
  zIndex: number
}

// Constants & types
export const WidgetStateOptionals = ["open", "docked", "inMenu"] as const

export const DefaultWidget = {
  open: false,
  docked: false,
  inMenu: false
}

export type Dimensions = "height" | "width"
