<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Recorder
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab :to="{ name: 'new' }" label="New" />
        <q-route-tab :to="{ name: 'archive' }" label="Archive" />
      </q-tabs>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="install_mobile" />
            </q-item-section>
            <q-item-section> Install </q-item-section>
          </q-item>
          <!-- <q-separator :key="'sep' + index" /> -->
        </q-list>
      </q-scroll-area>
      <q-btn push @click="install" label="install"></q-btn>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { ref } from 'vue';

(<any>window).defferedPrompt = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  (<any>window).defferedPrompt = event;
});

export default {
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      async install() {
        (<any>window).defferedPrompt.prompt();

        const choice = await (<any>window).defferedPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('installed');
        }

        delete (<any>window).defferedPrompt;
      },
    };
  },
};
</script>
