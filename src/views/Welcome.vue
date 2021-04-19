<template>
  <!-- <adjustable :widgetData="widget"> -->
  <section id="welcome" class="text-left font-medium flex-grow overflow-auto">
    <h1 class="text-green-800 text-center">Welcome</h1>
    <p class="mb-4">
      Hello and welcome to the CSS garden. This website makes use of the
      <a href="https://trefle.io" class="text-green-500 hover:text-pink-400"
        >Trefle API</a
      >
      to gather plant information. Some of that information is then used to
      build plant approximations using pure HTML/CSS and javascript.
    </p>
    <p class="mb-4">
      <strong> MORE INFO COMING SOON </strong>
    </p>
    <h2 class="text-green-800">How to use</h2>
    <p class="mb-2">
      To the right, you will see a demo plant that has been built. To build some
      more plants, open up the search window, search for some plants, and then
      choose which ones you want to create.
    </p>
    <p class="mb-2">
      You can customize a plant after generating it. Try double clicking on the
      plant to the right, dragging with your mouse to reposition. Try holding
      the Ctrl key, or the Shift key (or both) to manipulate the positioning of
      the plant in different ways // add actual instructions.
    </p>
    <p class="mb-2">
      After double clicking a plant, the control window will pop up, allowing
      you to fine-tune additional properties. Try double clicking on parts of a
      plant to activate those specific areas.
    </p>
    <p class="mb-4">
      Note that closing this Welcome window will delete the default plant! Don't
      worry, it will come back again if you re-open the Welcome window.
    </p>
    <button class="btn-primary my-4 w-full" @click="$emit('search-plants')">
      Start Searching
    </button>
  </section>
  <!-- </adjustable> -->
</template>

<script lang="ts">
// import GridMixin from "@/mixins/GridMixin.vue"
import Component from "vue-class-component"
import Plant from "@/components/Grow/Plant.vue"
import { Watch } from "vue-property-decorator"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { TEST_PLANT } from "@/fixtures/Grow/Defaults"
import { GrowPlant } from "@/store/interfaces"

@Component({
  components: {
    Plant
  }
})
// export default class Welcome extends mixins(GridMixin, GrowMixin) {
export default class Welcome extends GrowMixin {
  // @Prop({required: true}) widget!: WidgetCopy
  public testPlant = {} as GrowPlant

  // public get welcomeWidget() {
  //   return this.getWidget("welcome")
  // }

  public mounted() {
    this.growTestPlant()
  }

  public async growTestPlant() {
    this.testPlant = await this.growPlant(TEST_PLANT)
    // want to toggle the animation
    // grow.removeActivePlant()
    // const clusterWait = this.testPlant.leafClusters.length / 2
    // leaves in leafCluster all have same order as the cluster
    // leaf animation takes (order * 300 + 550) to complete
    // leafClusters at same level of plant on opposite (left/right) branches = same order
    // plant is mostly symmetrical -> max order ~= # of leafClusters / 2
    // setTimeout(() => {
    //   grow.setActivePlant(this.testPlant.id)
    // }, clusterWait * 300 + 550)
  }

  @Watch("welcomeWidget.open")
  public welcomeClosed(nowOpen: boolean) {
    if (nowOpen) {
      this.growTestPlant()
    } else {
      grow.removeActivePlant()
      grow.deleteEntity({ dataKey: "plants", id: this.testPlant.id })
    }
  }
}
</script>
