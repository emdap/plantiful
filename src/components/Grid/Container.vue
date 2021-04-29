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
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
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
    // really only care about width for containers, height is always 100%
    let width = ""

    if (this.myOpenZones.length && this.containerData.sizeRatio.width) {
      width = this.containerData.sizeRatio.width * 100 + "%"
    }

    const { rows, columns } = this.gridTemplate
    // need to use min-width as container's parent has display: flex
    return {
      height: "100%",
      "min-width": width,
      "grid-template-rows": rows,
      "grid-template-columns": columns,
    }
  }

  public get gridTemplate() {
    const template = { rows: "", columns: "" }
    let hasZones = 0
    for (const axis of GridAxes) {
      for (const key of Object.keys(this.containerData[axis])) {
        // iterate the rows/columns that the container has
        const gridArea = this.containerData[axis][parseInt(key)]
        console.log(axis, key, gridArea.zones.length, gridArea.zones)
        if (gridArea.zones.length) {
          template[axis] += `${
            gridArea.sizeRatio ? gridArea.sizeRatio + "%" : "minmax(0, 1fr)"
          } `
          hasZones++
        }
      }
      if (hasZones == 1) {
        template[axis] = "auto"
      }
    }
    console.log("template:", template.rows, ", ", template.columns)
    return template
  }

  // public gridTemplateConstructor() {
  //   console.log("constructing template for ", this.containerData.name)
  //   console.log(this.containerData.columns)
  //   const gridTemplate = {rows: "", columns: ""}
  //   let hasZones = 0
  //   for (const axis of GridAxes) {
  //     for (const key of Object.keys(this.containerData[axis])) {
  //       // iterate the rows/columns that the container has
  //       const gridArea = this.containerData[axis][parseInt(key)]
  //       console.log(axis, key, gridArea.zones.length, gridArea.zones)
  //       if (gridArea.zones.length) {
  //         gridTemplate[axis] += `${gridArea.sizeRatio ? gridArea.sizeRatio + "px" : "1fr"} `
  //         hasZones++
  //       }
  //     }
  //     if (hasZones == 1) {
  //       gridTemplate[axis] = "auto"
  //     }
  //   }
  //   console.log("template:", gridTemplate.rows, ", ", gridTemplate.columns)
  //   return gridTemplate
  // }
}
</script>
