import { ref } from 'vue';

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

interface SpeechRecognitionAPIOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
  minimalConfidence?: number;
  initialTranscripts?: string[];
}

const defaultOptions: SpeechRecognitionAPIOptions = {
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  minimalConfidence: 0.7,
  initialTranscripts: [],
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
  const SpeechGrammarList = OPTIONS.SpeechGrammarListOptions[support - 1];
  const SpeechRecognitionEvent =
    OPTIONS.SpeechRecognitionEventOptions[support - 1];

  const speechRecognition = new (<any>window)[SpeechRecognition]();

  speechRecognition.continuous = options.continuous!;
  speechRecognition.interimResults = options.interimResults!;
  speechRecognition.lang = options.lang!;
  speechRecognition.maxAlternatives = options.maxAlternatives!;

  const isListening = ref(false);
  const transcripts = ref<string[]>(options.initialTranscripts!);
  const status = ref(SpeechRecognitionAPIStatus.OK);

  speechRecognition.onstart = (event: any) => {
    isListening.value = true;
    status.value = SpeechRecognitionAPIStatus.OK;
    console.log('onstart', event);
  };

  speechRecognition.onend = (event: any) => {
    isListening.value = false;
    console.log('onend', event);
  };

  speechRecognition.onError = (event: any) => {
    isListening.value = false;
    console.log('onError', event);
  };

  speechRecognition.onspeechend = (event: any) => {
    isListening.value = false;
    console.log('onspeechend', event);
  };

  interface SpeechRecognitionAlternative {
    confidence: number;
    transcript: string;
  }

  speechRecognition.onresult = (event: any) => {
    console.log('onresult', event);

    const result: SpeechRecognitionAlternative[] = event.results[0];

    const { confidence, transcript } = result[0];

    if (confidence >= options.minimalConfidence!) {
      transcripts.value.push(transcript);
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
