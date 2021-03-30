import { Dimensions, GrowBasis, GrowBorder, GrowPosition, Plant, Rotation, LeafTexture, LeafOptions } from "@/store/interfaces"

// const defaultGrowBasis: GrowBasis = {
// position: "relative",
// height
// }

const DEFAULT_TOP_H = 30
const DEFAULT_BOTTOM_H = 45

export const DEFAULT_OPTIONS: {[key in LeafTexture]: LeafOptions} = {
  fine: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 3,
    sides: 3,
    area: 90
  },
  medium: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 2,
    sides: 8,
    area: 360
  },
  coarse: {
    topHeight: DEFAULT_TOP_H,
    bottomHeight: DEFAULT_BOTTOM_H,
    spacing: 1,
    sides: 5,
    area: 270
  },
}

export const DEFAULT_TEXTURE: LeafTexture = "medium"


export const noRotation = () => {
  return {
    x: 0,
    y: 0,
    z: 0,
    translate: 0,
  }
}

export const noPosition = () => {
  return {
    top: 0,
    left: 0
  }
}

export const entityInit: GrowBasis = {
  position: {
    bottom: 0
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
    translate: 0,
  },
  height: 100,
  width: 100
}

export const testPlant: Plant = {
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
    foliage: { texture: "fine", color: ["grey"] },
    specifications: {
      average_height: { cm: 100 },
      shape_and_orientation: "Erect"
    },
    growth: { spread: { cm: null } },
    family: "Poaceae"
  }
}
