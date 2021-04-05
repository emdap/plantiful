import { GrowBasis, Plant, LeafTexture, LeafOptions, BranchOptions, PlantOptions } from "@/store/interfaces"

const DEFAULT_TOP_H = 30
const DEFAULT_BOTTOM_H = 45

export const DEFAULT_LEAF_OPTIONS: {[key in LeafTexture]: LeafOptions} = {
  fine: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 25,
    sides: 3,
    area: 90
  },
  medium: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 15,
    sides: 4,
    area: 90
  },
  coarse: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 15,
    sides: 5,
    area: 90
  },
}

export const DEFAULT_LEAF_TEXTURE: LeafTexture = "medium"

export const DEFAULT_PLANT_OPTIONS: PlantOptions = {
  height: 200,
  spread: 200,
  flowerColors: ["pink", "magenta", "yellow"],
  leafColors: ["green", "lime", "purple", "aqua", "blue"],
  leafTexture: DEFAULT_LEAF_TEXTURE,
  orientation: "ERECT", // common on the API :)
  leafDensity: 5
}

export const BRANCH_INIT = (): BranchOptions => {
  return {
    startPoint: NO_POSITION(),
    height: 50,
    width: 5,
    angle: 45,
    hasLeaf: false,
    hasFlower: false,
    zIndex: 10,
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
    width: 200,
    zIndex: 10
  }
}

export const TEST_PLANT: Plant = {
  // I modified this
  id: 137442,
  common_name: "Dream plant",
  scientific_name: "Holcus lanatus",
  main_species_id: 143075,
  image_url:
    "https://bs.plantnet.org/image/o/46619775d4319328b2fad6f1ba876ccca2d03534",
  family_common_name: "Grass family",
  family: "Poaceae",
  main_species: {
    id: 143075,
    common_name: "Default Plant",
    scientific_name: "Holcus lanatus",
    family_common_name: "Grass family",
    image_url:
      "https://bs.plantnet.org/image/o/46619775d4319328b2fad6f1ba876ccca2d03534",
    flower: { color: ["purple"] },
    foliage: { texture: "coarse", color: ["seagreen", "limegreen", "teal"] },
    specifications: {
      average_height: { cm: 250 },
      shape_and_orientation: "Erect"
    },
    growth: { spread: { cm: 70 } },
    family: "Poaceae"
  }
}
