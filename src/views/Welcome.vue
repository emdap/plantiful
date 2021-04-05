<template>
  <div id="welcome" class="text-left font-medium">
    <widget :widgetData="welcomeWidget">
      <span class="p-4 w-full">
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
          To the right, you will see a demo plant that has been built. To build
          some more plants, open up the search window, search for some plants,
          and then choose which ones you want to create.
        </p>
        <p class="mb-2">
          You can customize a plant after generating it. Try double clicking on
          the plant to the right, dragging with your mouse to reposition. Try
          holding the Ctrl key, or the Shift key (or both) to manipulate the
          positioning of the plant in different ways // add actual instructions.
        </p>
        <p class="mb-2">
          After double clicking a plant, the control window will pop up,
          allowing you to fine-tune additional properties. Try double clicking
          on parts of a plant to activate those specific areas.
        </p>
        <p class="mb-4">
          Note that closing this Welcome window will delete the default plant!
          Don't worry, it will come back again if you re-open the Welcome
          window.
        </p>
        <button class="btn-primary my-4 w-full" @click="$emit('search-plants')">
          Start Searching
        </button>
      </span>
    </widget>
  </div>
</template>

<script lang="ts">
import ContainerMixin from "@/mixins/ContainerMixin.vue"
import Component, { mixins } from "vue-class-component"
import Widget from "@/components/Widget.vue"
import Plant from "@/components/Grow/Plant.vue"
import { Watch } from "vue-property-decorator"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { TEST_PLANT } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Widget,
    Plant
  }
})
export default class Welcome extends mixins(ContainerMixin, GrowMixin) {
  public testPlantId = 0

  public get welcomeWidget() {
    return this.getWidget("welcome")
  }

  public mounted() {
    this.growTestPlant()
  }

  public growTestPlant() {
    this.testPlantId = this.growPlant(TEST_PLANT)
    console.log(this.testPlantId)
  }

  @Watch("welcomeWidget.open")
  public welcomeClosed(nowOpen: boolean) {
    if (nowOpen) {
      this.growTestPlant()
    } else {
      grow.deleteEntity({ dataKey: "plants", id: this.testPlantId })
    }
  }
}
</script>

<style scoped></style>
