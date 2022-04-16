<template>
  <q-page class="column items-center justify-start" style="padding-top: 1rem">
    <q-list bordered separator style="width: 80%" v-show="transcripts.length">
      <transition-group
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <q-slide-item
          v-for="(transcript, index) in transcripts"
          :key="transcript + index"
          left-color="red"
          right-color="blue"
          @left="remove(index)"
          @right="edit"
        >
          <template v-slot:left>
            <q-icon name="delete_outline" />
          </template>
          <template v-slot:right>
            <q-icon name="edit" />
          </template>

          <q-item>
            <q-item-section>{{ transcript }}</q-item-section>
          </q-item>
        </q-slide-item>
      </transition-group>
    </q-list>

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn
        fab
        push
        color="secondary"
        icon="cloud_upload"
        :disabled="transcripts.length === 0"
        @click="save"
      />
    </q-page-sticky>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        push
        :icon="isListening ? 'mic' : 'record_voice_over'"
        color="accent"
        @click="action"
      />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import useSpeechRecognitionAPI, {
  SpeechRecognitionAPIStatus,
} from 'src/helpers/useSpeechRecognitionAPI';
import useStorageList, { StorageType } from 'src/helpers/useStorageList';
import { useRouter } from 'vue-router';
import { QSpinnerAudio, useQuasar } from 'quasar';

type voidFn = () => void;

type Details = { reset: voidFn };

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const $q = useQuasar();
    const storageTranscripts = useStorageList<string>(
      StorageType.Local,
      'transcripts'
    );

    const {
      support,
      isListening,
      status,
      transcripts,
      start,
      stop,
      remove,
      clear,
    } = useSpeechRecognitionAPI();

    if (!support) {
      const router = useRouter();
      router.replace({ name: 'error-not-found' });
      return;
    }

    $q.loading.setDefaults({
      spinner: QSpinnerAudio,
      message: 'Listening',
    });
    watch(isListening, (value) => {
      if (value) {
        $q.loading.show();
      } else {
        $q.loading.hide();
      }
    });

    watch(status, (value) => {
      if (value === SpeechRecognitionAPIStatus.Repeat) {
        $q.notify('Could you please repeat?');
      }
    });

    let timer;
    function finalize(reset: voidFn) {
      timer = setTimeout(() => {
        reset();
      }, 1000);
    }

    return {
      isListening,
      transcripts,
      action() {
        isListening.value ? stop() : start();
      },
      edit({ reset }: Details) {
        finalize(reset);
      },
      remove,
      save,
    };

    function save() {
      storageTranscripts.push(...transcripts.value);
      clear();
    }
  },
});
</script>
