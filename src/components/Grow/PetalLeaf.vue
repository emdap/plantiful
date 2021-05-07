<template>
  <div
    :id="petalsOrLeaves + '-' + growData.id"
    class="absolute rounded-full"
    :class="[transformOrigin, backgroundClass]"
    :style="entityStyle(growData)"
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
import { GrowLeaf, GrowPetal } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Shape from "@/components/Grow/Shape.vue"
import Component from "vue-class-component"

@Component({
  components: {
    Shape,
  },
})
export default class PetalLeaf extends GrowMixin {
  @Prop({ required: true }) petalsOrLeaves!: "petals" | "leaves"
  @Prop({ required: true }) growData!: GrowPetal | GrowLeaf
  // two props for leaf as want to toggle highlight when cluster (parent) is active, or whole plant (grandparent) active
  @Prop({ default: false }) clusterActive!: boolean
  @Prop({ default: false }) clusterHighlight!: boolean

  public entityType = this.petalsOrLeaves
  public entityId = this.growData.id

  public activateSelf(e: MouseEvent) {
    if (this.clusterActive) {
      e.stopPropagation()
      this.activateEntity(true, this.petalsOrLeaves, this.growData.id)
    }
  }

  @Watch("growData.height")
  public newHeight(height: number) {
    this.$emit("height-update", height)
  }

  public get transformOrigin() {
    if (this.petalsOrLeaves == "petals") {
      return "origin-bottom-right"
    }
    return "origin-bottom"
  }

  @Watch("clusterActive")
  public parentPulse(active: boolean) {
    if (active) {
      this.pulse()
    }
  }

  @Watch("clusterHighlight")
  public parentHighlight(highlight: boolean) {
    this.highlight = highlight
  }
}
</script>
