const startRecordButton = document.getElementById('start-record');
const stopRecordButton = document.getElementById('stop-record');
const aura = document.getElementById('aura');
const chat = document.getElementById('chat');
let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let audioSource;

startRecordButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;

    mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        const listItem = document.createElement('li');
        listItem.classList.add('chat-bubble');
        listItem.innerHTML = `
            <p>New message</p>
            <button>Play</button>
        `;
        const playButton = listItem.querySelector('button');
        playButton.addEventListener('click', () => {
            audio.play();
            visualizeAudio(audio);
        });
        chat.appendChild(listItem);

        audioChunks = [];
    });
});

// Остановка записи
stopRecordButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecordButton.disabled = false;
    stopRecordButton.disabled = true;
});

function visualizeAudio(audio) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    function animateAura() {
        analyser.getByteFrequencyData(dataArray);
        let averageFrequency = dataArray.reduce((a, b) => a + b) / bufferLength;
        let scale = 1 + averageFrequency / 256;  // Изменение масштаба в зависимости от частоты
        aura.style.transform = `scale(${scale})`;

        requestAnimationFrame(animateAura);
    }

    animateAura();
}
