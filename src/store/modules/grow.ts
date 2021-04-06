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
import { NO_POSITION, NO_ROTATION } from "@/fixtures/Grow/Defaults"

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
  showControls = true
  hasKeyListeners = false

  // TODO: add lists for which GrowTypes allow rotation, repositioning, etc, then check against
  // that list before activating mutation
  // can re-use for which controls to display

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
    }
  }

  @Action
  removeActivePlant() {
    this.ACTIVE_PLANT(null)
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
        entityId: tempBranch.id,
        newEntity: branch
      })
    }, branch.order * 250)
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
        entityId: tempLeaf.id,
        newEntity: leaf
      })
    }, leaf.order * 300)
    // TODO: better system for applying animations like this, this is temp for fun
    setTimeout(() => {
      this.UPDATE_ENTITY({
        dataKey: "leaves",
        entityId: tempLeaf.id,
        newEntity: {
          ...leaf,
          rotation: NO_ROTATION()
        }
      })
    }, leaf.order * 300 + 250)
    setTimeout(() => {
      this.UPDATE_ENTITY({
        dataKey: "leaves",
        entityId: tempLeaf.id,
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
    newPositions: Coordinate
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
    newPositions: Coordinate
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
    entityId: number
    newEntity: GrowType
  }) {
    const { dataKey, entityId, newEntity } = payload
    this[dataKey][entityId] = newEntity
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
