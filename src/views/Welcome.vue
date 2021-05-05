<template>
  <section
    id="welcome"
    class="text-left font-medium flex-grow overflow-auto scrollbar-light dark:scrollbar-dark"
  >
    <div class="p-1">
      <h1 class="text-green-800 dark:text-green-600 text-center">Welcome</h1>
      <p class="mb-4">
        Hello and welcome to the CSS garden. This website makes use of the
        <a
          href="https://trefle.io"
          class="dark:text-yellow-600 text-green-500 hover:text-pink-400 dark:hover:text-yellow-400"
          >Trefle API</a
        >
        to gather plant information. Some of that information is then used to
        build plant approximations using pure HTML/CSS and javascript.
      </p>
      <p class="mb-4">
        <strong> MORE INFO COMING SOON </strong>
      </p>
      <h2 class="text-green-800 dark:text-green-600">How to use</h2>
      <p class="mb-2">
        To the right, you will see a demo plant that has been built. To build
        some more plants, open up the search window, search for some plants, and
        then choose which ones you want to create.
      </p>
      <p class="mb-2">
        You can customize a plant after generating it. Try double clicking on
        the plant to the right, dragging with your mouse to reposition. Try
        holding the Ctrl key, or the Shift key (or both) to manipulate the
        positioning of the plant in different ways // add actual instructions.
      </p>
      <p class="mb-2">
        After double clicking a plant, the control window will pop up, allowing
        you to fine-tune additional properties. Try double clicking on parts of
        a plant to activate those specific areas.
      </p>
      <p class="mb-4">
        Note that closing this Welcome window will delete the default plant!
        Don't worry, it will come back again if you re-open the Welcome window.
      </p>
      <button
        class="btn-light dark:btn-dark my-4 w-full"
        @click="toggleSearchPlants"
      >
        Start Searching
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin from "@/mixins/GrowMixin.vue"

@Component({})
export default class Welcome extends GrowMixin {}
</script>
