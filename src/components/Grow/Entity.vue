<template>
  <div
    :id="entityData.id"
    :style="styleObj(entityData)"
    class="absolute"
    :class="{ 'outline-black': isActive }"
    @dblclick="setActive()"
  >
    <shape
      v-for="(shape, index) in entityData.shapes"
      :key="`shape-${entityData.id}-${index}`"
      :growData="shape"
    />
  </div>
</template>

<script lang="ts">
import { GrowEntity } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import messages from "@/fixtures/Messages"
import Shape from "@/components/Grow/Shape.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"

@Component({
  components: {
    Shape
  }
})
export default class Entity extends GrowMixin {
  @Prop() entityData!: GrowEntity

  public mounted() {
    if (!this.entityData) {
      throw console.error("no entity provided!")
    }
  }

  public get isActive(): boolean {
    return grow.activeEntity?.id == this.entityData.id
  }

  public setActive() {
    console.log("entity active")
    if (this.isActive) {
      grow.removeActiveEntity()
    } else {
      grow.setActiveEntity(this.entityData)
    }
  }
}
</script>
