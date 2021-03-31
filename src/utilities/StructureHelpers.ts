import {
  GrowBorder,
  TopGrowBorder,
  GrowShape,
  Coordinate
} from "@/store/interfaces"
import { NO_ROTATION, NO_POSITION } from "@/fixtures/Grow/Defaults"

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

export default {
  radians,
  getBranchEndPoint,
  topLeafBorder,
  bottomLeafBorder,
  getLeafWidth,
  leafTemplate
}
