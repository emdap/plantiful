<template>
  <div :style="containerStyle">
    <zone
      v-for="zone in myOpenZones"
      :key="'zone-' + zone.id"
      :zoneData="zone"
      :containerId="containerData.id"
    />
  </div>
</template>

<script lang="ts">
import GridMixin from "@/mixins/GridMixin.vue"
import { GridContainer, GridZone, Size } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Component from "vue-class-component"
import Zone from "@/components/Grid/Zone.vue"
import { NO_SIZE } from "@/fixtures/Defaults"

@Component({
  components: {
    Zone,
  },
})
export default class Container extends GridMixin {
  @Prop({ required: true }) containerData!: GridContainer
  @Prop({ required: true }) containerIndex!: number

  public restoreSize = NO_SIZE()
  public restoreRatio = NO_SIZE()

  public get myOpenZones() {
    return this.containerZones(this.containerData.id).filter(z => {
      return z.open
    })
  }

  @Watch("myOpenZones")
  public checkAnyOpen(newZones: GridZone[], oldZones: GridZone[]) {
    if (!newZones.length) {
      this.restoreSize = this.containerData.size
      this.restoreRatio = this.containerData.sizeRatio
      this.$emit("close-container", this.containerIndex)
    } else if (
      !this.containerData.size.width &&
      !oldZones.length &&
      newZones.length
    ) {
      // only restore size if has lost width
      this.$emit(
        "restore-container",
        this.containerIndex,
        this.restoreSize,
        this.restoreRatio
      )
    }
  }

  public get containerStyle() {
    let height = ""
    let width = ""
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
