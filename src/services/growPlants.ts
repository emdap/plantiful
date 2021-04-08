import {
  BRANCH_INIT,
  NO_POSITION,
  PLANT_ENTITY_INIT
} from "@/fixtures/Grow/Defaults"
import {
  LeafTexture,
  LeafOptions,
  Rotation,
  GrowLeaf,
  GrowBranch,
  BranchOptions,
  Position,
  GrowLeafCluster,
  Plant,
  BranchOutGlobals,
  GrowPlant,
  LeafClusterOptions,
  GrowShape
} from "@/store/interfaces"
import util from "../utilities/growUtil"

export function createLeaves(
  order: number,
  clusterColors: string[],
  options: LeafOptions
): GrowLeaf[] {
  const { color, topHeight, bottomHeight, spacing, sides, area } = options
  const adjustedSides = sides < 3 ? 3 : sides

  const width = util.getLeafWidth(bottomHeight, adjustedSides) - spacing

  const topBorder = util.topLeafBorder(width, topHeight)
  const bottomBorder = util.bottomLeafBorder(width, bottomHeight)

  const angleInc = area / (adjustedSides - 1)
  const leaves = [] as GrowLeaf[]
  for (let i = 0; i < adjustedSides; i++) {
    let useColor!: string
    if (!color) {
      const colorIndex = Math.floor(Math.random() * clusterColors.length)
      useColor = clusterColors[colorIndex]
    } else {
      useColor = color
    }

    const shapes = util.leafTemplate(useColor, topBorder, bottomBorder)

    const shiftedI = i - (adjustedSides - 1) / 2
    const angle = angleInc * shiftedI

    const rotation: Rotation = {
      x: 0,
      y: 0,
      z: angle,
      translate: 0
    }
    const height = topHeight + bottomHeight
    const leaf: GrowLeaf = {
      id: 0,
      order,
      position: {
        x: height / 2 - width / 2,
        y: 0
      },
      rotation,
      height,
      width,
      shapes,
      transitionSpeed: 0.5,
      zIndex: 10,
      optionsReference: {
        ...options,
        color: useColor
      }
    }

    leaves.push(leaf)
  }

  return leaves
}

export function createBranch(
  order: number,
  options: BranchOptions
): GrowBranch {
  const {
    startPoint,
    height,
    width,
    angle,
    hasLeaf,
    hasFlower,
    zIndex
  } = options
  const angleRadians = util.radians(angle)
  const compAngleRadians = util.radians(90 - angle)
  const endPoint = util.getBranchEndPoint(height, angleRadians, startPoint)

  // CSS still positions from where the edges of branch would be if it was NOT rotated
  // rotates from center point of bottom/middle, rotation circle has radius of width / 2
  // calculate x/y offsets by solving for triangles created, relative to starting position at 0 rotation
  const topOffset = (width / 2) * (1 - Math.cos(angleRadians))
  const leftOffset = Math.abs((width / 2) * Math.cos(compAngleRadians))

  const top = Math.abs(endPoint.y) - startPoint.y - height + topOffset / 2

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

  const branch: GrowBranch = {
    order,
    startPoint,
    endPoint,
    hasLeaf,
    hasFlower,
    offSet: {
      top: topOffset,
      left: leftOffset
    },
    height: containerHeight,
    width: containerWidth,
    rotation: {
      x: 0,
      y: 0,
      z: angle,
      translate: 0
    },
    position: containerPosition,
    branchHeight: height,
    branchWidth: width,
    branchPosition: {
      x: left,
      y: top
    },
    zIndex,
    transitionSpeed: 0.5,
    id: 0,
    optionsReference: options
  }

  return branch
}

export function createLeafCluster(
  order: number,
  baseBranch: GrowBranch,
  clusterOptions: LeafClusterOptions,
  leafOptions?: LeafOptions
): {
  leafCluster: GrowLeafCluster
  leaves: GrowLeaf[]
} {
  if (!leafOptions) {
    leafOptions = util.getLeafOptions(clusterOptions.texture)
  }

  const leaves = createLeaves(order, clusterOptions.colors, leafOptions)
  const leafHeight = leafOptions.topHeight + leafOptions.bottomHeight
  const leafCluster: GrowLeafCluster = {
    id: 0,
    order,
    rotation: baseBranch.rotation,
    position: baseBranch.endPoint,
    zIndex: baseBranch.zIndex + 1,
    offSet: baseBranch.offSet,
    height: leafHeight,
    width: leafHeight,
    leaves: [],
    optionsReference: clusterOptions
  }

  return {
    leafCluster,
    leaves
  }
}

function branchOut(
  globalRefs: BranchOutGlobals,
  order: number,
  heightLeft: number,
  widthLeft: number,
  forceLeaf: boolean,
  baseBranchOptions: BranchOptions
) {
  // TODO: could modify this to have height/spread take into account the leaf size
  // right now, only checks if branch height has exceeded the height/spread
  const baseBranch = createBranch(order, baseBranchOptions)
  if (forceLeaf) {
    baseBranch.hasLeaf = true
    const clusterWithLeaves = createLeafCluster(
      order + 1,
      baseBranch,
      globalRefs.leafClusterOptions
    )
    globalRefs.clustersWithLeaves.push(clusterWithLeaves)
  } else {
    const newBranchHeight = Math.max(baseBranch.height / order, 50)
    const leftBranchOptions = {
      ...baseBranchOptions,
      startPoint: baseBranch.endPoint,
      height: newBranchHeight,
      angle: util.getBranchAngle(baseBranch, "left")
    }
    const rightBranchOptions = {
      ...baseBranchOptions,
      startPoint: baseBranch.endPoint,
      height: newBranchHeight,
      angle: util.getBranchAngle(baseBranch, "right")
    }
    heightLeft = heightLeft - baseBranch.height
    widthLeft = widthLeft - baseBranch.width
    order++
    // 1 or none of the new branches can have a leaf
    let forceLeaves = {
      forceLeft: true,
      forceRight: true
    }
    if (heightLeft > newBranchHeight) {
      forceLeaves = util.forceLeaves(
        order,
        heightLeft,
        widthLeft,
        baseBranchOptions.angle
      )
    }
    branchOut(
      globalRefs,
      order,
      heightLeft,
      widthLeft,
      forceLeaves.forceLeft,
      leftBranchOptions
    )
    branchOut(
      globalRefs,
      order,
      heightLeft,
      widthLeft,
      forceLeaves.forceRight,
      rightBranchOptions
    )
  }
  globalRefs.branches.push(baseBranch)
  return
}

export function createPlant(plant: Plant, convertColors: boolean) {
  const plantOptions = util.getPlantOptions(plant, convertColors)
  const leafClusterOptions = util.getLeafClusterOptions(plantOptions)
  const {
    totalBaseBranches,
    midBranch,
    angleMax,
    angleInc,
    maxHeight,
    maxSideSpread,
    maxBranchHeight
  } = util.getBranchOptionBounds(plantOptions)

  // lists are accumulators for recursive function
  // plantOptions is needed when adding leaves during recursion
  const branchOutGlobals: BranchOutGlobals = {
    branches: [],
    clustersWithLeaves: [],
    leafClusterOptions
  }
  for (let branch = 0; branch < totalBaseBranches; branch++) {
    // init branches to default, but at different angles
    // and with smaller max height for branches further from center
    const distanceFromMid = Math.abs(midBranch - branch)
    const order = branch + 1
    const plantHeightLeft = maxHeight / (distanceFromMid + 1)
    // TODO: tinker curSpread based on heightleft/width left?
    // trying to make center branches spread less
    const plantSpreadLeft = maxSideSpread
    // (maxSideSpread / (midBranch + 1)) * (distanceFromMid + 1)
    const zIndex =
      (Math.floor(totalBaseBranches / 2) - distanceFromMid + 1) * 10
    const baseBranchOptions: BranchOptions = {
      ...BRANCH_INIT(),
      height: maxBranchHeight,
      angle: -angleMax + branch * angleInc,
      zIndex
      // TODO: customize properties further based on other plant options
    }

    branchOut(
      branchOutGlobals,
      order,
      plantHeightLeft,
      plantSpreadLeft,
      false,
      baseBranchOptions
    )
  }
  const plantEntity: GrowPlant = {
    ...PLANT_ENTITY_INIT(),
    id: 0,
    plantId: plant.main_species_id, // see comment in garden module @Mutation CACHE_PLANT
    showName: true,
    name: plant.main_species.common_name,
    branches: [],
    leafClusters: [],
    height: maxHeight,
    width: maxSideSpread * 2,
    optionsReference: plantOptions
  }
  return {
    branches: branchOutGlobals.branches,
    clustersWithLeaves: branchOutGlobals.clustersWithLeaves,
    plant: plantEntity
  }
}
