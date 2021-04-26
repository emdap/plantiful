<template>
  <div :style="containerStyle">
    <!-- using slot so that template logic is all in GridController -->
    <slot></slot>
  </div>
</template>

<script lang="ts">
import GridMixin from "@/mixins/GridMixin.vue"
import { GridContainer } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Component from "vue-class-component"

// purpose of this component -- and why it's separated from GridController -- is to set styling &
//  respond if all zones in a container are closed

@Component({})
export default class Container extends GridMixin {
  @Prop({ required: true }) containerData!: GridContainer
  @Prop({ required: true }) containerIndex!: number

  public get containerStyle() {
    let height = "",
      width = ""
    if (
      this.containerData.sizeRatio.height &&
      this.containerData.sizeRatio.width
    ) {
      height = this.containerData.sizeRatio.height * 100 + "%"
      width = this.containerData.sizeRatio.width * 100 + "%"
    }
    // need to use min-width as container's parent has display: flex
    return { height, "min-width": width }
  }
}
</script>
