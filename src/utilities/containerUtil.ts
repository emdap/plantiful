import { Position } from "@/store/interfaces"

function checkMouseZoneDistance(
  mousePos: Position,
  zoneStart: Position,
  zoneEnd: Position
): Position {
  if (
    mousePos.x >= zoneStart.x &&
    mousePos.y >= zoneStart.y &&
    mousePos.x <= zoneEnd.x &&
    mousePos.y <= zoneEnd.y
  ) {
    return { x: 0, y: 0 }
  }
  let yDist!: number
  let xDist!: number
  if (mousePos.x < zoneStart.x) {
    xDist = zoneStart.x - mousePos.x
  } else if (mousePos.x > zoneEnd.x) {
    xDist = mousePos.x - zoneEnd.x
  } else {
    xDist = 0
  }

  if (mousePos.y < zoneStart.y) {
    yDist = zoneStart.y - mousePos.y
  } else if (mousePos.y > zoneEnd.y) {
    yDist = mousePos.y - zoneEnd.y
  } else {
    yDist = 0
  }

  return { x: xDist, y: yDist }
}

export default {
  checkMouseZoneDistance
}
