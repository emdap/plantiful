<template>
  <div :style="entityStyle(growData)" class="absolute"></div>
</template>

<script lang="ts">
import { GrowShape } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"
import GrowMixin from "@/mixins/GrowMixin.vue"

@Component({})
export default class Shape extends GrowMixin {
  @Prop({ required: true }) growData!: GrowShape
}
</script>
