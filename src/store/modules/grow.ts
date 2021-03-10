import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import store from "@/store"
import { GrowEntity } from "@/store/interfaces"

@Module({
  dynamic: true,
  namespaced: true,
  name: "grow",
  store
})
export default class GrowModule extends VuexModule {
  entities: GrowEntity[] = []
  activeEntityId: string | null = null
  showControls = true

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
  setActiveEntity(entityId: string) {
    this.ACTIVE_ENTITY(entityId)
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

  @Mutation
  TOGGLE_CONTROLS(show: boolean) {
    this.showControls = show
  }

  @Mutation
  ACTIVE_ENTITY(entityId: string | null) {
    this.activeEntityId = entityId
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
