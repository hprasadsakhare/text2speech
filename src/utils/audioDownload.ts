export async function downloadAudio(
  text: string,
  lang: string,
  rate: number,
  pitch: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Get the best available voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.lang === lang && voice.localService
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Create an audio context to capture the speech
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const audioChunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'speech.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    mediaRecorder.start();

    utterance.onend = () => {
      mediaRecorder.stop();
      audioContext.close();
    };

    utterance.onerror = () => {
      mediaRecorder.stop();
      audioContext.close();
      reject(new Error('Speech synthesis failed'));
    };

    window.speechSynthesis.speak(utterance);
  });
}