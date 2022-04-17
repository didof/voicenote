<template>
  <q-page class="column items-center justify-start" style="padding-top: 1rem">
    <q-list bordered separator style="width: 80%">
      <q-item
        clickable
        v-ripple
        v-for="(transcript, index) in transcripts"
        :key="transcript + index"
      >
        <q-item-section>
          <q-item-label>{{ transcript }}</q-item-label>
          <!-- <q-item-label caption>Caption</q-item-label> -->
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import useStorageList, { StorageType } from 'src/helpers/useStorageList';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ArchivePage',

  setup() {
    const storageTranscripts = useStorageList(StorageType.Local, 'transcripts');

    return {
      transcripts: storageTranscripts.get(),
    };
  },
});
</script>
