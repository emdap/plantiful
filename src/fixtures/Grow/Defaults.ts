import { GrowBasis, Plant, LeafTexture, LeafOptions, BranchOptions, PlantOptions } from "@/store/interfaces"

const DEFAULT_TOP_H = 30
const DEFAULT_BOTTOM_H = 45

export const DEFAULT_LEAF_OPTIONS: {[key in LeafTexture]: LeafOptions} = {
  fine: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 3,
    sides: 3,
    area: 90
  },
  medium: {
    color: "purple",
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 15,
    sides: 4,
    area: 90
  },
  coarse: {
    color: "orange",
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 5,
    sides: 5,
    area: 90
  },
}

export const DEFAULT_PLANT_OPTIONS: PlantOptions = {
  height: 500,
  spread: 300,
  colors: ["green", "lime", "purple", "aqua", "blue"],
  orientation: "ERECT", // common on the API :)
  leafDensity: 5
}

export const DEFAULT_LEAF_TEXTURE: LeafTexture = "medium"
export const DEFAULT_COLOR = "lime"

export const BRANCH_INIT = (): BranchOptions => {
  return {
    height: 100,
    width: 5,
    angle: 45,
    hasLeaf: false,
    hasFlower: false,
  }
}

export const NO_ROTATION = () => {
  return {
    x: 0,
    y: 0,
    z: 0,
    translate: 0,
  }
}

export const NO_POSITION = () => {
  return {
    y: 0,
    x: 0
  }
}

export const PLANT_ENTITY_INIT = (): GrowBasis => {
  return {
    position: {
      y: 100,
      x: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      translate: 0,
    },
    height: 0,
    width: 200
  }
}

export const TEST_PLANT: Plant = {
  id: 137442,
  common_name: "common velvetgrass",
  scientific_name: "Holcus lanatus",
  main_species_id: 143075,
  image_url:
    "https://bs.plantnet.org/image/o/46619775d4319328b2fad6f1ba876ccca2d03534",
  family_common_name: "Grass family",
  family: "Poaceae",
  main_species: {
    id: 143075,
    common_name: "Common velvetgrass",
    scientific_name: "Holcus lanatus",
    family_common_name: "Grass family",
    image_url:
      "https://bs.plantnet.org/image/o/46619775d4319328b2fad6f1ba876ccca2d03534",
    flower: { color: ["purple"] },
    foliage: { texture: "fine", color: ["purple"] },
    specifications: {
      average_height: { cm: 100 },
      shape_and_orientation: "Erect"
    },
    growth: { spread: { cm: null } },
    family: "Poaceae"
  }
}
