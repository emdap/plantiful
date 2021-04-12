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
  GrowPlantReturn,
  GrowControlKeys,
  GrowOptionsControlKeys,
  LeafClusterOptions,
  GrowShape,
  LeafTexture,
  LeafOptions,
  BranchOptions
} from "@/store/interfaces"
import Vue from "vue"
import {
  DEFAULT_LEAF_CLUSTER_SPREAD,
  NO_POSITION,
  NO_ROTATION
} from "@/fixtures/Grow/Defaults"
import {
  createLeafCluster,
  createLeaf,
  createPlant,
  processPlantOptions,
  processLeafClusterOptions,
  processLeafOptions,
  processBranchOptions
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
    // need to maintain rotation reference! otherwise controls on angle don't update leaf cluster
    const origAngle = branch.rotation.z
    const tempBranch: GrowBranch = {
      ...branch,
      branchHeight: 0,
      height: 0
    }
    tempBranch.rotation.z = 0
    this.ADD_ENTITY({ dataKey: "branches", entity: tempBranch })
    branch.id = tempBranch.id // id created upon adding
    setTimeout(() => {
      branch.rotation.z = origAngle
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
  mergeEntity(payload: {
    dataKey: GrowDataKey
    id: number
    mergeData: {
      [key in GrowControlKeys]?:
        | GrowType[keyof GrowType]
        | GrowShape[]
        | number[]
    }
  }) {
    const { dataKey, id, mergeData } = payload
    const curEntity = this.getEntity(dataKey, id)
    const newEntity = { ...curEntity, ...mergeData } as GrowType
    this.UPDATE_ENTITY({ dataKey, id, newEntity })
  }

  @Action
  // TODO: split this up into helper functions
  async setEntityOptions(payload: {
    id: number
    dataKey: GrowDataKey
    // this is super annoying but idk how to avoid it without using any
    newOptions: {
      [key in GrowOptionsControlKeys]?:
        | string
        | number
        | number[]
        | string[]
        | Position
    }
    propertyRef: string
  }) {
    const { id, dataKey, newOptions, propertyRef } = payload
    const curEntity = this.getEntity(dataKey, id)
    let updatedEntity!: GrowType
    if (dataKey == "leaves") {
      const processedOptions = processLeafOptions(newOptions as LeafOptions)
      const updatedOptions = {
        ...curEntity.optionsReference,
        ...(newOptions as LeafOptions)
      }
      updatedEntity = {
        ...curEntity,
        ...processedOptions,
        optionsReference: updatedOptions
      } as GrowLeaf
    } else if (dataKey == "branches") {
      console.log(curEntity.startPoint.x, newOptions.startPoint.x)
      const processedOptions = processBranchOptions(newOptions as BranchOptions)
      console.log(processedOptions.startPoint.x)
      const updatedOptions = {
        ...curEntity.optionsReference,
        ...(newOptions as BranchOptions)
      }
      updatedEntity = {
        ...curEntity,
        ...processedOptions,
        optionsReference: updatedOptions
      } as GrowBranch
      console.log(updatedEntity.position.x)
    } else if (dataKey == "leafClusters") {
      // leaf clusters are special case no matter what, as need to update all the leaves
      let fullOptions = {
        ...curEntity.optionsReference,
        ...newOptions
      } as LeafClusterOptions
      // texture is special case, needs to be processed to update spacing/sides/area
      if (propertyRef == "texture") {
        fullOptions = {
          ...fullOptions,
          ...DEFAULT_LEAF_CLUSTER_SPREAD[newOptions.texture as LeafTexture]
        }
      }
      this.updateLeafClusterOptions({
        leafCluster: curEntity as GrowLeafCluster,
        newOptions: fullOptions
      })
      return
    } else if (dataKey == "plants") {
      // special case if updating a property used by leafClusters
      // plant option name -> cluster property name
      const leafClusterProperties = {
        leafColors: "colors",
        leafTexture: "texture"
      }
      if (Object.keys(leafClusterProperties).indexOf(propertyRef) != -1) {
        // make new cluster options using given leafColors/leafTexture & conver to equivalent property name
        const clusterProperty =
          leafClusterProperties[
            propertyRef as keyof typeof leafClusterProperties
          ]
        const newClusterOptions = {
          [clusterProperty]: newOptions[propertyRef as keyof typeof newOptions]
        }
        for (const clusterId of (curEntity as GrowPlant).leafClusters) {
          // recursively call setEntityOptions to update the leaf cluster
          this.setEntityOptions({
            id: clusterId,
            dataKey: "leafClusters",
            newOptions: newClusterOptions,
            propertyRef: clusterProperty
          })
        }
        // update options on plant as well to reflect new color/texture
        this.mergeEntity({
          dataKey,
          id,
          mergeData: { optionsReference: newOptions as PlantOptions }
        })
        return
      } else {
        const fullOptions = { ...curEntity.optionsReference, ...newOptions }
        console.log(fullOptions)
        updatedEntity = await this.growPlant({
          fromOptions: {
            curId: id,
            options: fullOptions as PlantOptions
          }
        })
      }
    }
    this.UPDATE_ENTITY({
      dataKey,
      id,
      newEntity: updatedEntity
    })
  }

  @Action
  updateLeafClusterOptions(payload: {
    leafCluster: GrowLeafCluster
    newOptions: LeafClusterOptions
  }) {
    const { leafCluster, newOptions } = payload
    // const leafCluster = this.getEntity("leafClusters", id) as GrowLeafCluster
    const processedOptions = processLeafClusterOptions(newOptions)
    const leaves = []
    let index = 0
    // need to iterate through leaves in cluster, update with results of new cluster options
    for (const leafOpt of processedOptions.leafOptions) {
      let newLeaf!: GrowLeaf
      if (leafCluster.leaves[index]) {
        // update existing leaf
        newLeaf = this.getEntity(
          "leaves",
          leafCluster.leaves[index]
        ) as GrowLeaf
        const mergeData = {
          ...processLeafOptions(leafOpt),
          optionsReference: leafOpt
        }
        this.mergeEntity({ dataKey: "leaves", id: newLeaf.id, mergeData })
      } else {
        // create new leaf
        newLeaf = createLeaf(leafCluster.order, leafOpt)
        this.addLeaf({ leaf: newLeaf, preventDelay: true })
      }
      leaves.push(newLeaf.id)
      index++
    }
    // remove unneeded leaves
    for (const oldLeafId of leafCluster.leaves) {
      if (leaves.indexOf(oldLeafId) == -1) {
        this.DELETE_ENTITY({ dataKey: "leaves", id: oldLeafId })
      }
    }
    // update cluster
    const mergeData = {
      leaves,
      height: processedOptions.clusterHeight,
      optionsReference: newOptions
    }
    this.mergeEntity({ dataKey: "leafClusters", id: leafCluster.id, mergeData })
  }

  @Action
  growPlant(payload: {
    basePlant?: Plant
    fromOptions?: { curId: number; options: PlantOptions }
    position?: Position
  }): Promise<GrowPlant> {
    const { basePlant, fromOptions, position } = payload
    let plantReturn!: GrowPlantReturn
    if (basePlant) {
      const usePosition = position ? position : NO_POSITION()
      plantReturn = createPlant(basePlant, usePosition, true)
      console.log(plantReturn.plant.optionsReference.spread)
    } else if (fromOptions) {
      const curPlant = this.getEntity("plants", fromOptions.curId)
      if (!curPlant) {
        return Promise.reject("Original plant did not exist")
      }
      plantReturn = processPlantOptions(fromOptions.options)
      // add the new options to the existing plant
      plantReturn.plant = { ...curPlant, ...plantReturn.plant }
    } else {
      return Promise.reject("Need to include a base plant, or plant options")
    }

    const { branches, clustersWithLeaves, plant } = plantReturn
    const newPlant = plant as GrowPlant

    // branch/leafCluster/leaf Ids are 0 until entity is added to state
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
        this.addLeaf({ leaf })
        // leaf now as id assigned
        leafCluster.leaves.push(leaf.id)
      }
      this.addLeafCluster(leafCluster)
      leafClusterIds.push(leafCluster.id)
    }

    newPlant.branches = branchIds
    newPlant.leafClusters = leafClusterIds

    return Promise.resolve(newPlant)
  }

  @Action
  addLeafCluster(leafCluster: GrowLeafCluster) {
    this.ADD_ENTITY({ dataKey: "leafClusters", entity: leafCluster })
  }

  @Action
  addLeaf(payload: { leaf: GrowLeaf; preventDelay?: boolean }) {
    const { leaf, preventDelay } = payload

    if (preventDelay) {
      this.ADD_ENTITY({ dataKey: "leaves", entity: leaf })
    } else {
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
    if (dataKey == "branches") {
      // when updating branches, need to maintain object refs instead of re-assigning
      if (id == 1)
        console.log(
          this[dataKey][id].endPoint.x,
          this[dataKey][id].startPoint.x
        )
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
  DELETE_ENTITY(payload: { dataKey: GrowDataKey; id: number }) {
    const { dataKey, id } = payload
    Vue.delete(this[dataKey], id)
  }
}
