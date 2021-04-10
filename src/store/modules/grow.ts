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
  GrowOptionsType,
  Plant,
  PlantOptions,
  GrowPlantReturn
} from "@/store/interfaces"
import Vue from "vue"
import { NO_POSITION, NO_ROTATION } from "@/fixtures/Grow/Defaults"
import {
  createLeafCluster,
  createLeaves,
  createPlant,
  createPlantFromOptions
} from "@/services/growPlants"
import growUtil from "@/utilities/growUtil"

@Module({
  dynamic: true,
  namespaced: true,
  name: "grow",
  store
})
export default class GrowModule extends VuexModule implements GrowState {
  plants = {} as GrowData<GrowPlant>
  branches = {} as GrowData<GrowBranch>
  leafClusters = {} as GrowData<GrowLeafCluster>
  leaves = {} as GrowData<GrowLeaf>
  flowers = {} as GrowData<GrowFlower>
  activeGrowPlant: GrowPlant | null = null
  activeEntity: GrowType | null = null
  activeEntityType: GrowDataKey | null = null
  growWindowActive = false
  showControls = false
  hasKeyListeners = false

  public get getEntity() {
    return (dataKey: GrowDataKey, id: number) => {
      return this[dataKey][id]
    }
  }

  @Action
  setGrowWindowActive(active: boolean) {
    this.GROW_WINDOW_ACTIVE(active)
  }

  @Action
  setActivePlant(id: number) {
    if (this["plants"][id]) {
      this.ACTIVE_PLANT(id)
      this.context.dispatch("garden/getOnePlant", this["plants"][id].plantId, {
        root: true
      })
      this.TOGGLE_CONTROLS(true)
    }
  }

  @Action
  removeActivePlant() {
    console.log("remove active")
    this.ACTIVE_PLANT(null)
    this.TOGGLE_CONTROLS(false)
  }

  @Action
  setActiveEntity(payload: { id: number; dataKey: GrowDataKey }) {
    if (this[payload.dataKey][payload.id]) {
      // may want to have separate active branch/leaf/flower properties in future
      this.ACTIVE_ENTITY(payload)
    }
  }

  @Action
  removeActiveEntity(dataKey: GrowDataKey) {
    this.ACTIVE_ENTITY({ id: null, dataKey })
  }

  @Action
  addPlant(plant: GrowPlant) {
    this.ADD_ENTITY({ dataKey: "plants", entity: plant })
  }

  @Action
  addBranch(branch: GrowBranch) {
    // TODO: is this the best method for accomplishing this? maybe create a zeroing out function instead?
    const tempBranch: GrowBranch = {
      ...branch,
      rotation: NO_ROTATION(),
      branchHeight: 0,
      height: 0
    }
    this.ADD_ENTITY({ dataKey: "branches", entity: tempBranch })
    branch.id = tempBranch.id // id created upon adding
    setTimeout(() => {
      this.UPDATE_ENTITY({
        dataKey: "branches",
        id: tempBranch.id,
        newEntity: branch
      })
    }, branch.order * 250)
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
  async setEntityOptions(payload: {
    id: number
    dataKey: GrowDataKey
    newOptions: GrowOptionsType
  }): Promise<void> {
    const { id, dataKey, newOptions } = payload
    if (dataKey == "plants") {
      const existingPlant = this.getEntity(dataKey, id) as GrowPlant
      const newPlant = await this.growPlant({
        fromOptions: {
          plantId: existingPlant.id,
          name: existingPlant.name,
          options: newOptions as PlantOptions
        }
      })
      newPlant.position = existingPlant.position
      newPlant.id = existingPlant.id
      this.UPDATE_ENTITY({
        dataKey,
        id,
        newEntity: newPlant
      })
      if (this.activeEntity?.id == id) {
        // need to refresh entity reference
        this.setActiveEntity({ id, dataKey })
      }
    } else if (dataKey == "leafClusters") {
      const existingCluster = this.getEntity(dataKey, id) as GrowLeafCluster
      // const newCluster = createLeafCluster(existingCluster.order, )
    }
    return Promise.resolve()
  }

  @Action
  growPlant(payload: {
    basePlant?: Plant
    fromOptions?: { plantId: number; name: string; options: PlantOptions }
    position?: Position
  }): Promise<GrowPlant> {
    const { basePlant, fromOptions, position } = payload
    let plantReturn!: GrowPlantReturn
    if (basePlant) {
      plantReturn = createPlant(basePlant, true)
    } else if (fromOptions) {
      plantReturn = createPlantFromOptions(
        fromOptions.plantId,
        fromOptions.name,
        fromOptions.options
      )
    }

    const { branches, clustersWithLeaves, plant } = plantReturn

    const branchIds = []
    const leafClusterIds = []
    for (const branch of branches) {
      this.addBranch(branch)
      branchIds.push(branch.id)
    }
    for (const overallCluster of clustersWithLeaves) {
      // leafCluster starts with empty list for leaf ids
      const { leafCluster, leaves } = overallCluster
      for (const leaf of leaves) {
        this.addLeaf(leaf)
        // leaf now as id assigned
        leafCluster.leaves.push(leaf.id)
      }
      this.addLeafCluster(leafCluster)
      leafClusterIds.push(leafCluster.id)
    }

    plant.branches = branchIds
    plant.leafClusters = leafClusterIds

    plant.position = position
      ? { ...position, y: position.y + plant.height / 2 }
      : NO_POSITION()
    // setPosition.y += plant.height / 2
    // plant.position = setPosition

    return plant
  }

  @Action
  addLeafCluster(leafCluster: GrowLeafCluster) {
    this.ADD_ENTITY({ dataKey: "leafClusters", entity: leafCluster })
  }

  @Action
  addLeaf(leaf: GrowLeaf) {
    const tempLeaf: GrowLeaf = {
      ...leaf,
      rotation: NO_ROTATION(),
      shapes: []
    }
    this.ADD_ENTITY({ dataKey: "leaves", entity: tempLeaf })
    leaf.id = tempLeaf.id
    setTimeout(() => {
      this.UPDATE_ENTITY({
        dataKey: "leaves",
        id: tempLeaf.id,
        newEntity: leaf
      })
    }, leaf.order * 300)
    // TODO: better system for applying animations like this, this is temp for fun
    setTimeout(() => {
      this.UPDATE_ENTITY({
        dataKey: "leaves",
        id: tempLeaf.id,
        newEntity: {
          ...leaf,
          rotation: NO_ROTATION()
        }
      })
    }, leaf.order * 300 + 250)
    setTimeout(() => {
      this.UPDATE_ENTITY({
        dataKey: "leaves",
        id: tempLeaf.id,
        newEntity: leaf
      })
    }, leaf.order * 300 + 550)
  }

  @Action
  addFlower(flower: GrowFlower) {
    this.ADD_ENTITY({ dataKey: "flowers", entity: flower })
  }

  @Action
  toggleControls(show: boolean) {
    this.TOGGLE_CONTROLS(show)
  }

  @Action
  addedListeners(added: boolean) {
    this.ADDED_LISTENERS(added)
  }

  @Action
  setRotation(payload: {
    id: number
    dataKey: GrowDataKey
    newRotations: Rotation
  }) {
    // TODO: for all set actions, check if dataKey is allowed to have rotation/whatever set
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

  @Mutation
  GROW_WINDOW_ACTIVE(active: boolean) {
    this.growWindowActive = active
  }

  @Mutation
  UPDATE_ROTATION(payload: {
    id: number
    dataKey: GrowDataKey
    newRotations: Rotation
  }) {
    const { id, dataKey, newRotations } = payload
    this[dataKey][id].rotation = newRotations
    // Vue.set(this[dataKey][id], "rotation", newRotations)
  }

  @Mutation
  UPDATE_POSITION(payload: {
    id: number
    dataKey: GrowDataKey
    newPositions: Position
  }) {
    const { id, dataKey, newPositions } = payload
    this[dataKey][id].position = newPositions
    // Vue.set(this[dataKey][id], "position", newPositions)
  }

  @Mutation
  ADDED_LISTENERS(added: boolean) {
    this.hasKeyListeners = added
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
    const uniqueId = Object.keys(this[dataKey]).length + 1
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
    this[dataKey][id] = newEntity
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
  DELETE_ENTITY(payload: { dataKey: GrowDataKey; id: number }) {
    const { dataKey, id } = payload
    Vue.delete(this[dataKey], id)
  }
}
