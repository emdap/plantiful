import {
  Position,
  PlantOptions,
  Plant,
  GrowBranch,
  BranchOutOptions,
  FlowerOptions,
  LeafClusterOptions
} from "@/store/interfaces"
import {
  DEFAULT_PLANT_OPTIONS,
  DEFAULT_LEAF_SIZE,
  NO_ROTATION
} from "@/fixtures/Grow/Defaults"
import colorConverter from "css-color-converter"

function radians(angle: number): number {
  return (angle * Math.PI) / 180
}

function getBranchEndPoint(
  height: number,
  radians: number,
  startPoint: Position
): Position {
  // find out where the end of the branch is,
  // given its dimensions and angle/tilt

  const x = parseFloat((height * Math.sin(radians) + startPoint.x).toFixed(2))
  // positioning elements based on top
  // increase in y -> in CSS, closer to top = smaller top coord
  const y = parseFloat((height * Math.cos(radians) + startPoint.y).toFixed(2))

  return { x, y }
}

function getLeafWidth(height: number, sides: number): number {
  return Math.round(2 * height * Math.tan((Math.PI * 1) / (2 * sides)))
}

function incrementColor(value: number, increment: number) {
  // want to avoid having white, as won't show up
  return Math.min(Math.max(value + increment, 0), 220)
}

function varyColors(baseColors: string[]) {
  const colors = [] as string[]
  for (let i = 0; i < baseColors.length; i++) {
    const colorRGB = colorConverter.fromString(baseColors[i]).toRgbaArray() // returns [r, g, b, a (alpha)]
    // want to avoid white -- won't show up!
    const same =
      `rgba(` +
      `${Math.min(colorRGB[0], 240)}, ` +
      `${Math.min(colorRGB[1], 240)}, ` +
      `${Math.min(colorRGB[2], 240)}, ` +
      `1)`
    const lighter =
      `rgba(` +
      `${incrementColor(colorRGB[0], 50)}, ` +
      `${incrementColor(colorRGB[1], 50)}, ` +
      `${incrementColor(colorRGB[2], 50)}, ` +
      `1)`
    const darker =
      `rgba(` +
      `${incrementColor(colorRGB[0], -50)}, ` +
      `${incrementColor(colorRGB[1], -50)}, ` +
      `${incrementColor(colorRGB[2], -50)}, ` +
      `1)`
    colors.push(lighter, same, darker)
  }
  return colors
}

function getPlantOptions(plant: Plant, convertColors: boolean): PlantOptions {
  const plantOrientation =
    plant.main_species.specifications.shape_and_orientation
  const plantHeight = plant.main_species.specifications.average_height.cm
  const plantSpread = plant.main_species.growth.spread.cm
  const plantFlowers = plant.main_species.flower.color
  const plantLeaves = plant.main_species.foliage

  let leafColors = plantLeaves.color
    ? plantLeaves.color
    : DEFAULT_PLANT_OPTIONS.leafColors
  let flowerColors = plantFlowers
    ? plantFlowers
    : DEFAULT_PLANT_OPTIONS.flowerColors
  if (convertColors) {
    leafColors = varyColors(leafColors)
    flowerColors = varyColors(flowerColors)
  }

  return {
    orientation: plantOrientation
      ? plantOrientation
      : DEFAULT_PLANT_OPTIONS.orientation,
    height: plantHeight ? plantHeight : DEFAULT_PLANT_OPTIONS.height,
    spread: plantSpread ? plantSpread : DEFAULT_PLANT_OPTIONS.spread,
    flowerColors,
    leafColors,
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
  const randomDiff = Math.random() * 15 // add up to 15 degrees variance
  let newAngle = 0
  if (direction == "left") {
    newAngle = Math.round(Math.max(baseAngle - randomDiff - 25, -65))
  } else {
    newAngle = Math.round(Math.min(baseAngle + randomDiff + 25, 65))
  }
  return newAngle
}

function forceBranchEnd(
  options: BranchOutOptions,
  baseAngle: number
): {
  forceLeft: false | "leafCluster" | "flower"
  forceRight: false | "leafCluster" | "flower"
} {
  const { order, heightLeft, widthLeft } = options
  let forceLeft!: false | "leafCluster" | "flower",
    forceRight!: false | "leafCluster" | "flower",
    forceOuter!: boolean
  // widthLeft constraint causing plants to be too short if they had low spread TODO: best way to tackle?
  if (heightLeft <= 0 || widthLeft <= 0) {
    // want top branches to usually have leaf cluster
    const leafCluster = Math.random() <= 0.8
    forceLeft = forceRight = leafCluster ? "leafCluster" : "flower"
  } else if (baseAngle == 0) {
    forceLeft = forceRight = false
  } else {
    // likelihood of leaf increases as: order increases, height decreases, width decreases
    const heightWeight = 0.7
    const widthWeight = 1 - heightWeight
    const orderFactor = 10
    const probDenom =
      1 +
      (heightLeft * heightWeight + widthLeft * widthWeight) /
        (order * orderFactor)
    const forceEndProb = Math.random() <= 1 / probDenom

    // want branches along outer edge to be more likely to end
    if (forceEndProb) {
      const outerProb = 0.7
      forceOuter = Math.random() <= outerProb
      // want inner branches to usually have flower
      const flower = Math.random() <= 0.8
      forceLeft =
        forceOuter && baseAngle < 0
          ? flower
            ? "flower"
            : "leafCluster"
          : false
      forceRight = forceLeft ? false : flower ? "flower" : "leafCluster"
    }
  }
  return { forceLeft, forceRight }
}

export function getBranchOptionBounds(plantOptions: PlantOptions) {
  // TODO: tinker with this to create tighter/wider plants based on plant.orientation
  // add more base branches the taller the plant is, up to 5
  let totalBaseBranches = Math.min(Math.ceil(plantOptions.height / 100), 5)
  // want there to be center branch
  if (totalBaseBranches % 2 == 0) {
    totalBaseBranches++
  } else if (plantOptions.spread <= 20) {
    // low spread, force 1 base branch
    totalBaseBranches = 1
  }
  const midBranch = Math.floor(totalBaseBranches / 2)

  // angle range is -angleMax -> +angleMax
  let angleMax!: number, angleInc!: number
  if (totalBaseBranches == 1) {
    angleMax = angleInc = 0
  } else {
    angleMax = 45
    angleInc = Math.ceil((angleMax * 2) / (totalBaseBranches - 1))
  }
  const maxHeight = Math.min(plantOptions.height, 800)
  const maxSideSpread = Math.min(plantOptions.spread / 2, 450) // spreads in two directions

  const maxBranchHeight = Math.min(Math.max(maxHeight / 4, 50), 150)
  const branchWidth = 5
  // can split this up into leaf/flower size later, if flowers are bigger/smaller
  const { topHeight, bottomHeight } = DEFAULT_LEAF_SIZE[
    plantOptions.leafTexture
  ]
  // want to stop growing a branch + add a growth once its height + growthSize is the max
  const growthHeight = topHeight + bottomHeight

  return {
    totalBaseBranches,
    midBranch,
    angleMax,
    angleInc,
    maxHeight,
    maxSideSpread,
    maxBranchHeight,
    branchWidth,
    growthHeight
  }
}

function loopClusterHelper(
  colors: string[],
  sides: number,
  area: number,
  attachOptions: { [key: string]: number }
) {
  const adjustedSides = Math.max(3, sides)
  const angleInc = area / (adjustedSides - 1) // how much to increment the rotation of each leaf/petal

  const optionsList = []
  for (let i = 0; i < sides; i++) {
    const colorIndex = Math.floor(Math.random() * colors.length) // choose a random color
    const color = colors[colorIndex]

    // shift i to be between -(adjustedSides-1)/2 , (adjustedSides-1)/2
    const shiftedI = i - (adjustedSides - 1) / 2
    const angle = angleInc * shiftedI
    const rotation = { ...NO_ROTATION(), z: angle }

    const options = {
      color,
      rotation,
      ...attachOptions
    }

    optionsList.push(options)
  }
  return optionsList
}

function createClusterHelper(
  order: number,
  baseBranch: GrowBranch,
  size: number,
  childList: "petals" | "leaves",
  optionsRef: FlowerOptions | LeafClusterOptions
) {
  // properties based on baseBranch
  const rotation = baseBranch.rotation
  const position = baseBranch.endPoint
  const zIndex = baseBranch.zIndex + 1
  const offSet = baseBranch.offSet

  const baseCluster = {
    id: 0,
    order,
    rotation,
    position,
    zIndex,
    offSet,
    height: size,
    width: size,
    transitionSpeed: 0.5
  }

  if (childList == "petals") {
    return {
      ...baseCluster,
      petals: [],
      color: (optionsRef as FlowerOptions).centerColor,
      optionsReference: optionsRef as FlowerOptions
    }
  }
  return {
    ...baseCluster,
    leaves: [],
    optionsReference: optionsRef as LeafClusterOptions
  }
}

export default {
  radians,
  getBranchEndPoint,
  getLeafWidth,
  getPlantOptions,
  getBranchAngle,
  forceBranchEnd,
  getBranchOptionBounds,
  loopClusterHelper,
  createClusterHelper,
  varyColors
}
