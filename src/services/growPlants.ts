import {
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
  BranchOutOptions
} from "@/store/interfaces"
import util from "../utilities/growUtil"

export function processLeafOptions(options: LeafOptions) {
  const { color, topHeight, bottomHeight, width, rotation } = options

  const topBorder = util.topLeafBorder(width, topHeight)
  const bottomBorder = util.bottomLeafBorder(width, bottomHeight)
  const shapes = util.leafTemplate(color, topBorder, bottomBorder)

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
  const { shapes, height, position, rotation } = processLeafOptions(options)

  const leaf: GrowLeaf = {
    id: 0,
    order,
    shapes,
    height,
    position,
    rotation,
    width: options.width,
    zIndex: 10,
    transitionSpeed: 0.5,
    optionsReference: options
  }

  return leaf
}

export function processLeafClusterOptions(
  options: LeafClusterOptions
): { clusterHeight: number; leafOptions: LeafOptions[] } {
  const { colors, spacing, sides, area, texture } = options
  const { bottomHeight, topHeight } = DEFAULT_LEAF_SIZE[texture]
  const clusterHeight = bottomHeight + topHeight
  const adjustedSides = Math.max(3, sides)

  const width = util.getLeafWidth(bottomHeight, adjustedSides) - spacing
  const angleInc = area / (adjustedSides - 1) // how much to increment the rotation of each leaf

  const leafOptions = [] as LeafOptions[]
  for (let i = 0; i < adjustedSides; i++) {
    const colorIndex = Math.floor(Math.random() * colors.length) // choose a random color
    const color = colors[colorIndex]

    // shift i to be between -(adjustedSides-1)/2 , (adjustedSides-1)/2
    const shiftedI = i - (adjustedSides - 1) / 2
    const angle = angleInc * shiftedI
    const rotation = { ...NO_ROTATION(), z: angle }

    const options: LeafOptions = {
      color,
      topHeight,
      bottomHeight,
      width,
      rotation
    }

    leafOptions.push(options)
  }

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

  // properties based on baseBranch
  const rotation = baseBranch.rotation
  const position = baseBranch.endPoint
  const zIndex = baseBranch.zIndex + 1
  const offSet = baseBranch.offSet

  const leafCluster: GrowLeafCluster = {
    id: 0,
    order,
    rotation,
    position,
    zIndex,
    offSet,
    height: clusterHeight,
    width: clusterHeight,
    leaves: [],
    transitionSpeed: 0.5,
    optionsReference: clusterOptions
  }

  return { leafCluster, leaves }
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
  forceEnd: boolean,
  options: BranchOptions
): GrowBranch {
  const processedOptions = processBranchOptions(options)

  // update this to use probability to choose between flower/leaf when forceEnd = true
  // need to create flower shape template first
  const hasFlower = false
  const hasLeaf = forceEnd
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
  forceEnd: boolean,
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
    console.log("add flower")
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
      forceRight: true,
      forceLeft: true
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

  // lists are accumulators for recursive function
  // plantOptions is needed when adding leaves during recursion
  const branchOutGlobals: BranchOutGlobals = {
    branches: [],
    clustersWithLeaves: [],
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

  const plant = {
    height: maxHeight,
    width: maxSideSpread * 2,
    optionsReference: plantOptions
  }
  console.log(plant)
  return {
    branches: branchOutGlobals.branches,
    clustersWithLeaves: branchOutGlobals.clustersWithLeaves,
    plant
  }
}

export function createPlant(
  basePlant: Plant,
  position: Position,
  convertColors: boolean
) {
  const plantOptions = util.getPlantOptions(basePlant, convertColors)

  const { branches, clustersWithLeaves, plant } = processPlantOptions(
    plantOptions
  )
  const adjustedPosition = { x: position.x, y: position.y + plant.height / 2 }

  const newPlant: GrowPlant = {
    id: 0,
    name: basePlant.main_species.common_name,
    plantId: basePlant.main_species_id, // see comment in garden module @Mutation CACHE_PLANT
    showName: true,
    zIndex: 10,
    position: adjustedPosition,
    rotation: NO_ROTATION(),
    branches: [],
    leafClusters: [],
    ...plant
  }

  return { branches, clustersWithLeaves, plant: newPlant }
}
