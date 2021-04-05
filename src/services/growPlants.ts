import { BRANCH_INIT, NO_POSITION } from "@/fixtures/Grow/Defaults"
import {
  LeafTexture,
  LeafOptions,
  Rotation,
  GrowLeaf,
  GrowBranch,
  BranchOptions,
  Coordinate,
  GrowLeafCluster,
  Plant,
  BranchOutGlobals
} from "@/store/interfaces"
import util from "../utilities/growUtil"

export function createLeaves(
  order: number,
  colors: string[],
  options: LeafOptions
): GrowLeaf[] {
  const { topHeight, bottomHeight, spacing, sides, area } = options
  const adjustedSides = sides < 3 ? 3 : sides

  const width = util.getLeafWidth(bottomHeight, adjustedSides) - spacing

  const topBorder = util.topLeafBorder(width, topHeight)
  const bottomBorder = util.bottomLeafBorder(width, bottomHeight)

  const angleInc = area / (adjustedSides - 1)
  const leaves = [] as GrowLeaf[]
  for (let i = 0; i < adjustedSides; i++) {
    const colorIndex = Math.floor(Math.random() * colors.length)
    const color = colors[colorIndex]
    const shapes = util.leafTemplate(color, topBorder, bottomBorder)

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
      zIndex: 10
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
  const containerPosition: Coordinate = {
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
    id: 0
  }

  return branch
}

export function createLeafCluster(
  order: number,
  baseBranch: GrowBranch,
  colors: string[],
  leafOptions?: { texture?: LeafTexture; custom?: LeafOptions }
): {
  leafCluster: GrowLeafCluster
  leaves: GrowLeaf[]
} {
  const options = util.getLeafOptions(leafOptions)

  const leaves = createLeaves(order, colors, options)
  const leafHeight = options.topHeight + options.bottomHeight
  const leafCluster: GrowLeafCluster = {
    id: 0,
    order,
    rotation: baseBranch.rotation,
    position: baseBranch.endPoint,
    zIndex: baseBranch.zIndex + 1,
    offSet: baseBranch.offSet,
    height: leafHeight,
    width: leafHeight,
    leaves: []
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
  const baseBranch = createBranch(order, baseBranchOptions)
  if (forceLeaf) {
    baseBranch.hasLeaf = true
    const { leafColors, leafTexture } = globalRefs.plantOptions
    const clusterWithLeaves = createLeafCluster(
      order + 1,
      baseBranch,
      leafColors,
      { texture: leafTexture }
    )
    globalRefs.clustersWithLeaves.push(clusterWithLeaves)
  } else {
    // TODO: maniuplate branch height in branchOptions based on order (smaller branch height as order increases)
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
    const { forceLeft, forceRight } = util.forceLeaves(
      order,
      heightLeft,
      widthLeft,
      baseBranchOptions.angle
    )
    branchOut(
      globalRefs,
      order,
      heightLeft,
      widthLeft,
      forceLeft,
      leftBranchOptions
    )
    branchOut(
      globalRefs,
      order,
      heightLeft,
      widthLeft,
      forceRight,
      rightBranchOptions
    )
  }
  globalRefs.branches.push(baseBranch)
  return
}

export function createPlant(plant?: Plant) {
  const plantOptions = util.getPlantOptions(plant)
  const {
    totalBaseBranches,
    midBranch,
    angleMax,
    angleInc,
    maxHeight,
    maxSpread,
    maxBranchHeight
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
    // TODO: tinker curSpread based on heightleft/width left?
    // trying to make center branches spread less
    const plantSpreadLeft =
      (maxSpread / (midBranch + 1)) * (distanceFromMid + 1)
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
  return branchOutGlobals
}
