<template>
  <div
    :id="petalsOrLeaves + '-' + growData.id"
    class="absolute rounded-full"
    :class="[transformOrigin, backgroundClass(defaultBg, highlight)]"
    :style="styleObj(growData)"
    @dblclick="activateSelf"
  >
    <shape
      v-for="(shape, index) in growData.shapes"
      :class="{ 'rounded-lg': petalsOrLeaves == 'petals' }"
      :key="petalsOrLeaves + '-' + growData.id + '-shape-' + (index + 1)"
      :growData="shape"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowFlower, GrowLeaf, GrowPetal } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Shape from "@/components/Grow/Shape.vue"
import Component from "vue-class-component"

@Component({
  components: {
    Shape
  }
})
export default class PetalLeaf extends GrowMixin {
  @Prop({ required: true }) petalsOrLeaves!: "petals" | "leaves"
  @Prop({ required: true }) growData!: GrowPetal | GrowLeaf
  // two props for leaf as want to toggle highlight when cluster (parent) is active, or whole plant (grandparent) active
  @Prop({ default: false }) allowSelection!: boolean
  @Prop({ default: false }) clusterActive!: boolean

  public defaultBg = "transparent"
  public highlight = false

  public activateSelf(e: MouseEvent) {
    if (this.clusterActive) {
      e.stopPropagation()
      this.activateEntity(true, this.petalsOrLeaves, this.growData.id)
    }
    // if !clusterActive, e propogates to parent (leafCluster), which then activates itself from the dbl click
  }

  @Watch("growData.height")
  public newHeight(height: number) {
    console.log("new height", height)
    this.$emit("height-update", height)
  }

  public get selfActive() {
    return (
      grow.activeEntityType == this.petalsOrLeaves &&
      this.activeEntity?.id == this.growData.id
    )
  }

  public get transformOrigin() {
    if (this.petalsOrLeaves == "petals") {
      return "origin-bottom-right"
    }
    return "origin-bottom"
  }

  @Watch("allowSelection")
  public plantHighlight(active: boolean) {
    if (active) {
      this.toggleHighlight()
    }
  }

  @Watch("clusterActive")
  public parentHighlight(active: boolean) {
    if (active) {
      this.toggleHighlight()
    }
  }

  @Watch("selfActive")
  public leafHighlight(active: boolean) {
    if (active) {
      this.toggleHighlight()
    }
  }

  public toggleHighlight() {
    this.highlight = true
    setTimeout(() => {
      this.highlight = false
    }, this.highlightDuration)
  }
}
</script>
