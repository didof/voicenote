<template>
  <q-page class="column items-center justify-evenly">
    <h1 class="text-h3">{{ today }}</h1>

    <pre>{{ words }}</pre>

    <div>
      <q-list>
        <template v-for="word in words" :key="word.id">
          <q-item>
            <q-item-section>
              <q-item-label>{{ word.value }}</q-item-label>
              <q-item-label
                caption
                lines="2"
                v-for="native in word.natives"
                :key="native"
              >
                {{ native }}
              </q-item-label>
            </q-item-section>

            <!-- <q-item-section side top>
            <q-item-label caption>5 min ago</q-item-label>
            <q-icon name="star" color="yellow" />
          </q-item-section> -->
          </q-item>

          <q-separator spaced inset />
        </template>

        <q-stepper
          v-model="step"
          vertical
          color="primary"
          animated
          style="width: 400px"
        >
          <q-step :name="1" title="New word" icon="settings" :done="step > 1">
            Add below the newly found word.
            <q-input v-model.trim="word.value" label="new word" />

            <q-stepper-navigation>
              <q-btn
                push
                color="primary"
                :label="word.value.length === 0 ? 'Type' : 'Add'"
                :disabled="word.value.length === 0"
                @click="step = 2"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="2"
            title="Natives"
            caption="At least one"
            icon="create_new_folder"
            :done="step > 2"
          >
            Add one or more translations for <b>{{ word.value }}</b>

            <q-list bordered separator>
              <q-slide-item
                v-for="(native, index) in word.natives.slice(0, -1)"
                :key="native"
                @left="word.natives.splice(index, 1)"
              >
                <template v-slot:left>
                  <q-icon name="done" />
                </template>
                <template v-slot:right>
                  <q-icon name="alarm" />
                </template>

                <q-item>
                  <q-item-section>{{ native }}</q-item-section>
                </q-item>
              </q-slide-item>
            </q-list>

            <q-form
              @submit="pushNative"
              class="row justify-between items-center q-gutter-sm"
            >
              <q-input
                v-model.trim="word.natives[word.natives.length - 1]"
                :label="`native #${word.natives.length}`"
                class="col-grow"
              />
              <q-btn
                push
                type="submit"
                label="Add"
                :disabled="word.natives[word.natives.length - 1].length === 0"
              ></q-btn>
            </q-form>

            <q-stepper-navigation>
              <q-btn
                @click="pushWord"
                color="primary"
                label="Done"
                :disabled="word.natives[0].length === 0"
              />
              <q-btn
                flat
                @click="step = 1"
                color="primary"
                label="Back"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

interface Word {
  value: string;
  natives: string[];
}

export default defineComponent({
  name: 'NewPage',

  setup() {
    const word = reactive<Word>({
      value: '',
      natives: [''],
    });

    const words = ref<Word[]>([
      {
        value: 'attitude',
        natives: ['atteggiamento'],
      },
    ]);

    return {
      today: new Date().toUTCString(),

      word,

      words,

      step: ref(1),

      pushNative() {
        word.natives.push(word.natives[word.natives.length - 1]);
        word.natives[word.natives.length - 1] = '';
      },

      pushWord() {
        words.value.push(Object.create(null).assign(word));
        word.value = '';
        word.natives = [''];
      },
    };
  },
});
</script>
