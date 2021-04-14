import {
  BranchOptions,
  Control,
  ControlList,
  GrowBorder,
  GrowBranch,
  GrowLeaf,
  GrowCluster,
  GrowPlant,
  GrowShape,
  ClusterOptions,
  LeafOptions,
  LeafTextureValues,
  NestedControl,
  PlantOptions,
  Rotation,
  GrowLeafCluster,
  LeafClusterOptions,
  FlowerOptions,
  PetalOptions,
  GrowFlower
} from "@/store/interfaces"
import { Position } from "vue-router/types/router"

const plantOptionsControls: ControlList<PlantOptions> = [
  {
    property: "height",
    text: "Height",
    dataType: "number",
    verify: {
      upperBound: 800,
      lowerBound: 1
    }
  },
  {
    property: "spread",
    text: "Spread",
    dataType: "number",
    verify: {
      upperBound: 900,
      lowerBound: 1
    }
  },
  {
    property: "flowerColors",
    text: "Flower Colors",
    dataType: "color-list"
  },
  {
    property: "leafColors",
    text: "Leaf Colors",
    dataType: "color-list"
  },
  {
    property: "leafTexture",
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues
  }
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
]

const plantControls: ControlList<GrowPlant, Rotation & Position> = [
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  },
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number"
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number"
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number"
      },
      {
        property: "translate",
        text: "Z translate (depth)",
        dataType: "number"
      }
    ]
  },
  {
    property: "position",
    text: "Position",
    children: [
      {
        property: "x",
        text: "Left distance",
        dataType: "number"
      },
      {
        property: "y",
        text: "Top distance",
        dataType: "number"
      }
    ]
  }
]

const branchControls: ControlList<GrowBranch> = [
  // {
  //   property: "branchHeight",
  //   text: "Height",
  //   dataType: "number"
  // },
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  }
]

const branchOptionsControls: ControlList<BranchOptions> = [
  {
    property: "branchHeight",
    text: "Height",
    dataType: "number"
  },
  {
    property: "branchWidth",
    text: "Width",
    dataType: "number"
  },
  {
    property: "angle",
    text: "Angle",
    dataType: "number",
    verify: {
      upperBound: 90,
      lowerBound: -90
    }
  }
]

const leafClusterControls: ControlList<GrowLeafCluster, Rotation> = [
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  },
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number"
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number"
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number"
      }
    ]
  }
]

const leafClusterOptionsControls: ControlList<LeafClusterOptions> = [
  {
    property: "colors",
    text: "Leaf Colors",
    dataType: "color-list"
  },
  {
    property: "texture",
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues
  },
  {
    property: "spacing",
    text: "Gap between leaves",
    dataType: "number"
  },
  {
    property: "sides",
    text: "Leaves in cluster",
    dataType: "number"
  },
  {
    property: "area",
    text: "Cluster area",
    dataType: "number",
    verify: {
      upperBound: 360,
      lowerBound: 0
    }
  }
]

const flowerOptionsControls: ControlList<FlowerOptions> = [
  {
    property: "colors",
    text: "Flower Colors",
    dataType: "color-list"
  },
  {
    property: "spacing",
    text: "Gap between petals",
    dataType: "number"
  },
  {
    property: "sides",
    text: "Petals in flower",
    dataType: "number"
  },
  {
    property: "area",
    text: "Flower area",
    dataType: "number",
    verify: {
      upperBound: 360,
      lowerBound: 0
    }
  }
]

const flowerControls: ControlList<GrowFlower, Rotation> = [
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  },
  {
    property: "color",
    text: "Flower center color",
    dataType: "color"
  },
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number"
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number"
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number"
      }
    ]
  }
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

const leafOptionsControls: ControlList<LeafOptions> = [
  {
    property: "color",
    text: "Color",
    dataType: "color"
  }
  // disabled until can fix this from messing up cluster position
  // {
  //   property: "topHeight",
  //   text: "Top height of leaf",
  //   dataType: "number"
  // },
  // {
  //   property: "bottomHeight",
  //   text: "Bottom height of leaf",
  //   dataType: "number"
  // }
]

const petalOptionsControls: ControlList<PetalOptions> = [
  {
    property: "color",
    text: "Color",
    dataType: "color"
  }
  // disabled until can fix this from messing up cluster position
  // {
  //   property: "height",
  //   text: "Height of petal",
  //   dataType: "number"
  // },
]

export default {
  plantOptionsControls,
  plantControls,
  branchControls,
  branchOptionsControls,
  leafClusterControls,
  leafClusterOptionsControls,
  // allLeafOptionsControls,
  leafOptionsControls,
  flowerControls,
  flowerOptionsControls,
  petalOptionsControls
}
