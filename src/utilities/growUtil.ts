import {
  GrowBorder,
  TopGrowBorder,
  GrowShape,
  Coordinate,
  PlantOptions,
  Plant,
  LeafOptions,
  LeafTexture,
  BranchOptions
} from "@/store/interfaces"
import {
  NO_ROTATION,
  NO_POSITION,
  DEFAULT_PLANT_OPTIONS,
  DEFAULT_LEAF_OPTIONS,
  DEFAULT_LEAF_TEXTURE,
  BRANCH_INIT
} from "@/fixtures/Grow/Defaults"

function radians(angle: number): number {
  return (angle * Math.PI) / 180
}

function getBranchEndPoint(
  height: number,
  radians: number,
  startPoint: Coordinate
): Coordinate {
  // find out where the end of the branch is,
  // given its dimensions and angle/tilt

  const x = height * Math.sin(radians) + startPoint.x
  // positioning elements based on top
  // increase in y -> in CSS, closer to top = smaller top coord
  const y = height * Math.cos(radians) + startPoint.y

  return { x, y }
}

function topLeafBorder(width: number, height: number): TopGrowBorder {
  return {
    left: {
      size: width / 2,
      show: false
    },
    right: {
      size: width / 2,
      show: false
    },
    bottom: {
      size: height,
      show: true
    }
  }
}

function bottomLeafBorder(width: number, height: number): GrowBorder {
  return {
    left: {
      size: width / 2,
      show: false
    },
    right: {
      size: width / 2,
      show: false
    },
    top: {
      size: height,
      show: true
    }
  }
}

function getLeafWidth(height: number, sides: number): number {
  return Math.round(2 * height * Math.tan((Math.PI * 1) / (2 * sides)))
}

function leafTemplate(
  color: string,
  topBorder: TopGrowBorder,
  bottomBorder: GrowBorder
): GrowShape[] {
  return [
    {
      color,
      rotation: NO_ROTATION(),
      position: NO_POSITION(),
      height: 0,
      width: 0,
      border: topBorder
    },
    {
      color,
      rotation: NO_ROTATION(),
      position: {
        y: topBorder.bottom.size - 1,
        x: 0
      },
      height: 0,
      width: 0,
      border: bottomBorder
    }
  ]
}

function getBranchOptions(options?: BranchOptions) {
  // mostly moved this here for consistency
  if (!options) {
    return BRANCH_INIT()
  }
  return options
}

function getLeafOptions(options?: {
  texture?: LeafTexture
  custom?: LeafOptions
}): LeafOptions {
  let leafOptions!: LeafOptions
  if (options?.custom) {
    leafOptions = options.custom
  } else if (options?.texture) {
    leafOptions = DEFAULT_LEAF_OPTIONS[options.texture]
  } else {
    leafOptions = DEFAULT_LEAF_OPTIONS[DEFAULT_LEAF_TEXTURE]
  }

  return leafOptions
}

function getPlantOptions(plant?: Plant): PlantOptions {
  if (!plant) {
    return DEFAULT_PLANT_OPTIONS
  }
  const plantOrientation =
    plant.main_species.specifications.shape_and_orientation
  const plantHeight = plant.main_species.specifications.average_height.cm
  const plantSpread = plant.main_species.growth.spread.cm
  const plantFlowers = plant.main_species.flower.color
  const plantLeaves = plant.main_species.foliage

  return {
    orientation: plantOrientation
      ? plantOrientation
      : DEFAULT_PLANT_OPTIONS.orientation,
    height: plantHeight ? plantHeight : DEFAULT_PLANT_OPTIONS.height,
    spread: plantSpread ? plantSpread : DEFAULT_PLANT_OPTIONS.spread,
    flowerColors: plantFlowers
      ? plantFlowers
      : DEFAULT_PLANT_OPTIONS.flowerColors,
    leafColors: plantLeaves.color
      ? plantLeaves.color
      : DEFAULT_PLANT_OPTIONS.leafColors,
    leafTexture: plantLeaves.texture
      ? plantLeaves.texture
      : DEFAULT_PLANT_OPTIONS.leafTexture,
    leafDensity: DEFAULT_PLANT_OPTIONS.leafDensity
  }
}

export default {
  radians,
  getBranchEndPoint,
  topLeafBorder,
  bottomLeafBorder,
  getLeafWidth,
  leafTemplate,
  getLeafOptions,
  getPlantOptions,
  getBranchOptions
}
