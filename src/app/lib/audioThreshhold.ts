const THRESHOLD = 25
export const analyzeAudio = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    microphone.connect(analyzer);
    analyzer.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    scriptProcessor.onaudioprocess = () => {
        analyzer.getByteTimeDomainData(dataArray);
        const volume = calculateVolume(dataArray);
        if (volume > THRESHOLD) {
            // Audio is above the threshold, process it
            console.log("Audio detected:", volume);
        } else {
            // Audio is below the threshold, ignore it
            console.log("Background noise ignored:", volume);
        }
    };

    return { audioContext, analyzer, scriptProcessor };
};

const calculateVolume = (dataArray: Uint8Array) => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += Math.abs(dataArray[i] - 128); // Normalize to [-128, 128]
    }
    const average = sum / dataArray.length;
    return average;
};

