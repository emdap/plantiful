import { GrowBasis, GrowBorder, Plant } from "@/store/interfaces"

// const defaultGrowBasis: GrowBasis = {
// position: "relative",
// height
// }

export const triangleBorder: GrowBorder = {
  top: {
    size: 25,
    show: false
  },
  right: {
    size: 50,
    show: true
  },
  bottom: {
    size: 25,
    show: false
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

export const triangleBasis: GrowBasis = {
  position: {
    bottom: 0
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
    translate: 0,
  },
  height: 0,
  width: 0
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
