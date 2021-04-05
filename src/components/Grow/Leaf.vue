<template>
  <div
    :id="'leaf-' + leafData.id"
    class="absolute rounded-full origin-bottom"
    :class="backgroundClass(defaultBg, highlight)"
    :style="styleObj(leafData)"
    @dblclick="activateLeaf"
  >
    <shape
      v-for="(shape, index) in leafData.shapes"
      :key="'leaf-' + leafData.id + '-shape-' + (index + 1)"
      :growData="shape"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowLeaf, GrowType } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Shape from "@/components/Grow/Shape.vue"
import Component from "vue-class-component"

@Component({
  components: {
    Shape
  }
})
export default class Leaf extends GrowMixin {
  @Prop({ required: true }) leafData!: GrowLeaf
  // two props for leaf as want to toggle highlight when cluster (parent) is active, or whole plant (grandparent) active
  @Prop({ default: false }) plantActive!: boolean
  @Prop({ default: false }) clusterActive!: boolean

  public defaultBg = "transparent"
  public highlight = false

  public activateLeaf(e: MouseEvent) {
    // TODO: might change this -- enforcing activating cluster FIRST, before leaf inside
    if (this.clusterActive) {
      e.stopPropagation()
      this.activateEntity(true, "leaves", this.leafData.id)
    }
    // if !clusterActive, e propogates to parent (leafCluster), which then activates itself from the dbl click
  }

  public get leafActive() {
    return (
      grow.activeEntityType == "leaves" &&
      this.activeEntity?.id == this.leafData.id
    )
  }

  @Watch("plantActive")
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

  @Watch("leafActive")
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
