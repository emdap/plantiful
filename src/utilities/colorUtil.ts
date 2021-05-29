export type RGBObj = {
  r: number
  b: number
  g: number
  a: number
}

export function colorToList(parseColor: string): false | string[] {
  const dataStart = parseColor.indexOf("(")
  const dataEnd = parseColor.indexOf(")")
  if (dataStart == -1 || dataEnd == -1) {
    return false
  }
  return parseColor.substring(dataStart + 1, dataEnd).split(",")
}

export function colorToObj(color: string, defaultColor: RGBObj): RGBObj {
  const splitColor = colorToList(color)
  if (!splitColor || splitColor.length < 3) {
    return defaultColor
  }
  const colorObj = {
    r: parseInt(splitColor[0]),
    g: parseInt(splitColor[1]),
    b: parseInt(splitColor[2]),
    a: 1,
  }
  if (splitColor.length == 4) {
    colorObj.a = parseInt(splitColor[3])
  }
  return colorObj
}

export function colorToStr(parseColor: RGBObj): string {
  const { r, g, b, a } = parseColor
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
