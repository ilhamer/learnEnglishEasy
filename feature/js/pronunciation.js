// Data dan State Aplikasi
let pronunciationData = [];
let filteredData = [];
let currentWord = null;
let currentWordData = null;
let userRecording = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioContext = null;
let analyser = null;
let dataArray = null;
let animationId = null;
let audioEnabled = false;

// DOM Elements
const pronunciationGrid = document.getElementById('pronunciationGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const currentWordDisplay = document.getElementById('currentWord');
const playNativeBtn = document.getElementById('playNative');
const recordBtn = document.getElementById('recordBtn');
const playUserBtn = document.getElementById('playUser');
const nextWordBtn = document.getElementById('nextWordBtn');
const visualizer = document.getElementById('visualizer');
const feedback = document.getElementById('feedback');

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup event listeners terlebih dahulu
        setupEventListeners();
        
        // Load data
        await loadPronunciationData();
        
        // Inisialisasi visualizer canvas
        if (visualizer) {
            initVisualizer();
        }
        
        // Aktifkan audio setelah interaksi pertama
        document.addEventListener('click', enableAudio, { once: true });
    } catch (error) {
        console.error('Error initializing app:', error);
        showFeedback('Gagal memuat data pelafalan', 'error');
    }
});

// Fungsi untuk mengaktifkan audio
function enableAudio() {
    if (audioEnabled) return;
    
    try {
        // Buat AudioContext hanya setelah interaksi pengguna
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        audioEnabled = true;
        showFeedback('Fitur audio telah diaktifkan', 'success');
    } catch (error) {
        console.error('Error enabling audio:', error);
        showFeedback('Browser tidak mendukung fitur audio', 'error');
    }
}

// Fungsi untuk memuat data dari JSON
async function loadPronunciationData() {
    try {
        // Coba load dari file JSON
        const response = await fetch('data/pronunciation.json');
        
        if (response.ok) {
            pronunciationData = await response.json();
        } else {
            // Fallback data jika file tidak tersedia
            pronunciationData = [
                {
                    "word": "Hello",
                    "phonetic": "/he'leo/",
                    "meaning": "Ucapan salam",
                    "audio_file": "hello.mp3",
                    "category": "greetings"
                },
                {
                    "word": "Goodbye",
                    "phonetic": "/god'bar/",
                    "meaning": "Ucapan selamat tinggal",
                    "audio_file": "goodbye.mp3",
                    "category": "greetings"
                },
                {
                    "word": "Thank you",
                    "phonetic": "/θæŋk juː/",
                    "meaning": "Ucapan terima kasih",
                    "audio_file": "thank_you.mp3",
                    "category": "phrases"
                },
                {
                    "word": "How are you?",
                    "phonetic": "/haʊ ɑːr juː/",
                    "meaning": "Menanyakan kabar",
                    "audio_file": "how_are_you.mp3",
                    "category": "phrases"
                }
            ];
        }
        
        filteredData = [...pronunciationData];
        renderPronunciationCards();
        
        // Pilih kata acak pertama
        selectRandomWord();
    } catch (error) {
        console.error('Error loading pronunciation data:', error);
        showFeedback('Gagal memuat data pelafalan', 'error');
        throw error;
    }
}

// Render kartu pelafalan
function renderPronunciationCards() {
    if (!pronunciationGrid) return;
    
    pronunciationGrid.innerHTML = '';
    
    if (filteredData.length === 0) {
        pronunciationGrid.innerHTML = '<p class="no-results">Tidak ada data pelafalan yang ditemukan</p>';
        return;
    }
    
    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'pronunciation-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${item.word}</h3>
                <span class="phonetic">${item.phonetic}</span>
            </div>
            <div class="card-body">
                <p>${item.meaning}</p>
                <button class="audio-btn" data-audio="${item.audio_file}">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        pronunciationGrid.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterPronunciation(button.dataset.category);
        });
    });
    
    // Play native audio button
    playNativeBtn?.addEventListener('click', playNativeAudio);
    
    // Record button
    recordBtn?.addEventListener('click', toggleRecording);
    
    // Play user recording button
    playUserBtn?.addEventListener('click', playUserRecording);
    
    // Next word button
    nextWordBtn?.addEventListener('click', selectRandomWord);
    
    // Event delegation for audio buttons
    pronunciationGrid?.addEventListener('click', (e) => {
        if (e.target.closest('.audio-btn')) {
            const audioBtn = e.target.closest('.audio-btn');
            playAudio(audioBtn.dataset.audio);
        }
    });
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle')?.addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('active');
    });
}

// Filter pronunciation by category
function filterPronunciation(category) {
    if (category === 'all') {
        filteredData = [...pronunciationData];
    } else {
        filteredData = pronunciationData.filter(item => item.category === category);
    }
    
    renderPronunciationCards();
    selectRandomWord();
}

// Inisialisasi Visualizer
function initVisualizer() {
    visualizer.width = visualizer.offsetWidth;
    visualizer.height = visualizer.offsetHeight;
}

// Memutar audio
function playAudio(audioFile) {
    if (!audioEnabled) {
        showFeedback('Silakan klik di halaman terlebih dahulu untuk mengaktifkan audio', 'info');
        return;
    }
    
    const audioPath = `audio/pronunciation/${audioFile}`;
    const audio = new Audio(audioPath);
    
    audio.addEventListener('error', (e) => {
        console.error('Error playing audio:', e);
        showFeedback('Gagal memutar audio', 'error');
    });
    
    audio.play().catch(e => {
        console.error('Audio play failed:', e);
        showFeedback('Silakan klik di halaman terlebih dahulu untuk mengaktifkan audio', 'info');
    });
}

// Memutar audio native speaker
function playNativeAudio() {
    if (!currentWordData) return;
    playAudio(currentWordData.audio_file);
}

// Toggle recording
async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

// Mulai merekam
async function startRecording() {
    try {
        if (!audioEnabled) {
            showFeedback('Silakan klik di halaman terlebih dahulu untuk mengaktifkan audio', 'info');
            return;
        }
        
        if (!audioContext) {
            enableAudio();
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        // Setup audio visualizer
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        drawVisualizer();
        
        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            userRecording = new Blob(audioChunks, { type: 'audio/webm' });
            playUserBtn.disabled = false;
            showFeedback('Rekaman selesai. Klik "Putar Rekaman" untuk mendengarkan', 'success');
            
            // Bersihkan resources
            if (source) source.disconnect();
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordBtn.classList.add('recording');
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Berhenti';
        playUserBtn.disabled = true;
        showFeedback('Merekam... ucapkan: ' + currentWord, 'info');
        
    } catch (error) {
        console.error('Error starting recording:', error);
        showFeedback('Akses mikrofon ditolak atau tidak tersedia', 'error');
    }
}

// Berhenti merekam
function stopRecording() {
    if (!mediaRecorder || !isRecording) return;
    
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.classList.remove('recording');
    recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Rekam';
    
    // Hentikan visualizer
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Memutar rekaman pengguna
function playUserRecording() {
    if (!userRecording) return;
    
    const audioUrl = URL.createObjectURL(userRecording);
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('error', (e) => {
        console.error('Error playing recording:', e);
        showFeedback('Gagal memutar rekaman', 'error');
    });
    
    audio.addEventListener('ended', () => {
        showFeedback('Rekaman selesai diputar', 'info');
    });
    
    audio.play();
    showFeedback('Memutar rekaman Anda...', 'info');
}

// Menggambar visualizer
function drawVisualizer() {
    if (!analyser || !visualizer) return;
    
    const canvasContext = visualizer.getContext('2d');
    if (!canvasContext) return;
    
    analyser.getByteTimeDomainData(dataArray);
    
    canvasContext.clearRect(0, 0, visualizer.width, visualizer.height);
    canvasContext.fillStyle = 'rgb(200, 200, 200)';
    canvasContext.fillRect(0, 0, visualizer.width, visualizer.height);
    
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = 'rgb(58, 12, 163)';
    canvasContext.beginPath();
    
    const sliceWidth = visualizer.width / analyser.frequencyBinCount;
    let x = 0;
    
    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * visualizer.height / 2;
        
        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    canvasContext.lineTo(visualizer.width, visualizer.height / 2);
    canvasContext.stroke();
    
    animationId = requestAnimationFrame(drawVisualizer);
}

// Memilih kata acak
function selectRandomWord() {
    if (filteredData.length === 0) {
        currentWord = null;
        currentWordData = null;
        currentWordDisplay.textContent = '-';
        showFeedback('Tidak ada kata yang tersedia untuk kategori ini', 'info');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    currentWordData = filteredData[randomIndex];
    currentWord = currentWordData.word;
    currentWordDisplay.textContent = currentWord;
    
    // Reset rekaman sebelumnya
    userRecording = null;
    playUserBtn.disabled = true;
    
    showFeedback(`Kata baru: ${currentWord}. Silakan rekam pelafalan Anda`, 'info');
}

// Menampilkan feedback
function showFeedback(message, type = 'info') {
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = 'feedback';
    
    switch (type) {
        case 'error':
            feedback.classList.add('error');
            break;
        case 'success':
            feedback.classList.add('success');
            break;
        case 'info':
            feedback.classList.add('info');
            break;
    }
}