import {
  GrowBorder,
  TopGrowBorder,
  GrowShape,
  Coordinate,
  PlantOptions,
  Plant,
  LeafOptions,
  LeafTexture,
  BranchOptions,
  GrowBranch
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
      border: topBorder,
      zIndex: 10
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
      border: bottomBorder,
      zIndex: 10
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

function generateLeafColors(baseColors: string[]) {
  if (baseColors.length == 1) {
    // TODO: better way to variate colors -> perhaps convert to hex/RGB value first
    return ["magenta", "lime", baseColors[0], "aqua"]
  }
  return baseColors
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
      ? generateLeafColors(plantLeaves.color)
      : DEFAULT_PLANT_OPTIONS.leafColors,
    leafTexture: plantLeaves.texture
      ? plantLeaves.texture
      : DEFAULT_PLANT_OPTIONS.leafTexture,
    leafDensity: DEFAULT_PLANT_OPTIONS.leafDensity
  }
}

function getBranchAngle(
  baseBranch: GrowBranch,
  direction: "right" | "left"
): number {
  const baseAngle = baseBranch.rotation.z
  let newAngle = 0
  if (direction == "left") {
    newAngle = Math.max(baseAngle - 25, -80)
  } else {
    newAngle = Math.min(baseAngle + 25, 80)
  }
  return newAngle
}

function forceLeaves(
  branchOrder: number,
  heightLeft: number,
  widthLeft: number,
  baseAngle: number
): {
  forceLeft: boolean
  forceRight: boolean
} {
  let forceLeft!: boolean, forceRight!: boolean, forceOuter!: boolean

  if (heightLeft <= 0 || widthLeft <= 0) {
    forceLeft = forceRight = true
  } else if (baseAngle == 0) {
    forceLeft = forceRight = false
  } else {
    // likelihood of leaf increases as: order increases, height decreases, width decreases
    const heightWeight = 0.7
    const widthWeight = 1 - heightWeight
    const orderFactor = 3
    const leafProbDenom =
      1 +
      (heightLeft * heightWeight + widthLeft * widthWeight) /
        (branchOrder * orderFactor)
    const forceLeaf = Math.random() <= 1 / leafProbDenom

    // want leaves along outer edge to be more likely
    if (forceLeaf) {
      const outerProb = 0.7
      forceOuter = Math.random() <= outerProb
      forceLeft = forceOuter && baseAngle < 0
      forceRight = !forceLeft
    }
  }
  return { forceLeft, forceRight }
}

export function getBranchOptionBounds(plantOptions: PlantOptions) {
  // TODO: tinker with this to create tighter/wider plants based on plant.orientation

  // add more base branches the taller the plant is, up to 5
  const totalBaseBranches = Math.min(Math.ceil(plantOptions.height / 100), 5)
  const midBranch = Math.floor(totalBaseBranches / 2)

  // angle range is -angleMax -> +angleMax
  let angleMax!: number, angleInc!: number
  if (totalBaseBranches == 1) {
    angleMax = angleInc = 0
  } else {
    angleMax = 45
    angleInc = Math.ceil((angleMax * 2) / (totalBaseBranches - 1))
  }
  const maxHeight = Math.min(plantOptions.height, 450)
  const maxSpread = plantOptions.spread / 2 // spreads in two directions

  const maxBranchHeight = Math.max(maxHeight / 3, 50)

  return {
    totalBaseBranches,
    midBranch,
    angleMax,
    angleInc,
    maxHeight,
    maxSpread,
    maxBranchHeight
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
  getBranchOptions,
  getBranchAngle,
  forceLeaves,
  getBranchOptionBounds
}
