import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import store from "@/store"
import {
  Position,
  GrowData,
  GrowPlant,
  GrowState,
  Rotation,
  GrowBranch,
  GrowLeaf,
  GrowLeafCluster,
  GrowFlower,
  GrowDataKey,
  GrowType,
  Plant,
  PlantOptions,
  GrowPlantReturn,
  LeafClusterOptions,
  LeafTexture,
  LeafOptions,
  BranchOptions,
  GrowPetal,
  FlowerOptions,
  PetalOptions,
  GrowEntitySnippet,
  GrowOptionsSnippet,
} from "@/store/interfaces"
import Vue from "vue"
import { NO_ROTATION } from "@/fixtures/Defaults"
import { DEFAULT_LEAF_CLUSTER_SPREAD } from "@/fixtures/Grow/GrowDefaults"
import {
  createLeaf,
  createPlant,
  processPlantOptions,
  processLeafClusterOptions,
  processLeafOptions,
  processBranchOptions,
  processFlowerOptions,
  processPetalOptions,
  createPetal,
} from "@/services/growPlants"

@Module({
  dynamic: true,
  namespaced: true,
  name: "grow",
  store,
})
export default class GrowModule extends VuexModule implements GrowState {
  plants = {} as GrowData<GrowPlant>
  branches = {} as GrowData<GrowBranch>
  leafClusters = {} as GrowData<GrowLeafCluster>
  leaves = {} as GrowData<GrowLeaf>
  flowers = {} as GrowData<GrowFlower>
  petals = {} as GrowData<GrowPetal>
  activeGrowPlant: GrowPlant | null = null
  activeEntity: GrowType | null = null
  activeEntityType: GrowDataKey | null = null
  highlightEntity: number | null = null
  highlightEntityType: GrowDataKey | null = null
  showControls = false

  maxBranches = 125

  public get getEntity() {
    return (dataKey: GrowDataKey, id: number) => {
      return this[dataKey][id]
    }
  }

  public get getPlantChildrenIds() {
    return (plant: GrowPlant) => {
      const { branches, leafClusters, flowers } = plant
      const leaves = [] as number[]
      const petals = [] as number[]

      for (const clusterId of leafClusters) {
        const cluster = this.getEntity(
          "leafClusters",
          clusterId
        ) as GrowLeafCluster
        leaves.concat(cluster.children)
      }

      for (const clusterId of flowers) {
        const cluster = this.getEntity("flowers", clusterId) as GrowFlower
        petals.concat(cluster.children)
      }

      return {
        branches,
        leafClusters,
        flowers,
        leaves,
        petals,
      }
    }
  }

  @Action
  deletePlantChildren(plant: GrowPlant) {
    const childrenIds = this.getPlantChildrenIds(plant)
    this.RESET_PLANT_CHILDREN(plant.id)
    const dataKeys = [
      "leaves",
      "petals",
      "leafClusters",
      "flowers",
      "branches",
    ] as const

    for (const dataKey of dataKeys) {
      childrenIds[dataKey].forEach(id => {
        this.deleteEntity({ dataKey, id })
      })
    }
  }

  @Action
  deletePlant(plant: GrowPlant) {
    this.deletePlantChildren(plant)
    this.deleteEntity({ dataKey: "plants", id: plant.id })
  }

  @Action
  setActivePlant(id: number) {
    if (this["plants"][id]) {
      this.ACTIVE_PLANT(id)
      this.TOGGLE_CONTROLS(true)
      // TEST_PLANT has id 0
      if (this["plants"][id].plantId) {
        this.context.dispatch(
          "garden/getOnePlant",
          this["plants"][id].plantId,
          {
            root: true,
          }
        )
      }
    }
  }

  @Action
  removeActivePlant() {
    this.ACTIVE_PLANT(null)
    this.TOGGLE_CONTROLS(false)
  }

  @Action
  setActiveEntity(payload: { id: number; dataKey: GrowDataKey }) {
    if (payload.dataKey == "plants") {
      this.setActivePlant(payload.id)
    } else if (this[payload.dataKey][payload.id]) {
      // may want to have separate active branch/leaf/flower properties in future
      this.ACTIVE_ENTITY(payload)
    }
  }

  @Action
  removeActiveEntity(dataKey: GrowDataKey) {
    this.ACTIVE_ENTITY({ id: null, dataKey })
  }

  @Action
  setHighlightEntity(id: number | null) {
    this.HIGHLIGHT_ENTITY(id)
  }

  @Action
  setHighlightType(dataKey: GrowDataKey | null) {
    this.HIGHLIGHT_TYPE(dataKey)
    if (!dataKey) {
      this.HIGHLIGHT_ENTITY(null)
    }
  }

  @Mutation
  HIGHLIGHT_ENTITY(id: number | null) {
    this.highlightEntity = id
  }

  @Mutation
  HIGHLIGHT_TYPE(dataKey: GrowDataKey | null) {
    this.highlightEntityType = dataKey
  }

  @Action
  addPlant(plant: GrowPlant) {
    this.ADD_ENTITY({ dataKey: "plants", entity: plant })
  }

  @Action
  addBranch(branch: GrowBranch) {
    // need to maintain rotation reference! otherwise controls on angle don't update leaf cluster
    const origAngle = branch.rotation.z
    const tempBranch: GrowBranch = {
      ...branch,
      branchHeight: 0,
      height: 0,
    }
    tempBranch.rotation.z = 0
    this.ADD_ENTITY({ dataKey: "branches", entity: tempBranch })
    branch.id = tempBranch.id // id created upon adding
    setTimeout(() => {
      branch.rotation.z = origAngle
      this.UPDATE_ENTITY({
        dataKey: "branches",
        id: tempBranch.id,
        newEntity: branch,
      })
    }, branch.order * 250)
  }

  @Action
  updateBranchEndPoint(branch: GrowBranch) {
    const updatedBranch = {
      ...branch,
      ...processBranchOptions(branch.optionsReference),
    }
    this.UPDATE_ENTITY({
      dataKey: "branches",
      id: branch.id,
      newEntity: updatedBranch,
    })
  }

  @Action
  updateClusterFromPlant(payload: {
    growPlant: GrowPlant
    propertyRef: keyof GrowPlant
    newOptions: GrowOptionsSnippet
  }) {
    const { growPlant, propertyRef, newOptions } = payload
    const leafClusterProperties = {
      leafColors: "colors",
      leafTexture: "texture",
    }
    const flowerProperties = {
      flowerColors: "colors",
    }

    let dataKey!: "leafClusters" | "flowers"
    let clusterProperty!: keyof GrowLeafCluster | keyof GrowFlower
    if (Object.keys(leafClusterProperties).indexOf(propertyRef) != -1) {
      dataKey = "leafClusters"
      clusterProperty = leafClusterProperties[
        propertyRef as keyof typeof leafClusterProperties
      ] as keyof GrowLeafCluster
    } else {
      dataKey = "flowers"
      clusterProperty = flowerProperties[
        propertyRef as keyof typeof flowerProperties
      ] as keyof GrowFlower
    }

    const newClusterOptions = {
      [clusterProperty]: newOptions[propertyRef as keyof typeof newOptions],
    }
    const clusterList =
      dataKey == "leafClusters" ? growPlant.leafClusters : growPlant.flowers

    for (const clusterId of clusterList) {
      this.setEntityOptions({
        id: clusterId,
        dataKey,
        newOptions: newClusterOptions,
        propertyRef: clusterProperty,
      })
    }

    this.mergeEntity({
      dataKey: "plants",
      id: growPlant.id,
      mergeData: { optionsReference: newOptions as PlantOptions },
    })
  }

  @Action
  setEntity(payload: {
    id: number
    dataKey: GrowDataKey
    newEntity: GrowType
  }) {
    this.UPDATE_ENTITY(payload)
  }

  @Action
  async mergeEntity(payload: {
    dataKey: GrowDataKey
    id: number
    mergeData: GrowEntitySnippet
  }) {
    const { dataKey, id, mergeData } = payload
    const curEntity = this.getEntity(dataKey, id)
    const newEntity = { ...curEntity, ...mergeData } as GrowType
    // TODO: this would be a cool feature, but should have way to browse these plants, and update
    // their base properties
    // if (dataKey == "plants") {
    //   // if name has changed, add new plant species
    //   curEntity = curEntity as GrowPlant
    //   newEntity = newEntity as GrowPlant
    //   if (curEntity.plantId && curEntity.name != newEntity.name) {
    //     const newPlant = await this.context.dispatch(
    //       "garden/newPlantSpecies",
    //       {
    //         id: newEntity.plantId,
    //         newName: newEntity.name
    //       },
    //       {
    //         root: true,
    //       }
    //     )
    //     newEntity.plantId = newPlant.main_species_id

    // }
    // }
    this.UPDATE_ENTITY({ dataKey, id, newEntity })
  }

  @Action
  async setEntityOptions(payload: {
    id: number
    dataKey: GrowDataKey
    newOptions: GrowOptionsSnippet
    propertyRef: string
  }) {
    const { id, dataKey, newOptions, propertyRef } = payload
    const curEntity = this.getEntity(dataKey, id)
    let updatedEntity!: GrowType

    // easiset case, no side effects
    if (dataKey == "leaves" || dataKey == "branches" || dataKey == "petals") {
      let processedOptions!: GrowOptionsSnippet
      if (dataKey == "leaves") {
        processedOptions = processLeafOptions(newOptions as LeafOptions)
      } else if (dataKey == "branches") {
        processedOptions = processBranchOptions(newOptions as BranchOptions)
      } else if (dataKey == "petals") {
        processedOptions = processPetalOptions(newOptions as PetalOptions)
      }
      updatedEntity = {
        ...curEntity,
        ...processedOptions,
        optionsReference: {
          ...curEntity.optionsReference,
          ...newOptions,
        },
      } as GrowType

      // clusters are special case no matter what, as need to update all the leaves/petals
    } else if (dataKey == "leafClusters" || dataKey == "flowers") {
      let fullOptions = {
        ...curEntity.optionsReference,
        ...newOptions,
      } as LeafClusterOptions | FlowerOptions
      // texture is special case, needs to be processed to update spacing/sides/area
      if (propertyRef == "texture") {
        fullOptions = {
          ...fullOptions,
          ...DEFAULT_LEAF_CLUSTER_SPREAD[newOptions.texture as LeafTexture],
        }
      }
      return this.updateClusterOptions({
        dataKey,
        cluster: curEntity as GrowLeafCluster,
        newOptions: fullOptions,
      })

      // plant option update affects all nested entities
    } else if (dataKey == "plants") {
      // special case if updating a property used by flowers/leafclusters
      const clusterProperties = ["leafColors", "texture", "flowerColors"]
      if (clusterProperties.indexOf(propertyRef) != -1) {
        // want to update just the clusters without re-growing whole plant
        return this.updateClusterFromPlant({
          growPlant: curEntity as GrowPlant,
          propertyRef: propertyRef as keyof GrowPlant,
          newOptions,
        })
      } else {
        // re-grow the plant with the new options
        const fullOptions = { ...curEntity.optionsReference, ...newOptions }
        updatedEntity = await this.growPlant({
          fromOptions: {
            curId: id,
            options: fullOptions as PlantOptions,
          },
        })
      }
    }

    this.UPDATE_ENTITY({
      dataKey,
      id,
      newEntity: updatedEntity,
    })
  }

  @Action
  updateClusterOptions(payload: {
    dataKey: "leafClusters" | "flowers"
    cluster: GrowLeafCluster | GrowFlower
    newOptions: LeafClusterOptions | FlowerOptions
  }) {
    const { dataKey, cluster, newOptions } = payload

    // initialize variables depending on dataKey/cluster type
    let processedOptions!: {
      [key: string]: number | LeafOptions[] | PetalOptions[]
    }
    let iterateOptions!: LeafOptions[] | PetalOptions[]
    let childDataKey!: "leaves" | "petals"
    if (dataKey == "leafClusters") {
      processedOptions = processLeafClusterOptions(
        newOptions as LeafClusterOptions
      ) as { clusterHeight: number; leafOptions: LeafOptions[] }
      iterateOptions = processedOptions.leafOptions as LeafOptions[]
      childDataKey = "leaves"
    } else {
      processedOptions = processFlowerOptions(newOptions as FlowerOptions) as {
        flowerHeight: number
        petalOptions: PetalOptions[]
      }
      iterateOptions = processedOptions.petalOptions as PetalOptions[]
      childDataKey = "petals"
    }

    // iterate through cluster's children and update
    const children = [] as number[]
    let index = 0
    for (const options of iterateOptions) {
      let newEntity!: GrowLeaf | GrowPetal

      if (cluster.children[index]) {
        // update existing leaf/petal
        newEntity = this.getEntity(childDataKey, cluster.children[index]) as
          | GrowLeaf
          | GrowPetal
        const mergeChildData =
          dataKey == "leafClusters"
            ? {
                ...processLeafOptions(options as LeafOptions),
                optionsReference: options as LeafOptions,
              }
            : {
                ...processPetalOptions(options as PetalOptions),
                optionsReference: options as PetalOptions,
              }

        this.mergeEntity({
          dataKey: childDataKey,
          id: newEntity.id,
          mergeData: mergeChildData,
        })
      } else {
        // create new leaf/petal
        newEntity =
          dataKey == "leafClusters"
            ? createLeaf(cluster.order, options as LeafOptions)
            : createPetal(cluster.order, options as PetalOptions)
        this.addFlowerLeaf({
          dataKey: childDataKey,
          entity: newEntity,
          preventDelay: true,
        })
      }
      children.push(newEntity.id)
      index++
    }

    // remove unneeded leaves/petals
    for (const oldChildId of cluster.children) {
      if (children.indexOf(oldChildId) == -1) {
        this.DELETE_ENTITY({ dataKey: childDataKey, id: oldChildId })
      }
    }

    // update plant option ref
    const mergeData = {
      children,
      height:
        dataKey == "leafClusters"
          ? processedOptions.clusterHeight
          : processedOptions.flowerHeight,
      optionsReference: newOptions,
    } as GrowEntitySnippet

    this.mergeEntity({ dataKey, id: cluster.id, mergeData })
  }

  @Action
  deleteOldestPlant() {
    const oldestBranch = Math.min(
      ...Object.keys(this.branches).map(id => {
        return parseInt(id)
      })
    )
    const oldestPlant = Object.values(this.plants).find(p => {
      return p.branches.indexOf(oldestBranch) != -1
    }) as GrowPlant
    if (oldestPlant) {
      this.deletePlant(oldestPlant)
    }
  }

  @Action
  growPlant(payload: {
    basePlant?: Plant
    varyColors?: boolean
    fromOptions?: { curId: number; options: PlantOptions }
    // position?: Position
  }): Promise<GrowPlant> {
    const { basePlant, varyColors, fromOptions } = payload
    let plantReturn!: GrowPlantReturn
    if (basePlant) {
      // create whole plant from Plant API data
      plantReturn = createPlant(basePlant, varyColors)
    } else if (fromOptions) {
      // use the custom options to update existing GrowPlant
      const curPlant = this.getEntity("plants", fromOptions.curId) as GrowPlant
      if (!curPlant) {
        return Promise.reject("Original plant did not exist")
      }
      plantReturn = processPlantOptions(fromOptions.options)
      // add the new options to the existing plant
      plantReturn.plant = { ...curPlant, ...plantReturn.plant }
      // remove the original plant's children, will be replaced
      this.deletePlantChildren(curPlant)
    } else {
      return Promise.reject("Need to include a base plant, or plant options")
    }

    const {
      branches,
      clustersWithLeaves,
      flowersWithPetals,
      plant,
    } = plantReturn
    const newPlant = plant as GrowPlant

    // branch/leafCluster/leaf Ids are 0 until entity is added to state
    const branchIds = []
    const clusterIds = {
      leafClusters: [] as number[],
      flowers: [] as number[],
    }
    // const leafClusterIds = []
    // const flowerIds = []

    for (const branch of branches) {
      this.addBranch(branch)
      branchIds.push(branch.id)
    }

    const clusterList = [
      {
        dataKey: "leafClusters" as "leafClusters",
        childKey: "leaves" as "leaves",
        overallCluster: clustersWithLeaves,
      },
      {
        dataKey: "flowers" as "flowers",
        childKey: "petals" as "petals",
        overallCluster: flowersWithPetals,
      },
    ]

    for (const clusterData of clusterList) {
      const { dataKey, childKey, overallCluster } = clusterData
      for (const overall of overallCluster) {
        const cluster = overall[dataKey as keyof typeof overall] as
          | GrowLeafCluster
          | GrowFlower
        const children = overall[childKey as keyof typeof overall] as
          | GrowPetal[]
          | GrowLeaf[]
        for (const child of children) {
          this.addFlowerLeaf({ dataKey: childKey, entity: child })
          cluster.children.push(child.id)
        }
        this.addCluster({ dataKey, cluster })
        clusterIds[dataKey].push(cluster.id)
      }
    }

    newPlant.branches = branchIds
    newPlant.leafClusters = clusterIds.leafClusters
    newPlant.flowers = clusterIds.flowers

    return Promise.resolve(newPlant)
  }

  @Action
  addCluster(payload: {
    dataKey: "flowers" | "leafClusters"
    cluster: GrowFlower | GrowLeafCluster
  }) {
    const { dataKey, cluster } = payload
    this.ADD_ENTITY({ dataKey, entity: cluster })
  }

  @Action
  addFlowerLeaf(payload: {
    dataKey: GrowDataKey
    entity: GrowPetal | GrowLeaf
    preventDelay?: boolean
  }) {
    const { dataKey, entity, preventDelay } = payload

    if (preventDelay) {
      this.ADD_ENTITY({ dataKey, entity })
    } else {
      const tempEntity: GrowPetal | GrowLeaf = {
        ...entity,
        rotation: NO_ROTATION(),
        shapes: [],
      }
      this.ADD_ENTITY({ dataKey, entity: tempEntity })
      entity.id = tempEntity.id
      setTimeout(() => {
        this.UPDATE_ENTITY({
          dataKey,
          id: tempEntity.id,
          newEntity: entity,
        })
      }, entity.order * 300)
      // TODO: better system for applying animations like this, this is temp for fun
      setTimeout(() => {
        this.UPDATE_ENTITY({
          dataKey,
          id: tempEntity.id,
          newEntity: {
            ...entity,
            rotation: NO_ROTATION(),
          },
        })
      }, entity.order * 300 + 250)
      setTimeout(() => {
        this.UPDATE_ENTITY({
          dataKey,
          id: tempEntity.id,
          newEntity: entity,
        })
      }, entity.order * 300 + 550)
    }
  }

  @Action
  toggleControls(show: boolean) {
    this.TOGGLE_CONTROLS(show)
  }

  @Action
  setRotation(payload: {
    id: number
    dataKey: GrowDataKey
    newRotations: Rotation
  }) {
    if (this[payload.dataKey][payload.id]) {
      this.UPDATE_ROTATION(payload)
    }
  }

  @Action
  setPosition(payload: {
    id: number
    dataKey: GrowDataKey
    newPositions: Position
  }) {
    if (this[payload.dataKey][payload.id]) {
      this.UPDATE_POSITION(payload)
    }
  }

  @Action
  setPlantZoom(payload: { id: number; newZoom: number }) {
    if (this.plants[payload.id]) {
      this.UPDATE_ZOOM(payload)
    }
  }

  @Action
  deleteEntity(payload: { dataKey: GrowDataKey; id: number }) {
    const { dataKey, id } = payload
    if (this[dataKey][id]) {
      this.DELETE_ENTITY(payload)
    }

    // remove reference from active plant/entity
    if (dataKey == "plants" && this.activeGrowPlant?.id == id) {
      this.ACTIVE_PLANT(null)
    } else if (
      this.activeEntityType == dataKey &&
      this.activeEntity?.id == id
    ) {
      this.ACTIVE_ENTITY({ dataKey, id: null })
    }
  }

  @Mutation
  RESET_PLANT_CHILDREN(id: number) {
    this.plants[id].branches = []
    this.plants[id].leafClusters = []
    this.plants[id].flowers = []
  }

  @Mutation
  UPDATE_ROTATION(payload: {
    id: number
    dataKey: GrowDataKey
    newRotations: Rotation
  }) {
    const { id, dataKey, newRotations } = payload
    this[dataKey][id].rotation = newRotations
  }

  @Mutation
  UPDATE_POSITION(payload: {
    id: number
    dataKey: GrowDataKey
    newPositions: Position
  }) {
    const { id, dataKey, newPositions } = payload
    // this[dataKey][id].position = newPositions
    // plants start off with no position
    Vue.set(this[dataKey][id], "position", newPositions)
  }

  @Mutation
  UPDATE_ZOOM(payload: { id: number; newZoom: number }) {
    const { id, newZoom } = payload
    Vue.set(this.plants[id], "zoom", newZoom)
  }

  @Mutation
  TOGGLE_CONTROLS(show: boolean) {
    this.showControls = show
  }

  // idea: have active plant, and active entity. active entity = active plant when first activated,
  // after that, can set active entity to any PART of the active plant
  @Mutation
  ACTIVE_PLANT(id: number | null) {
    if (id) {
      this.activeGrowPlant = this.activeEntity = this.plants[id]
      this.activeEntityType = "plants"
    } else {
      this.activeGrowPlant = this.activeEntity = this.activeEntityType = null
    }
  }

  @Mutation
  ACTIVE_ENTITY(payload: { dataKey: GrowDataKey; id: number | null }) {
    const { dataKey, id } = payload
    const newActive = id ? this[dataKey][id] : null
    if (newActive) {
      this.activeEntityType = dataKey
      this.activeEntity = newActive
    } else {
      // de-activating active part of plant -> activeEntity resets to the plant itself
      this.activeEntityType = this.activeGrowPlant ? "plants" : null
      this.activeEntity = this.activeGrowPlant ? this.activeGrowPlant : null
    }
  }

  @Mutation
  ADD_ENTITY(payload: { dataKey: GrowDataKey; entity: GrowType }) {
    const { dataKey, entity } = payload
    // ids are initialized at 0 when UI creates structure
    const numberKeys = Object.keys(this[dataKey]).map(k => {
      return parseInt(k)
    })
    const uniqueId = Math.max(0, ...numberKeys) + 1
    entity.id = uniqueId
    Vue.set(this[dataKey], uniqueId, entity)
  }

  @Mutation
  UPDATE_ENTITY(payload: {
    dataKey: GrowDataKey
    id: number
    newEntity: GrowType
  }) {
    const { dataKey, id, newEntity } = payload
    if (!this[dataKey][id]) {
      // have timeout for leaf/branch animations -- this could get called after plant/entity deleted
      return
    }
    if (dataKey == "branches") {
      // when updating branches, need to maintain object refs instead of re-assigning
      const { startPoint, endPoint, rotation } = this[dataKey][id] as GrowBranch
      const growBranch = newEntity as GrowBranch
      endPoint.x = growBranch.endPoint.x
      endPoint.y = growBranch.endPoint.y
      startPoint.x = growBranch.startPoint.x
      startPoint.y = growBranch.startPoint.y
      rotation.z = growBranch.rotation.z

      this[dataKey][id] = growBranch
      this[dataKey][id].endPoint = endPoint
      this[dataKey][id].startPoint = startPoint
      this[dataKey][id].rotation = rotation
    } else {
      this[dataKey][id] = newEntity as
        | GrowPlant
        | GrowLeafCluster
        | GrowLeaf
        | GrowFlower
    }
    // need to refresh active entity reference
    if (this.activeEntity?.id == id && this.activeEntityType == dataKey) {
      this.activeEntity = this[dataKey][id] ? this[dataKey][id] : null
      if (dataKey == "plants") {
        this.activeGrowPlant = this.activeEntity as GrowPlant | null
      }
    }
  }

  @Mutation
  DELETE_ENTITY(payload: { dataKey: GrowDataKey; id: number }) {
    const { dataKey, id } = payload
    // in case another part of app has a variable tied to this reference
    this[dataKey][id].deleted = true
    Vue.delete(this[dataKey], id)
  }
}
