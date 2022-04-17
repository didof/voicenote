import { computed, ref } from 'vue';

export enum SpeechRecognitionAPISupport {
  Unsupported,
  Default,
  Webkit,
}

export enum SpeechRecognitionAPIStatus {
  OK,
  Repeat,
  Error,
}

interface SpeechRecognitionAlternative {
  confidence: number;
  transcript: string;
}

interface SpeechRecognitionAPIOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  minimalConfidence?: number;
  initialTranscripts?: string[];
  onResult?: (transcript: string, confirm: () => void) => void;
}

const defaultOptions: SpeechRecognitionAPIOptions = {
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  minimalConfidence: 0.7,
  initialTranscripts: [],
  onResult: () => true,
};

const OPTIONS = {
  SpeechRecognitionOptions: ['SpeechRecognition', 'webkitSpeechRecognition'],
  SpeechGrammarListOptions: ['SpeechGrammarList', 'webkitSpeechGrammarList'],
  SpeechRecognitionEventOptions: [
    'SpeechRecognitionEvent',
    'webkitSpeechRecognitionEvent',
  ],
};

export function getSpeechRecognitionAPISupport() {
  let support = SpeechRecognitionAPISupport.Unsupported;
  if ('SpeechRecognition' in window) {
    support = SpeechRecognitionAPISupport.Default;
  } else if ('webkitSpeechRecognition' in window) {
    support = SpeechRecognitionAPISupport.Webkit;
  }
  return support;
}

export default function useSpeechRecognitionAPI(options = defaultOptions) {
  options = Object.assign(defaultOptions, options);

  const support = getSpeechRecognitionAPISupport();

  const SpeechRecognition = OPTIONS.SpeechRecognitionOptions[support - 1];
  // const SpeechGrammarList = OPTIONS.SpeechGrammarListOptions[support - 1];
  // const SpeechRecognitionEvent =
  //   OPTIONS.SpeechRecognitionEventOptions[support - 1];

  const speechRecognition = new (<any>window)[SpeechRecognition]();

  speechRecognition.continuous = options.continuous;
  speechRecognition.interimResults = options.interimResults;
  speechRecognition.lang = options.lang;
  speechRecognition.maxAlternatives = 1;

  const isListening = ref(false);
  const transcripts = ref<string[]>(options.initialTranscripts!);
  const status = ref(SpeechRecognitionAPIStatus.OK);

  speechRecognition.onstart = (event: any) => {
    isListening.value = true;
    status.value = SpeechRecognitionAPIStatus.OK;
  };

  speechRecognition.onend = (event: any) => {
    isListening.value = false;
  };

  speechRecognition.onError = (event: any) => {
    isListening.value = false;
  };

  speechRecognition.onspeechend = (event: any) => {
    isListening.value = false;
  };

  speechRecognition.onresult = (event: any) => {
    const result: SpeechRecognitionAlternative[] = event.results[0];

    const { confidence, transcript } = result[0];

    if (confidence >= options.minimalConfidence!) {
      function confirm() {
        transcripts.value.push(transcript);
      }
      options.onResult!(transcript, confirm);
    } else {
      status.value = SpeechRecognitionAPIStatus.Repeat;
    }
  };

  return {
    support,
    isListening,
    status,
    transcripts,
    start: () => {
      speechRecognition.stop();
      try {
        speechRecognition.start();
      } catch (err) {
        alert(err);
        speechRecognition.stop();
        isListening.value = false;
        status.value = SpeechRecognitionAPIStatus.Error;
      }
    },
    stop: () => speechRecognition.stop(),
    remove(index: number) {
      if (index >= 0) {
        transcripts.value.splice(index, 1);
      } else {
        console.error('provided negative index');
      }
    },
    clear() {
      transcripts.value = [];
    },
  };
}
