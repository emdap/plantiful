import {
  DEFAULT_FLOWER,
  DEFAULT_FLOWER_HEIGHT,
  DEFAULT_LEAF_CLUSTER_SPREAD,
  DEFAULT_LEAF_SIZE,
  NO_POSITION,
  NO_ROTATION
} from "@/fixtures/Grow/Defaults"
import {
  LeafTexture,
  LeafOptions,
  GrowLeaf,
  GrowBranch,
  BranchOptions,
  Position,
  GrowLeafCluster,
  Plant,
  BranchOutGlobals,
  GrowPlant,
  LeafClusterOptions,
  PlantOptions,
  BranchOutOptions,
  PetalOptions,
  GrowPetal,
  FlowerOptions,
  GrowFlower
} from "@/store/interfaces"
import util from "../utilities/growUtil"
import templates from "../utilities/growTemplates"

export function processLeafOptions(options: LeafOptions) {
  const { color, topHeight, bottomHeight, width, rotation } = options

  const topBorder = templates.topLeafBorder(width, topHeight)
  const bottomBorder = templates.bottomLeafBorder(width, bottomHeight)
  const shapes = templates.leafTemplate(color, topBorder, bottomBorder)

  const height = topHeight + bottomHeight
  const position = { x: height / 2 - width / 2, y: 0 }

  return {
    shapes,
    height,
    width, // re-return even though not calculated, need to update when options update
    position,
    rotation
  }
}

export function createLeaf(order: number, options: LeafOptions): GrowLeaf {
  const { shapes, height, width, position, rotation } = processLeafOptions(
    options
  )

  const leaf: GrowLeaf = {
    id: 0,
    order,
    shapes,
    height,
    position,
    rotation,
    width,
    zIndex: 10,
    transitionSpeed: 0.5,
    optionsReference: options
  }

  return leaf
}

export function processPetalOptions(options: PetalOptions) {
  const { color, height, width, rotation } = options

  const border = templates.bottomLeafBorder(width, height)
  const shapes = templates.flowerTemplate(color, border)

  const position = { x: height / 2, y: 0 }

  return {
    shapes,
    height,
    width, // re-return even though not calculated, need to update when options update
    position,
    rotation
  }
}

export function createPetal(order: number, options: PetalOptions): GrowPetal {
  const { shapes, height, width, position, rotation } = processPetalOptions(
    options
  )

  const petal: GrowPetal = {
    id: 0,
    order,
    shapes,
    height,
    position,
    rotation,
    width,
    zIndex: 10,
    transitionSpeed: 0.5,
    optionsReference: options
  }

  return petal
}

export function processFlowerOptions(options: FlowerOptions) {
  const { colors, spacing, sides, area } = options

  const width = util.getLeafWidth(DEFAULT_FLOWER_HEIGHT, sides) - spacing
  const flowerHeight = DEFAULT_FLOWER_HEIGHT * 2 + 5

  const petalOptions = util.loopClusterHelper(colors, sides, area, {
    height: DEFAULT_FLOWER_HEIGHT,
    width
  }) as PetalOptions[]

  return { flowerHeight, petalOptions }
}

export function processLeafClusterOptions(
  options: LeafClusterOptions
): { clusterHeight: number; leafOptions: LeafOptions[] } {
  const { colors, spacing, sides, area, texture } = options
  const { bottomHeight, topHeight } = DEFAULT_LEAF_SIZE[texture]

  const clusterHeight = bottomHeight + topHeight
  const width = util.getLeafWidth(bottomHeight, sides) - spacing

  const leafOptions = util.loopClusterHelper(colors, sides, area, {
    topHeight,
    bottomHeight,
    width
  }) as LeafOptions[]

  return { clusterHeight, leafOptions }
}

export function createLeafCluster(
  order: number,
  baseBranch: GrowBranch,
  colors: string[],
  texture: LeafTexture
): { leafCluster: GrowLeafCluster; leaves: GrowLeaf[] } {
  const { spacing, sides, area } = DEFAULT_LEAF_CLUSTER_SPREAD[texture]
  const clusterOptions: LeafClusterOptions = {
    colors,
    spacing,
    sides,
    area,
    texture
  }

  const { clusterHeight, leafOptions } = processLeafClusterOptions(
    clusterOptions
  )
  const leaves = leafOptions.map(o => {
    return createLeaf(order, o)
  })

  const leafCluster = util.createClusterHelper(
    order,
    baseBranch,
    clusterHeight,
    "leaves",
    clusterOptions
  ) as GrowLeafCluster

  return { leafCluster, leaves }
}

export function createFlower(
  order: number,
  baseBranch: GrowBranch,
  colors: string[]
): { flower: GrowFlower; petals: GrowPetal[] } {
  const { spacing, sides, area } = DEFAULT_FLOWER
  const centerColor = util.varyColors(colors)[0][0]
  const flowerOptions: FlowerOptions = {
    colors,
    spacing,
    sides,
    area,
    centerColor
  }

  const { flowerHeight, petalOptions } = processFlowerOptions(flowerOptions)
  const petals = petalOptions.map(o => {
    return createPetal(order, o)
  })

  const flower = util.createClusterHelper(
    order,
    baseBranch,
    flowerHeight,
    "petals",
    flowerOptions
  ) as GrowFlower
  flower.rotation = { ...NO_ROTATION(), z: 52 } // trouble centering, 52 centers it, TODO?
  return { flower, petals }
}

function replaceClusterWithFlower(
  replaceCluster: GrowLeafCluster,
  flowerColors: string[]
): { flower: GrowFlower; petals: GrowPetal[] } {
  const { spacing, sides, area } = DEFAULT_FLOWER
  const centerColor = util.varyColors(flowerColors)[2] // darkest version of first color
  const flowerOptions: FlowerOptions = {
    colors: flowerColors,
    spacing,
    sides,
    area,
    centerColor
  }
  const { flowerHeight, petalOptions } = processFlowerOptions(flowerOptions)
  const petals = petalOptions.map(o => {
    return createPetal(replaceCluster.order, o)
  })

  const flower: GrowFlower = {
    ...replaceCluster,
    // need to maintain cluster's references to branch position
    position: replaceCluster.position,
    petals: [],
    // replace these properties from the cluster
    rotation: { ...NO_ROTATION(), z: 52 }, // trouble perfectly centering petals, 52 rotation centers on branch
    height: flowerHeight,
    width: flowerHeight,
    color: centerColor,
    optionsReference: flowerOptions
  }

  return { flower, petals }
}

export function processBranchOptions(options: BranchOptions) {
  // only allowing branches to have z-rotation, so passing angle in options, rather than full rotation obj
  const { startPoint, branchHeight, branchWidth, angle } = options
  const rotation = { ...NO_ROTATION(), z: angle }

  const angleRadians = util.radians(angle)
  const compAngleRadians = util.radians(90 - angle)
  const endPoint = util.getBranchEndPoint(
    branchHeight,
    angleRadians,
    startPoint
  )

  // CSS still positions from where the edges of branch would be if it was NOT rotated
  // rotates from center point of bottom/middle, rotation circle has radius of width / 2
  // calculate x/y offsets by solving for triangles created, relative to starting position at 0 rotation
  const topOffset = (branchWidth / 2) * (1 - Math.cos(angleRadians))
  const leftOffset = Math.abs((branchWidth / 2) * Math.cos(compAngleRadians))

  const top = Math.abs(endPoint.y) - startPoint.y - branchHeight + topOffset / 2

  // want to compensate for negative angle rotation by pushing branch to right
  let left = -leftOffset
  if (angle < 0) {
    left -= endPoint.x - startPoint.x
  }

  // TODO: there is still some variance between where the branch is positioned by CSS and what the offsets are,
  // and where it seems it should be positioned based on geometry.
  // review geometry and how CSS behaves.
  // Within reasonable bounds for height/branch width, it displays good enough for now.

  // x endPoint can be negative/before start point if branch is rotated negatively
  const bigX = Math.max(endPoint.x, startPoint.x)
  const smallX = Math.min(endPoint.x, startPoint.x)
  const containerWidth = bigX - smallX + leftOffset / 2
  const containerHeight = endPoint.y - startPoint.y + topOffset
  const containerPosition: Position = {
    y: startPoint.y,
    x: smallX
  }

  return {
    startPoint,
    endPoint,
    branchHeight,
    branchWidth,
    rotation,
    height: containerHeight,
    width: containerWidth,
    position: containerPosition,
    offSet: {
      top: topOffset,
      left: leftOffset
    },
    branchPosition: {
      x: left,
      y: top
    }
  }
}

export function createBranch(
  order: number,
  zIndex: number,
  forceEnd: false | "flower" | "leafCluster",
  options: BranchOptions
): GrowBranch {
  const processedOptions = processBranchOptions(options)

  // update this to use probability to choose between flower/leaf when forceEnd = true
  // need to create flower shape template first
  const hasFlower = forceEnd && forceEnd == "flower"
  const hasLeaf = forceEnd && forceEnd == "leafCluster"
  const branch: GrowBranch = {
    id: 0,
    order,
    hasFlower,
    hasLeaf,
    zIndex,
    transitionSpeed: 0.5,
    optionsReference: options,
    ...processedOptions
  }

  return branch
}

function branchOut(
  globalRefs: BranchOutGlobals,
  forceEnd: false | "leafCluster" | "flower",
  branchOutOptions: BranchOutOptions,
  baseBranchOptions: BranchOptions
) {
  const { order, zIndex, heightLeft, widthLeft } = branchOutOptions
  const baseBranch = createBranch(order, zIndex, forceEnd, baseBranchOptions)

  if (baseBranch.hasLeaf) {
    const { leafColors, leafTexture } = globalRefs.plantOptions
    const clusterAndLeaves = createLeafCluster(
      order + 1,
      baseBranch,
      leafColors,
      leafTexture
    )
    globalRefs.clustersWithLeaves.push(clusterAndLeaves)
  } else if (baseBranch.hasFlower) {
    const { flowerColors } = globalRefs.plantOptions
    const flowerAndPetals = createFlower(order + 1, baseBranch, flowerColors)
    globalRefs.flowersWithPetals.push(flowerAndPetals)
  } else {
    const newBranchHeight = Math.max(baseBranch.height / order, 50)
    const leftBranchAngle = util.getBranchAngle(baseBranch, "left")
    const rightBranchAngle = util.getBranchAngle(baseBranch, "right")

    const consistentOptions = {
      branchHeight: newBranchHeight,
      startPoint: baseBranch.endPoint,
      branchWidth: baseBranchOptions.branchWidth,
      growthHeight: baseBranchOptions.growthHeight
    }

    const leftBranchOptions: BranchOptions = {
      angle: leftBranchAngle,
      ...consistentOptions
    }

    const rightBranchOptions: BranchOptions = {
      angle: rightBranchAngle,
      ...consistentOptions
    }

    const newBranchOutOptions: BranchOutOptions = {
      order: order + 1,
      heightLeft:
        heightLeft - consistentOptions.growthHeight - baseBranch.branchHeight,
      widthLeft: widthLeft - baseBranch.width,
      zIndex
    }

    let forceEnd = {
      forceRight: "leafCluster" as false | "leafCluster" | "flower",
      forceLeft: "leafCluster" as false | "leafCluster" | "flower"
    }

    // 1 or none of the new branches can have a leaf/flower if there's enough height left
    if (newBranchOutOptions.heightLeft > newBranchHeight) {
      forceEnd = util.forceBranchEnd(
        newBranchOutOptions,
        baseBranchOptions.angle
      )
    }

    branchOut(
      globalRefs,
      forceEnd.forceLeft,
      newBranchOutOptions,
      leftBranchOptions
    )
    branchOut(
      globalRefs,
      forceEnd.forceRight,
      newBranchOutOptions,
      rightBranchOptions
    )
  }

  globalRefs.branches.push(baseBranch)
  return
}

export function processPlantOptions(plantOptions: PlantOptions) {
  const {
    totalBaseBranches,
    midBranch,
    angleMax,
    angleInc,
    maxHeight,
    maxSideSpread,
    maxBranchHeight,
    branchWidth,
    growthHeight
  } = util.getBranchOptionBounds(plantOptions)
  // these options get capped
  plantOptions.height = maxHeight
  plantOptions.spread = maxSideSpread * 2

  // lists are accumulators for recursive function
  // plantOptions is needed when adding leaves during recursion
  const branchOutGlobals: BranchOutGlobals = {
    branches: [],
    clustersWithLeaves: [],
    flowersWithPetals: [],
    plantOptions
  }

  for (let branch = 0; branch < totalBaseBranches; branch++) {
    // init branches to default, but at different angles
    // and with smaller max height for branches further from center
    const distanceFromMid = Math.abs(midBranch - branch)
    const order = branch + 1
    const plantHeightLeft = maxHeight / (distanceFromMid + 1)
    const plantSpreadLeft = maxSideSpread
    const zIndex =
      (Math.floor(totalBaseBranches / 2) - distanceFromMid + 1) * 10

    const baseBranchOptions: BranchOptions = {
      startPoint: NO_POSITION(),
      branchWidth,
      branchHeight: maxBranchHeight,
      angle: -angleMax + branch * angleInc,
      growthHeight
    }

    const branchOutOptions: BranchOutOptions = {
      order,
      zIndex,
      heightLeft: plantHeightLeft,
      widthLeft: plantSpreadLeft
    }

    branchOut(branchOutGlobals, false, branchOutOptions, baseBranchOptions)
  }

  // want to have at least 1 flower
  if (
    !branchOutGlobals.branches.filter(b => {
      return b.hasFlower
    }).length
  ) {
    // tired of writing out long variable
    const leafClusters = branchOutGlobals.clustersWithLeaves
    const randIndex = Math.floor(Math.random() * leafClusters.length)
    const replaceCluster = leafClusters[randIndex].leafCluster
    const flowersAndPetals = replaceClusterWithFlower(
      replaceCluster,
      plantOptions.flowerColors
    )
    branchOutGlobals.flowersWithPetals.push(flowersAndPetals)
    branchOutGlobals.clustersWithLeaves.splice(randIndex, 1)
  }
  const plant = {
    height: maxHeight,
    width: maxSideSpread * 2,
    optionsReference: plantOptions
  }
  return {
    branches: branchOutGlobals.branches,
    clustersWithLeaves: branchOutGlobals.clustersWithLeaves,
    flowersWithPetals: branchOutGlobals.flowersWithPetals,
    plant
  }
}

export function createPlant(basePlant: Plant, convertColors: boolean) {
  const plantOptions = util.getPlantOptions(basePlant, convertColors)

  const {
    branches,
    clustersWithLeaves,
    flowersWithPetals,
    plant
  } = processPlantOptions(plantOptions)

  const newPlant: GrowPlant = {
    id: 0,
    name: basePlant.main_species.common_name,
    plantId: basePlant.main_species_id, // see comment in garden module @Mutation CACHE_PLANT
    showName: true,
    zIndex: 10,
    rotation: NO_ROTATION(),
    branches: [],
    leafClusters: [],
    flowers: [],
    ...plant
  }

  return { branches, clustersWithLeaves, flowersWithPetals, plant: newPlant }
}
