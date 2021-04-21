// TODO: separate into diff files, understand more about typescript interfaces/types best practices and standardize

import { VueConstructor } from "vue/types/umd"

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

export interface GridState {
  containers: {
    [key: string]: GridContainer
  }
  widgets: {
    [key: string]: GridWidget
  }
  zones: {
    [key: number]: GridZone
  }
  activeWidget: GridWidget | null
  activeZone: GridZone | null
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
  showControls: boolean
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
  position?: Position
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
  flowers: number[]
  branches: number[]
}

export interface GrowCluster<T> extends GrowEntity<T> {
  offSet: GrowOffSet
  position: Position
  order: number
}

export interface GrowLeafCluster extends GrowCluster<LeafClusterOptions> {
  leaves: number[]
}

export interface GrowFlower extends GrowCluster<FlowerOptions> {
  color: string
  petals: number[]
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
  clustersWithLeaves: { leafCluster: GrowLeafCluster; leaves: GrowLeaf[] }[]
  flowersWithPetals: { flower: GrowFlower; petals: GrowPetal[] }[]
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
  flowersWithPetals: {
    flower: GrowFlower
    petals: GrowPetal[]
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

type ControlBase<Type> = {
  property: keyof Type
  text: string
  verify?: VerifyBounds
}

export type VerifyBounds = {
  lowerBound: number
  upperBound: number
}

export interface Control<Type> extends ControlBase<Type> {
  dataType: typeof ControlInputTypes[number]
}

export interface DropdownControl<Type> extends ControlBase<Type> {
  dataType: "dropdown"
  options: readonly string[] | readonly number[]
}

export type NestedControl<Parent, Child> = {
  property: keyof Parent
  text: string
  children: Control<Child>[]
}

export type AnyControl<Parent, Child> =
  | Control<Parent>
  | DropdownControl<Parent>
  | NestedControl<Parent, Child>

export type ControlList<Parent, Child = {}> = AnyControl<Parent, Child>[]

// Grid
export interface GridWidget {
  name: string
  component: VueConstructor<Vue>
  text: string
  open: boolean
  docked: boolean
  height: number
  width: number
  position: Position
  defaultZone: number
  currentZone?: number
}

export const MenuGroups = [
  "Find Plants",
  "Create Plants",
  "Information"
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
  "z-5"
] as const

export interface GridContainer {
  id: number
  name: string // for DOM element ID
  zones: number[]
}

export interface GridZone {
  id: number
  width: number
  height: number
  gridArea: typeof GridContainerAreas[number]
  widgets: string[]
  startPoint: Position
  endPoint: Position
}

// Constants & types

export type Dimensions = "height" | "width"
