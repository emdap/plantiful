import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import store from "@/store"
import {
  Coordinate,
  GrowData,
  GrowPlant,
  GrowState,
  Rotation,
  GrowBranch,
  GrowLeaf,
  GrowLeafCluster,
  GrowFlower,
  GrowBasis,
  GrowDataKey,
  GrowType
} from "@/store/interfaces"
import Vue from "vue"

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
  activePlant: GrowPlant | null = null
  activeEntity: GrowType | null = null
  activeEntityType: GrowDataKey | null = null
  showControls = true
  hasKeyListeners = false

  // TODO: add lists for which GrowTypes allow rotation, repositioning, etc, then check against
  // that list before activating mutation
  // can re-use for which controls to display

  // private get entityIndex() {
  //   return (entityId: string) => {
  //     return this.entities.findIndex(entity => {
  //       return entity.id == entityId
  //     })
  //   }
  // }

  public get getEntity() {
    return (dataKey: GrowDataKey, id: number) => {
      return this[dataKey][id]
    }
  }

  // public get countPlantEntities() {
  //   return (plantId: number): number => {
  //     return this.entities.filter(entity => {
  //       return entity.plantId == plantId
  //     }).length
  //   }
  // }

  @Action
  setActivePlant(id: number) {
    if (this["plants"][id]) {
      this.ACTIVE_ENTITY({ dataKey: "plants", id })
    }
  }

  @Action
  removeActivePlant() {
    this.ACTIVE_ENTITY({ id: null, dataKey: "plants" })
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
    this.ADD_ENTITY({ dataKey: "branches", entity: branch })
  }

  @Action
  addLeafCluster(leafCluster: GrowLeafCluster) {
    this.ADD_ENTITY({ dataKey: "leafClusters", entity: leafCluster })
  }

  @Action
  addLeaf(leaf: GrowLeaf) {
    this.ADD_ENTITY({ dataKey: "leaves", entity: leaf })
  }

  @Action
  addFlower(flower: GrowFlower) {
    this.ADD_ENTITY({ dataKey: "flowers", entity: flower })
  }

  // @Action
  // updatePlant(payload: {plantId: number, newPlant: GrowPlant}) {
  //   if (this.plants[plantId]) {
  //   // const entityIndex = this.entityIndex(entityId)
  //   // if (entityIndex > -1) {
  //     this.UPDATE_ENTITY(payload: plantId, newPlant)
  //   }
  // }

  // @Action
  // removePLant(plantId: number) {
  //   // const entityIndex = this.entityIndex(entityId)
  //   if (this.plants[plantId]) {
  //     // if (entityIndex > -1) {
  //     this.REMOVE_ENTITY(plantId)
  //   }
  // }

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
    newPositions: Coordinate
  }) {
    if (this[payload.dataKey][payload.id]) {
      this.UPDATE_POSITION(payload)
    }
    // this.UPDATE_POSITION(newPositions)
  }

  @Mutation
  UPDATE_ROTATION(payload: {
    id: number
    dataKey: GrowDataKey
    newRotations: Rotation
  }) {
    const { id, dataKey, newRotations } = payload
    Vue.set(this[dataKey][id], "rotation", newRotations)
    // if (this.activePlant)
    // (this.activeEntity as GrowPlant).rotation = rotation
  }

  @Mutation
  UPDATE_POSITION(payload: {
    id: number
    dataKey: GrowDataKey
    newPositions: Coordinate
  }) {
    const { id, dataKey, newPositions } = payload
    Vue.set(this[dataKey][id], "position", newPositions)
    // (this.activeEntity as GrowPlant).position = position
  }

  @Mutation
  ADDED_LISTENERS(added: boolean) {
    this.hasKeyListeners = added
  }

  @Mutation
  TOGGLE_CONTROLS(show: boolean) {
    this.showControls = show
  }

  @Mutation
  ACTIVE_ENTITY(payload: { dataKey: GrowDataKey; id: number | null }) {
    const { dataKey, id } = payload
    const newActive = id ? this[dataKey][id] : null
    if (dataKey == "plants") {
      this.activePlant = newActive as GrowPlant | null
    } else {
      this.activeEntity = newActive
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
    entityId: number
    newEntity: GrowType
  }) {
    const { dataKey, entityId, newEntity } = payload
    // TODO: test if actually need vue set for this, should already be reactive
    Vue.set(this[dataKey], entityId, newEntity)
  }

  @Mutation
  REMOVE_ENTITY(payload: { dataKey: GrowDataKey; entity: GrowType }) {
    const { dataKey, entity } = payload
    Vue.delete(this[dataKey], entity.id)
  }
}
