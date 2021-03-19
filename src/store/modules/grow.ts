import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import store from "@/store"
import {
  GrowEntity,
  GrowPosition,
  GrowState,
  Positions,
  Rotation
} from "@/store/interfaces"

@Module({
  dynamic: true,
  namespaced: true,
  name: "grow",
  store
})
export default class GrowModule extends VuexModule implements GrowState {
  entities: GrowEntity[] = []
  activeEntity: GrowEntity | null = null
  showControls = true
  hasKeyListeners = false

  private get entityIndex() {
    return (entityId: string) => {
      return this.entities.findIndex(entity => {
        return entity.id == entityId
      })
    }
  }

  public get getEntity() {
    return (entityId: string) => {
      return this.entities.find(entity => {
        return entity.id == entityId
      })
    }
  }

  public get countPlantEntities() {
    return (plantId: number): number => {
      return this.entities.filter(entity => {
        return entity.plantId == plantId
      }).length
    }
  }

  @Action
  setActiveEntity(entity: GrowEntity) {
    this.ACTIVE_ENTITY(entity)
  }

  @Action
  removeActiveEntity() {
    this.ACTIVE_ENTITY(null)
  }

  @Action
  addEntity(entity: GrowEntity) {
    this.ADD_ENTITY(entity)
  }

  @Action
  updateEntity(entityId: string, newEntity: GrowEntity) {
    const entityIndex = this.entityIndex(entityId)
    if (entityIndex > -1) {
      this.UPDATE_ENTITY(entityIndex, newEntity)
    }
  }

  @Action
  removeEntity(entityId: string) {
    const entityIndex = this.entityIndex(entityId)
    if (entityIndex > -1) {
      this.REMOVE_ENTITY(entityIndex)
    }
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
  setRotation(newRotations: Rotation) {
    this.UPDATE_ROTATION(newRotations)
  }

  @Action
  setPosition(newPositions: GrowPosition) {
    this.UPDATE_POSITION(newPositions)
  }

  @Mutation
  UPDATE_ROTATION(rotation: Rotation) {
    ;(this.activeEntity as GrowEntity).rotation = rotation
  }

  @Mutation
  UPDATE_POSITION(position: GrowPosition) {
    ;(this.activeEntity as GrowEntity).position = position
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
  ACTIVE_ENTITY(entity: GrowEntity | null) {
    this.activeEntity = entity
  }

  @Mutation
  ADD_ENTITY(entity: GrowEntity) {
    this.entities.push(entity)
  }

  @Mutation
  UPDATE_ENTITY(entityIndex: number, newEntity: GrowEntity) {
    this.entities.splice(entityIndex, 1, newEntity)
  }

  @Mutation
  REMOVE_ENTITY(entityIndex: number) {
    this.entities.splice(entityIndex, 1)
  }
}
