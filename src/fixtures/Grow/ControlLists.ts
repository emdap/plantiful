import {
  BranchOptions,
  ControlList,
  GrowBranch,
  GrowPlant,
  LeafOptions,
  LeafTextureValues,
  PlantOptions,
  Rotation,
  GrowLeafCluster,
  LeafClusterOptions,
  FlowerOptions,
  PetalOptions,
  GrowFlower,
} from "@/store/interfaces"
import { Position } from "vue-router/types/router"

const plantControls: ControlList<
  PlantOptions & GrowPlant,
  Rotation & Position
> = [
  {
    property: "name",
    propertyOn: "entity",
    order: 0,
    text: "Name",
    dataType: "text",
  },
  {
    property: "height",
    propertyOn: "options",
    order: 1,
    text: "Height",
    dataType: "number",
    verify: {
      upperBound: 800,
      lowerBound: 1,
    },
  },
  {
    property: "spread",
    propertyOn: "options",
    order: 2,
    text: "Spread",
    dataType: "number",
    verify: {
      upperBound: 900,
      lowerBound: 1,
    },
  },
  {
    property: "leafTexture",
    propertyOn: "options",
    order: 3,
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues,
  },
  {
    property: "leafColors",
    propertyOn: "options",
    order: 4,
    text: "Leaf Colors",
    dataType: "color-list",
  },
  {
    property: "flowerColors",
    propertyOn: "options",
    order: 5,
    text: "Flower Colors",
    dataType: "color-list",
  },
  // comment in below once growPlant actually uses them!
  // {
  //   property: "orientation",
  //   text: "Orientation",
  //   dataType: "dropdown",
  //   options: PlantOrientationValues ?
  // },
  // {
  //   property: "leafDensity",
  //   text: "Leaf Density",
  //   dataType: "dropdown",
  //   options: ?
  // },
  {
    property: "zoom",
    propertyOn: "entity",
    order: 6,
    text: "Scale (percent)",
    dataType: "number",
    verify: {
      lowerBound: 1,
      upperBound: 200,
    },
  },
  {
    property: "zIndex",
    propertyOn: "entity",
    order: 7,
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "position",
    propertyOn: "entity",
    order: 7,
    text: "Position",
    children: [
      {
        property: "x",
        text: "Left distance",
        dataType: "number",
      },
      {
        property: "y",
        text: "Top distance",
        dataType: "number",
      },
    ],
  },
  {
    property: "rotation",
    propertyOn: "entity",
    order: 8,
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number",
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number",
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number",
      },
      {
        property: "translate",
        text: "Z translate (depth)",
        dataType: "number",
      },
    ],
  },
]

const branchControls: ControlList<BranchOptions & GrowBranch> = [
  // {
  //   property: "branchHeight",
  //   text: "Height",
  //   dataType: "number"
  // },
  {
    property: "zIndex",
    propertyOn: "entity",
    order: 1,
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "branchHeight",
    propertyOn: "options",
    order: 2,
    text: "Height",
    dataType: "number",
    verify: {
      upperBound: 900,
      lowerBound: 0,
    },
  },
  {
    property: "branchWidth",
    propertyOn: "options",
    order: 3,
    text: "Width",
    dataType: "number",
    verify: {
      upperBound: 20,
      lowerBound: 1,
    },
  },
  {
    property: "angle",
    propertyOn: "options",
    order: 4,
    text: "Angle",
    dataType: "number",
    verify: {
      upperBound: 90,
      lowerBound: -90,
    },
  },
]

const leafClusterControls: ControlList<
  GrowLeafCluster & LeafClusterOptions,
  Rotation
> = [
  {
    property: "zIndex",
    propertyOn: "entity",
    order: 1,
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "rotation",
    propertyOn: "entity",
    order: 2,
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number",
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number",
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number",
      },
    ],
  },
  {
    property: "colors",
    propertyOn: "options",
    order: -5,
    text: "Leaf Colors",
    dataType: "color-list",
  },
  {
    property: "texture",
    propertyOn: "options",
    order: -4,
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues,
  },
  {
    property: "spacing",
    propertyOn: "options",
    order: -3,
    text: "Gap between leaves",
    dataType: "number",
  },
  {
    property: "sides",
    propertyOn: "options",
    order: -2,
    text: "Leaves in cluster",
    dataType: "number",
    verify: {
      upperBound: 100,
      lowerBound: 2, // TODO: CSS bugs at 1 leaf, hence bound of 2..
    },
  },
  {
    property: "area",
    propertyOn: "options",
    order: -1,
    text: "Cluster area",
    dataType: "number",
    verify: {
      upperBound: 360,
      lowerBound: 0,
    },
  },
]

const flowerControls: ControlList<GrowFlower & FlowerOptions, Rotation> = [
  {
    property: "colors",
    propertyOn: "options",
    order: 1,
    text: "Flower Colors",
    dataType: "color-list",
  },
  {
    property: "spacing",
    propertyOn: "options",
    order: 2,
    text: "Gap between petals",
    dataType: "number",
  },
  {
    property: "sides",
    propertyOn: "options",
    order: 3,
    text: "Petals in flower",
    dataType: "number",
    verify: {
      upperBound: 100,
      lowerBound: 2,
    },
  },
  {
    property: "area",
    propertyOn: "options",
    order: 4,
    text: "Flower area",
    dataType: "number",
    verify: {
      upperBound: 360,
      lowerBound: 0,
    },
  },
  {
    property: "zIndex",
    propertyOn: "entity",
    order: 5,
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "color",
    propertyOn: "entity",
    order: 6,
    text: "Flower center color",
    dataType: "color",
  },
  {
    property: "rotation",
    propertyOn: "entity",
    order: 7,
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number",
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number",
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number",
      },
    ],
  },
]

// const allLeafOptionsControls: ControlList<LeafOptions> = [
//   {
//     property: "topHeight",
//     text: "Top height of leaf",
//     dataType: "number"
//   },
//   {
//     property: "bottomHeight",
//     text: "Bottom height of leaf",
//     dataType: "number"
//   }
// ]

const leafControls: ControlList<LeafOptions> = [
  {
    property: "color",
    propertyOn: "options",
    order: 1,
    text: "Color",
    dataType: "color",
  },
  {
    property: "topHeight",
    propertyOn: "options",
    order: 2,
    text: "Top height of leaf",
    dataType: "number",
  },
  {
    property: "bottomHeight",
    propertyOn: "options",
    order: 3,
    text: "Bottom height of leaf",
    dataType: "number",
  },
]

const petalControls: ControlList<PetalOptions> = [
  {
    property: "color",
    propertyOn: "options",
    order: 1,
    text: "Color",
    dataType: "color",
  },
  // disabled until can fix this from messing up cluster position
  // {
  //   property: "height",
  //   text: "Height of petal",
  //   dataType: "number"
  // },
]

const specialPlantControls = [
  {
    text: "Convert all leaves to flowers",
    code: "convert-leaves",
  },
  {
    text: "Convert all flowers to leaves",
    code: "convert-flowers",
  },
]

function sortControlList(a: { order: number }, b: { order: number }) {
  return a.order - b.order
}

export default {
  plantControls,
  branchControls,
  leafClusterControls,
  leafControls,
  flowerControls,
  petalControls,
  specialPlantControls,
  sortControlList,
}
