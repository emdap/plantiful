// TODO: separate into diff files, understand more about typescript interfaces/types best practices and standardize

import { VueConstructor } from "vue/types/umd"

export interface JWTResponse {
  token: string
  expiration: string
}

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
  plantCache: Record<number | string, Plant>
  loading: {
    plantList: boolean
    plant: boolean
  }
}

export interface GridState {
  containers: {
    [key: number]: GridContainer
  }
  widgets: {
    [key: string]: GridWidget
  }
  zones: {
    [key: number]: GridZone
  }
  overallHeight: number
  overallWidth: number
  activeWidget: GridWidget | null
  targetZone: GridZone | null
  movingZones: boolean
}

export type GrowType =
  | GrowPlant
  | GrowBranch
  | GrowLeafCluster
  | GrowLeaf
  | GrowFlower
  | GrowPetal
export type GrowDataKey =
  | "plants"
  | "branches"
  | "leafClusters"
  | "leaves"
  | "flowers"
  | "petals"

export type GrowData<Type> = {
  [key: number]: Type
}

export interface GrowState {
  plants: GrowData<GrowPlant>
  branches: GrowData<GrowBranch>
  leafClusters: GrowData<GrowLeafCluster>
  leaves: GrowData<GrowLeaf>
  flowers: GrowData<GrowFlower>
  petals: GrowData<GrowPetal>
  activeGrowPlant: GrowPlant | null
  activeEntity: GrowEntity | null
  activeEntityType: GrowDataKey | null
  highlightEntity: number | null
  highlightEntityType: GrowDataKey | null
  showControls: boolean
  maxBranches: number
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
  main_species_id: number | string
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
  value?: number | string | string[] | null
}

// Types
export const LeafTextureValues = ["fine", "medium", "coarse"] as const
export type LeafTexture = typeof LeafTextureValues[number]
export const PlantOrientationValues = [
  "erect",
  "semi-erect",
  "decumbent",
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
  position?: Position
  height: number
  width: number
  zIndex: number
}

export interface GrowEntity<OptionsType = {}> extends GrowBasis {
  id: number
  optionsReference: OptionsType
  deleted?: boolean
}

export interface GrowPlant extends GrowEntity<PlantOptions> {
  name: string
  plantId: number
  showName: boolean
  leafClusters: number[]
  flowers: number[]
  branches: number[]
  zoom: number
}

export interface CustomGrowPlant {
  name: string
  height: number
  spread: number
  flowerColors: string[]
  leafColors: string[]
  leafTexture: LeafTexture
}

export interface GrowCluster<T> extends GrowEntity<T> {
  offSet: GrowOffSet
  position: Position
  order: number
  children: number[]
}

export interface GrowLeafCluster extends GrowCluster<LeafClusterOptions> {
  children: number[]
}

export interface GrowFlower extends GrowCluster<FlowerOptions> {
  color: string
}

export interface GrowLeaf extends GrowEntity<LeafOptions> {
  position: Position
  shapes: GrowShape[]
  order: number
}

export interface GrowPetal extends GrowEntity<PetalOptions> {
  position: Position
  shapes: GrowShape[]
  order: number
}

export interface GrowBranch extends GrowEntity<BranchOptions> {
  id: number
  position: Position
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
  position: Position
  border: GrowBorder
  color: string
  opacity?: number
}

export type BranchOutGlobals = {
  branches: GrowBranch[]
  clustersWithLeaves: { leafClusters: GrowLeafCluster; leaves: GrowLeaf[] }[]
  flowersWithPetals: { flowers: GrowFlower; petals: GrowPetal[] }[]
  plantOptions: PlantOptions
}

export type BranchOutOptions = {
  order: number
  zIndex: number
  heightLeft: number
  widthLeft: number
}

export type GrowEntitySnippet = {
  [key in GrowControlKeys]?: GrowType[keyof GrowType] | GrowShape[] | number[]
}

export type GrowOptionsSnippet = {
  [key in GrowOptionsControlKeys]?:
    | string
    | number
    | number[]
    | string[]
    | Position
}

export interface PetalOptions {
  color: string
  width: number
  height: number
  rotation: Rotation
}

export interface LeafOptions {
  color: string
  topHeight: number
  bottomHeight: number
  width: number
  rotation: Rotation
}

export interface ClusterOptions {
  colors: string[]
  spacing: number
  sides: number
  area: number
}

export interface LeafClusterOptions extends ClusterOptions {
  texture: LeafTexture
}

export interface FlowerOptions extends ClusterOptions {
  centerColor: string
}

export interface BranchOptions {
  startPoint: Position
  branchHeight: number
  branchWidth: number
  angle: number
  growthHeight: number
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

// TODO: convert all height/width instances to this D:
export interface Size {
  height: number
  width: number
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
    leafClusters: GrowLeafCluster
    leaves: GrowLeaf[]
  }[]
  flowersWithPetals: {
    flowers: GrowFlower
    petals: GrowPetal[]
  }[]
  plant:
    | GrowPlant
    | { height: number; width: number; optionsReference: PlantOptions }
}

// Controls
export const ControlInputTypes = [
  "number",
  "color-list",
  "color",
  "text",
  "dropdown",
] as const

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
  | keyof PetalOptions

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

export type VerifyBounds = {
  lowerBound: number
  upperBound: number
}

type ControlBase<Type> = {
  property: keyof Type
  text: string
  verify?: VerifyBounds
  placeholder?: string
}

interface DataControl<Type> extends ControlBase<Type> {
  dataType: typeof ControlInputTypes[number]
}

interface PropertyControl<Type> extends ControlBase<Type> {
  propertyOn: "entity" | "options"
  order: number
}

// export interface Control<Type> extends DataControl<Type> {
//   dataType: typeof ControlInputTypes[number]
// }

export type Control<Type> = DataControl<Type> & PropertyControl<Type>

export interface DropdownControl<Type>
  extends DataControl<Type>,
    PropertyControl<Type> {
  dataType: "dropdown"
  options: readonly string[] | readonly number[]
}

export interface NestedControl<Parent, Child> extends PropertyControl<Parent> {
  propertyOn: "entity" | "options"
  order: number
  children: DataControl<Child>[]
}

export type AnyControl<Parent, Child> =
  | Control<Parent>
  | DropdownControl<Parent>
  | NestedControl<Parent, Child>

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ControlList<Parent = any, Child = any> = AnyControl<Parent, Child>[]

// Grid
export interface GridWidget {
  name: string
  component: VueConstructor<Vue>
  text: string
  open: boolean
  docked: boolean
  size: Size
  position: Position
  defaultZone: number
  currentZone?: number
}

export const MenuGroups = [
  "Find Plants",
  "Create Plants",
  "Information",
] as const

export interface MenuWidget {
  widgetName: string
  icon: string
  group: typeof MenuGroups[number]
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

export const GridContainerAreas = [
  "z-0",
  "z-1",
  "z-2",
  "z-3",
  "z-4",
  "z-5",
] as const

export interface GridContainer {
  id: number
  name: string // for DOM element ID
  zones: number[]
  size: Size
  sizeRatio: Size
  columns: GridAreaDict
  rows: GridAreaDict
  zonesGrowing: boolean
}

export interface GridZone {
  id: number
  name: typeof GridContainerAreas[number] // for DOM element ID
  containerId: number
  size: Size
  sizeRatio: Size
  widgets: string[]
  color: string
  startPoint: Position
  endPoint: Position
  rows: number[]
  columns: number[]
  open: boolean
  mounted?: boolean
}

export const GridAxes = ["rows", "columns"] as const

export interface GridAreaDict {
  [key: number]: {
    sizeRatio: number
    zones: number[]
  }
}
