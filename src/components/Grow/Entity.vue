<template>
  <div :style="styleObj(entityData)">
    <shape
      v-for="(shape, index) in entityData.shapes"
      :key="`shape-${entityData.id}-${index}`"
      :growData="shape"
    />
  </div>
</template>

<script lang="ts">
import { GrowShape } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"
import messages from "@/fixtures/Messages"
import Shape from "@/components/Grow/Shape.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"

@Component({
  components: {
    Shape
  }
})
export default class GrowEntity extends GrowMixin {
  @Prop() entityData!: GrowEntity

  public mounted() {
    if (!this.entityData) {
      throw console.error(messages.grow.missingEntityData)
    }
  }
}
</script>
