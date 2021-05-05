<template>
  <div
    :id="containerData.name"
    class="grid h-full flex-grow overflow-hidden"
    :style="containerStyle"
  >
    <zone
      v-for="zone in myOpenZones"
      :key="'zone-' + zone.id"
      :zoneData="zone"
      :containerId="containerData.id"
      :containerResizing="resizing"
    />
  </div>
</template>

<script lang="ts">
import GridMixin from "@/mixins/GridMixin.vue"
import { GridAxes, GridContainer, GridZone } from "@/store/interfaces"
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
  @Prop({ required: true }) resizing!: boolean

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
    // need to use min-width as container's parent has display: flex
    return {
      height: "100%",
      "min-width": this.containerWidth,
      "grid-template-rows": this.gridTemplate.rows.join(" "),
      "grid-template-columns": this.gridTemplate.columns.join(" "),
    }
  }

  public get containerWidth() {
    return this.myOpenZones.length && this.containerData.sizeRatio.width
      ? this.containerData.sizeRatio.width * 100 + "%"
      : ""
  }

  public get gridTemplate() {
    const template = { rows: [], columns: [] } as {
      [key in typeof GridAxes[number]]: string[]
    }
    for (const axis of GridAxes) {
      for (const dim of Object.keys(this.containerData[axis])) {
        // iterate the rows/columns that the container has
        const gridArea = this.containerData[axis][parseInt(dim)]
        if (gridArea.zones.length) {
          template[axis].push(
            `${
              gridArea.sizeRatio > -1
                ? gridArea.sizeRatio * 100 + "%"
                : "minmax(0, 1fr)"
            }`
          )
        } else {
          template[axis].push("0")
        }
      }
    }
    return template
  }
}
</script>
