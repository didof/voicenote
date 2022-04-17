import { ref } from 'vue';

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

type VoiceMap = Map<string, SpeechSynthesisVoice>;

export default function useSpeechSynthetisAPI() {
  const synth = window.speechSynthesis;

  const voiceMap: VoiceMap = new Map();

  setTimeout(() => {
    const voices: SpeechSynthesisVoice[] = synth.getVoices();

    voices.forEach((voice) => {
      voiceMap.set(voice.lang, voice);
    });
  }, 0);

  return {
    speak(input: string, lang: string) {
      const utter = new SpeechSynthesisUtterance(input);

      const voice = voiceMap.get(lang);
      if (!voice) {
        return;
      }

      utter.lang = voice.lang;
      utter.voice = voice;

      synth.speak(utter);
    },
  };
}
