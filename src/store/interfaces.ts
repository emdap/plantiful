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

export interface GrowBasis {
  position: GrowPosition
  rotation?: GrowRotation
  height: number | string
  width: number | string
  transitionSpeed?: number
  zIndex?: number
  tabIndex?: number
}

export interface GrowEntity extends GrowBasis {
  name: string
  id: number
  shapes: GrowShape[]
}

export interface GrowShape extends GrowBasis {
  border: GrowBorder
  color: string
  opacity?: number
}

export interface GrowPosition {
  top: number
  right?: number
  bottom?: number
  left: number
}

export interface GrowRotation {
  x: number
  y: number
  z: number
}

export interface GrowBorder {
  top: BorderAttribute
  right: BorderAttribute
  bottom: BorderAttribute
  left: BorderAttribute
}

export interface BorderAttribute {
  size: number
  visibility: boolean
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
  main_species: MainSpecies
}

export interface PlantResponse {
  data: Plant
}

export interface SearchPlantsPayload {
  page: number
  filter: string
  query: string
}

export interface RootState {
  garden: {}
  grow: {}
}
