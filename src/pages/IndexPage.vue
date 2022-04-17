<template>
  <q-page class="column items-center justify-start" style="padding-top: 1rem">
    <q-list bordered separator style="width: 80%" v-show="transcripts.length">
      <transition-group
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <q-slide-item
          v-for="(word, index) in words"
          :key="word.value + index"
          left-color="red"
          right-color="blue"
          @left="remove(index)"
          @right="edit"
          v-ripple
        >
          <template v-slot:left>
            <q-icon name="delete_outline" />
          </template>
          <template v-slot:right>
            <q-icon name="edit" />
          </template>

          <q-item>
            <q-item-section>
              <q-item-label>{{ word.value }}</q-item-label>
              <q-item-label caption lines="2" v-if="word.translations.length">
                <p v-for="translation in word.translations" :key="translation">
                  {{ translation }}
                </p>
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-icon
                name="volume_up"
                @click="speak(word.value, word.language)"
              />
              <q-item-label caption>
                {{ word.created_at.toISOString() }}
              </q-item-label>
            </q-item-section>
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
import useSpeechSynthetisAPI from 'src/helpers/useSpeechSynthetisAPI';
import useStorageList, { StorageType } from 'src/helpers/useStorageList';
import { useRouter } from 'vue-router';
import { QSpinnerAudio, useQuasar } from 'quasar';

type voidFn = () => void;
type Details = { reset: voidFn };

interface Word {
  value: string;
  translations: string[];
  language: string;
  translationsLanguage: string;
  created_at: Date;
}

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
    } = useSpeechRecognitionAPI({
      onResult(transcript, confirm) {
        $q.dialog({
          title: 'New Word',
          prompt: {
            model: transcript,
            type: 'string',
          },
        }).onOk(() => {
          confirm();
          words.value.push({
            value: transcript,
            translations: [],
            language: 'en-US',
            translationsLanguage: 'it',
            created_at: new Date(),
          });
        });
      },
    });

    const { speak } = useSpeechSynthetisAPI();

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

    const words = ref<Word[]>([]);

    return {
      isListening,
      transcripts,
      words,
      action() {
        isListening.value ? stop() : start();
      },
      edit({ reset }: Details) {
        reset();
      },
      remove,
      save,
      speak,
    };

    function save() {
      storageTranscripts.push(...transcripts.value);
      clear();
    }
  },
});
</script>
