<template>
  <div :style="styleObj(growData)" class="absolute"></div>
</template>

<script lang="ts">
import { GrowShape } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"
import messages from "@/fixtures/Messages"
import GrowMixin from "@/mixins/GrowMixin.vue"

@Component({})
export default class Shape extends GrowMixin {
  @Prop() growData!: GrowShape

  public mounted() {
    if (!this.growData) {
      throw console.error(messages.grow.missingGrowData)
    }
  }
}
</script>
