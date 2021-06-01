<template>
  <div
    id="welcome"
    class="relative text-left flex-grow overflow-auto scrollbar-light dark:scrollbar-dark"
    style="scroll-behavior: smooth"
  >
    <main class="pr-2">
      <nav
        ref="nav-menu"
        class="scrollbar-light-mini dark:scrollbar-dark-mini sticky top-0"
      >
        <div
          v-for="(nav, index) in navItems"
          :key="index"
          :class="navClass(nav)"
          @click="navClicked(nav, 'main')"
        >
          {{ nav.text }}
        </div>
      </nav>
      <section ref="introduction">
        <h2>Welcome</h2>
        <p>
          Hello and welcome to the CSS garden! The intent of this website was to
          make use of the
          <a href="https://docs.trefle.io/">
            Trefle API
          </a>
          to gather and display plant information and create HTML/CSS
          approximations.
          <br /><br />
          Unfortunately, as of May 3, 2021,
          <a href="https://twitter.com/trefle_api/status/1389232291302490117">
            the Trefle API was unexpectedly discontinued.
          </a>
          I am closely following some efforts to recreate Trefle, and will be
          re-implementing API functionality once the necessary endpoints are
          added.
          <br /><br />
          Originally, Trefle was powering the
          <strong>'Plant Search'</strong> functionality, allowing users to
          search for different plants, inspect their properties, and "grow" an
          HTML/CSS approximation. For now, all data returned from the
          <strong>'Plant Search'</strong> is static, and will always generate
          the same plant. Users can still create custom plants by using the
          <strong>'Select & Create'</strong> window.
        </p>
        <div class="flex justify-center p-2">
          <button
            class="btn-light dark:btn-dark block px-2 mr-2"
            @click="toggleSearchPlants"
          >
            Open Plant Search
          </button>
          <button
            class="btn-light dark:btn-dark block px-2"
            @click="toggleSelectCreate"
          >
            Open Select & Create
          </button>
        </div>
      </section>
      <section ref="features">
        <h2>Features</h2>
        <p>
          This website is built with Typescript, Vue, Tailwindcss, and uses
          Heroku Container Registry for deployment. Best viewed on a laptop or
          large screen, but mobile and touch gestures are supported as well.
        </p>
        <p>
          To the right, you will see a demo plant that has been built. This
          plant will be deleted if the <strong>'Information'</strong> window is
          closed, but will come back if it's opened again. You can drag the
          plant around, double click on different parts of the plant to activate
          them, and then use the <strong>'Edit Plant'</strong> window to modify
          aspects of those parts.
        </p>
        <nav
          ref="features-menu"
          v-if="showFeaturesMenu"
          class="mt-4 scrollbar-light-mini dark:scrollbar-dark-mini sticky top-8"
        >
          <div
            v-for="(nav, index) in featuresNav"
            :key="index"
            @click="navClicked(nav, 'features')"
            :class="navClass(nav)"
          >
            {{ nav.text }}
          </div>
        </nav>
        <section ref="plant-algorithm">
          <h2>Plant Algorithm</h2>
          <p>
            Plants are grown by generating branches and tracking how tall/wide
            the branches cause the plant to be. Once the 'height' or 'spread'
            (width) values of the plant are reached, the plant will stop
            growing.
          </p>
          <p>
            A number of base branches will be generated based on how tall and
            wide the plant is. If the plant has a spread of 20 or less, then it
            will only have 1 base branch. Otherwise, the number of base branches
            is equal to the plant's height divided by 100, up to a maximum of 5.
          </p>
          <p>
            Once a branch is grown, if it is a base branch or the height/spread
            of the plant has not yet been reached, two more branches will be
            grown on top of it. If the height/spread of the plant has been
            reached, then that branch will be forced to either have a leaf
            cluster or a flower on top of it, where there is an 80% chance of it
            being a leaf cluster.
            <br />
            If the height/spread of the plant has not been reached, then there
            is a small chance that <strong>one</strong> of the two new branches
            being grown could still terminate with a leaf cluster or flower. The
            probability of this increases as the order of the branch increases,
            and the remaining height/spread decreases.
          </p>
          <p>
            After a plant has been fully grown, if there were no flowers
            randomly generated, then one of the leaf clusters will be replaced
            with a flower instead.
          </p>
        </section>
        <section ref="plant-features">
          <h2>Plant Features</h2>
          <h4>Mouse Controls</h4>
          <div class="grid-list-big green-strong">
            <strong>Click + Drag:</strong>
            <div>
              Move the plant
            </div>
            <strong>Ctrl key:</strong>
            <div>
              Spins the plant when dragging (rotates on Z axis)
            </div>
            <strong>Shift key:</strong>
            <div>
              Rotates the plant when dragging (rotates on X and Y axes)
            </div>
            <strong>Ctrl + Shift keys:</strong>
            <div>
              Updates the plant's Z translate value when dragging
            </div>
            <strong>Add key (+):</strong>
            <div>
              Zooms in the plant
            </div>
            <strong>Minus key (-):</strong>
            <div>
              Zooms out the plant
            </div>
          </div>
          <h4>Touch Controls</h4>
          <div class="grid-list-big green-strong">
            <strong>Drag:</strong>
            <div>
              Move the plant
            </div>
            <strong>Pinch gesture:</strong>
            <div>
              Zooms the plant in/out. Warning: on some iOS devices, doing this
              repeatedly may cause render issues.
            </div>
          </div>
        </section>
        <div ref="ui-features">
          <h2>UI Features</h2>
          <p>
            The UI is a dynamic grid made up of Containers, Zones, and Widgets.
            Each Zone defines how many rows/columns it takes up, and is assigned
            to a Container. Each Widget has a default Zone that it is opened
            into. In this implementation, there are two Containers, 6 Zones, and
            6 Widgets.
          </p>
          <h4>Implementation</h4>
          <ul class="list-disc pl-6 my-2">
            <li>
              <strong>Container 1</strong> has <strong>Zones 1</strong> and
              <strong>2</strong>. Widgets <strong>'Introduction'</strong> and
              <strong>'Plant Search'</strong> both default to
              <strong>Zone 1</strong>;
              <strong>'Investigate Plant'</strong> defaults to
              <strong>Zone 2</strong>.
            </li>
            <li>
              <strong>Container 2</strong> has <strong>Zones 2</strong>,
              <strong>3</strong>, and <strong>4</strong>, which maps to default
              Widgets <strong>'Plants'</strong>, <strong>'Edit Plant'</strong>,
              and <strong>'Select & Create'</strong>, in that order.
            </li>
            <li>
              The last Zone is <strong>Zone 0</strong> which is a special Zone,
              and does not belong to a container. <strong>Zone 0</strong> is
              where any undocked Widgets get sent to, and can have any number of
              Widgets. All other Zones may only have one Widget in them at a
              time.
            </li>
          </ul>
          <h4>Icon Reference</h4>
          <div class="grid-list">
            <dock-icon class="icon-ref mr-2" />
            <div>
              Widget is currently docked, and clicking this will undock it
            </div>
            <undock-icon class="icon-ref mr-2" />
            <div>
              Widget is currently undocked, and clicking this will dock it
            </div>
            <drag-icon class="icon-ref mr-2" />
            <div>
              Click and drag to move the Widget to a different Zone (only for
              docked widgets)
            </div>
            <move-icon class="icon-ref mr-2" />
            <div>
              Move the Widget around the screen (only for undocked widgets)
            </div>
            <close-icon class="icon-ref mr-2" />
            <div>
              Close the Widget
            </div>
            <resize-icon class="icon-ref mr-2" />
            <div>
              Resize the Widget; will resize the Zone as well if Widget is
              docked
            </div>
            <light-icon class="icon-ref mr-2" />
            <div>
              Activate Dark mode (located in side menu)
            </div>
            <dark-icon class="icon-ref mr-2" />
            <div>
              Activate Light mode (located in side menu)
            </div>
          </div>
          <h4>Behaviour</h4>
          <p>
            Containers and Zones both have a default size that they start out
            as. For Containers, this is a width-percentage, and for Zones, it is
            a reference to how many columns/rows they should take up in the
            Container. When a Zone is mounted, it will check its actual size in
            the DOM, and then update its size properties, however these are not
            used directly. Instead, the overall size of the Zone is turned into
            a ratio with regards to the size of its parent Container. That ratio
            is then equally spread across all columns/rows that the Zone lives
            in, and this updates the styling of the Container itself.
          </p>
          <p>
            If a Zone is resized, it will recalculate its ratio, and
            redistribute that ratio across its columns/rows, while also updating
            the ratio of all <span class="italic">other</span> columns/rows.
            When a "sibling" Zone is added/removed from a container, the other
            Zones in the container will try to take up the free space), or reset
            their dimensions so that there is room for the new Zone. After
            resetting, the Zones wait 2 ticks so that all other Zones are also
            updated, and then record their new size, and set the column/row
            styling on the Container.
          </p>
          <p>
            Widgets can be moved around to different Zones. If a Widget is
            closed and re-opened, it will open into its default Zone. If there
            is already a Widget in that Zone, then that Widget will become
            undocked. Once a Widget is closed and the Zone is empty, the Zone is
            removed from the DOM; Widgets can only be dragged to/swap with Zones
            that are currently open with a Widget inside of them.
          </p>
          <p>
            Widgets may also be undocked and resized. Docking an undocked Widget
            will place it into the closest Zone. Resizing a Widget while it's
            docked will change the size of the overall Zone. The overall width
            of the Container will not change during such a resizing. To change
            the sizes of the Containers, mouse over the gap between two
            Containers: a dotted line will appear and can be dragged to resize.
          </p>
        </div>
      </section>
      <section ref="contact">
        <h2>Contact</h2>
        <p>
          Hi! My name's Emma, and I'm a Software Developer currently residing in
          Toronto. When I'm not working on my computer, you might find me biking
          around the city, paddling at the lake, or hanging out with some feral
          cats.
        </p>
        <div class="grid-list-big green-strong">
          <strong>Email</strong>
          <a href="mailto:ecodapo@gmail.com">ecodapo@gmail.com</a>
          <strong>Github</strong>
          <a href="https://github.com/emdap">emdap</a>
          <strong>Other apps</strong>
          <div>
            <a href="https://contentcube.herokuapp.com/">contentCube</a> •
            <a href="https://good-movie.herokuapp.com/">Good Movies</a>
          </div>
        </div>
        <div class="flex flex-col justify-center p-2 mt-4 text-center">
          <img src="../../public/finn.jpg" />
          <span class="italic p-2">
            <strong>Pictured:</strong> Finn, one of the friendlier feral cats I
            volunteer with
          </span>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import { grid } from "@/mixins/GridMixin.vue"
import { Ref } from "vue-property-decorator"
import Vue from "vue"
import DockIcon from "@/assets/icons/docked.svg"
import UndockIcon from "@/assets/icons/not-docked.svg"
import DragIcon from "@/assets/icons/drag.svg"
import MoveIcon from "@/assets/icons/move.svg"
import CloseIcon from "@/assets/icons/close.svg"
import ResizeIcon from "@/assets/icons/resize.svg"
import DarkIcon from "@/assets/icons/dark-mode.svg"
import LightIcon from "@/assets/icons/light-mode.svg"

type NavItem = {
  id: number
  active: boolean
  text: string
  ref: HTMLElement
}

@Component({
  components: {
    DockIcon,
    UndockIcon,
    DragIcon,
    MoveIcon,
    CloseIcon,
    ResizeIcon,
    DarkIcon,
    LightIcon,
  },
})
export default class Welcome extends Vue {
  @Ref("nav-menu") navMenu!: HTMLElement
  @Ref("features-menu") featuresMenu!: HTMLElement
  @Ref("introduction") introduction!: HTMLElement
  @Ref("features") features!: HTMLElement
  @Ref("ui-features") uiFeatures!: HTMLElement
  @Ref("plant-features") plantFeatures!: HTMLElement
  @Ref("plant-algorithm") plantAlgorithm!: HTMLElement
  @Ref("contact") contact!: HTMLElement

  public navItems = [] as NavItem[]
  public featuresNav = [] as NavItem[]
  public ignoreScroll = false
  public scrollTimer!: number

  // TODO: add listener on scroll to update active on nav items if in view

  public mounted() {
    this.$el.addEventListener("scroll", this.updateActiveNav)
    this.navItems = [
      {
        id: 1,
        active: true,
        text: "Introduction",
        ref: this.introduction,
      },
      {
        id: 2,
        active: false,
        text: "Documentation",
        ref: this.features,
      },
      {
        id: 3,
        active: false,
        text: "Contact",
        ref: this.contact,
      },
    ]

    this.featuresNav = [
      {
        id: 4,
        active: false,
        text: "Algorithm",
        ref: this.plantAlgorithm,
      },
      {
        id: 5,
        active: false,
        text: "Plant Features",
        ref: this.plantFeatures,
      },
      {
        id: 6,
        active: false,
        text: "UI Features",
        ref: this.uiFeatures,
      },
    ]
  }

  public get showFeaturesMenu() {
    return this.navItems.find(n => {
      return n.id == 2
    })?.active
  }

  public updateActiveNav() {
    clearTimeout(this.scrollTimer)
    if (!this.ignoreScroll) {
      const { height } = this.$el.getBoundingClientRect()
      if (Math.abs(this.$el.scrollTop + height - this.$el.scrollHeight) < 5) {
        // set it to the last nav, even if there isn't enough scroll for it to reach the middle
        this.featuresNav = this.featuresNav.map(n => {
          n.active = false
          return n
        })
        this.navItems = this.navItems.map((n, index) => {
          if (index == this.navItems.length - 1) {
            n.active = true
          } else {
            n.active = false
          }
          return n
        })
      } else {
        this.checkNavScroll(this.$el.scrollTop, height, this.navItems)
        this.checkNavScroll(this.$el.scrollTop, height, this.featuresNav)
      }
    }
    this.scrollTimer = setTimeout(() => {
      this.ignoreScroll = false
    }, 250)
  }

  public checkNavScroll(
    scrollStart: number,
    availHeight: number,
    navList: NavItem[]
  ) {
    for (const nav of navList) {
      const height = nav.ref.getBoundingClientRect().height + nav.ref.offsetTop
      if (
        nav.ref.offsetTop - 16 - availHeight * 0.5 <= scrollStart &&
        height - availHeight * 0.5 >= scrollStart
      ) {
        nav.active = true
      } else {
        nav.active = false
      }
    }
  }

  public navClicked(nav: NavItem, listName: "main" | "features") {
    this.ignoreScroll = true
    let navList!: NavItem[]
    let offset = this.navMenu.getBoundingClientRect().height + 8
    if (listName == "main") {
      navList = this.navItems
    } else {
      navList = this.featuresNav
      offset += this.featuresMenu.getBoundingClientRect().height
    }
    navList = navList.map(n => {
      if (n != nav) {
        n.active = false
      }
      return n
    })
    nav.active = true
    this.$el.scrollTop = nav.ref.offsetTop - offset
  }

  public get navClass() {
    return (nav: NavItem) => {
      return [
        "uppercase flex-grow mx-2 text-center cursor-pointer text-xs font-medium whitespace-nowrap",
        nav.active
          ? "text-green-600 dark:text-yellow-500 font-bold"
          : "hover:text-pink-400 dark:hover:text-yellow-300",
      ]
    }
  }

  public toggleSearchPlants() {
    grid.toggleWidgetName({ name: "search" })
  }

  public toggleSelectCreate() {
    grid.toggleWidgetName({ name: "select-create", forceShow: true })
  }
}
</script>

<style lang="scss">
#welcome {
  nav {
    @apply flex transition-colors bg-white dark:bg-gray-700 w-full overflow-x-auto p-2 border-b-1 dark:border-gray-500 h-8 overflow-y-hidden;
  }

  a {
    @apply dark:text-yellow-600 text-green-500 hover:text-pink-400 dark:hover:text-yellow-400 font-medium;
  }

  section {
    @apply pb-4 mb-4 border-b-1 dark:border-gray-500;
  }

  p {
    word-break: break-word;

    @apply p-2;
  }

  h2 {
    @apply text-green-800 dark:text-yellow-600 text-center my-2;
  }

  h4 {
    @apply text-black dark:text-yellow-600 font-bold mt-4;
  }

  .green-strong strong {
    @apply text-green-500 dark:text-yellow-400;
  }

  .icon-ref {
    @apply fill-current text-green-800 dark:text-yellow-400 inline;
  }

  .grid-list {
    grid-template-columns: 3rem 1fr;
  }

  .grid-list-big {
    grid-template-columns: 1fr 3fr;
  }

  .grid-list,
  .grid-list-big {
    @apply grid pl-6 my-2 gap-2 w-full;
  }

  .grid-list > *,
  .grid-list-big > a {
    word-break: break-word;
  }
}
</style>
