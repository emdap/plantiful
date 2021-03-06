import { LeafTexture, PlantOptions } from "@/store/interfaces"

const DEFAULT_TOP_H = 30
const DEFAULT_BOTTOM_H = 45

export const DEFAULT_FLOWER_HEIGHT = 15

export const DEFAULT_FLOWER = {
  spacing: -2,
  sides: 9,
  area: 360,
  centerColor: "red",
}

export const DEFAULT_LEAF_SIZE: {
  [key in LeafTexture]: { topHeight: number; bottomHeight: number }
} = {
  fine: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
  },
  medium: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
  },
  coarse: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
  },
}

export const DEFAULT_LEAF_CLUSTER_SPREAD: {
  [key in LeafTexture]: { spacing: number; sides: number; area: number }
} = {
  coarse: {
    spacing: 25,
    sides: 3,
    area: 90,
  },
  medium: {
    spacing: 15,
    sides: 4,
    area: 90,
  },
  fine: {
    spacing: 15,
    sides: 5,
    area: 90,
  },
}

export const DEFAULT_LEAF_TEXTURE: LeafTexture = "medium"

export const DEFAULT_PLANT_OPTIONS: PlantOptions = {
  height: 200,
  spread: 200,
  flowerColors: ["orange", "magenta", "yellow"],
  leafColors: ["green", "lime", "purple", "aqua", "blue"],
  leafTexture: DEFAULT_LEAF_TEXTURE,
  orientation: "ERECT", // common on the API :)
  leafDensity: 5,
}
