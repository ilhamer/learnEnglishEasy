// Variabel global
let vocabularyData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 8;
let savedVocab = JSON.parse(localStorage.getItem('savedVocab')) || [];
let isAudioEnabled = false;

// DOM Elements
const vocabGrid = document.querySelector('.vocab-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-btn');
const prevPageBtn = document.querySelector('.page-btn:disabled');
const nextPageBtn = document.querySelector('.page-btn:not(:disabled)');
const pageNumber = document.querySelector('.page-number');

// Fungsi utama untuk inisialisasi
async function initializeApp() {
    try {
        document.getElementById('loading').style.display = 'block';
        
        // Aktifkan audio setelah interaksi pertama
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
        
        vocabularyData = await fetchVocabularyData();
        filteredData = [...vocabularyData];
        
        renderVocabulary();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error in initialization:', error);
        showErrorToUser("Gagal memuat data kosakata");
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Fungsi untuk mengaktifkan audio
function enableAudio() {
    isAudioEnabled = true;
    console.log("Audio diaktifkan");
}

// Fungsi untuk mengambil data vocabulary
async function fetchVocabularyData() {
    try {
        const response = await fetch('data/vocabulary.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching vocabulary data:', error);
        showErrorToUser("Gagal memuat data");
        return [];
    }
}

// Fungsi untuk render vocabulary cards
function renderVocabulary() {
    vocabGrid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    if (paginatedData.length === 0) {
        vocabGrid.innerHTML = '<p class="no-results">Tidak ada kosakata yang ditemukan</p>';
        return;
    }
    
    paginatedData.forEach(item => {
        const isSaved = savedVocab.includes(item.id);
        const audioFileName = item.audio_file.split('/').pop();
        
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.dataset.category = item.category;
        card.innerHTML = `
            <div class="card-image">
                <i class="fas fa-${getIconByCategory(item.category)}"></i>
            </div>
            <div class="card-body">
                <h3>${item.word}</h3>
                <p>${item.meaning}</p>
                <small>Contoh: ${item.example}</small>
            </div>
            <div class="card-footer">
                <button class="audio-btn" data-audio="${audioFileName}">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="save-btn ${isSaved ? 'saved' : ''}" data-id="${item.id}">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        `;
        
        vocabGrid.appendChild(card);
    });
    
    updatePagination();
}

// Fungsi untuk mendapatkan icon berdasarkan kategori
function getIconByCategory(category) {
    const icons = {
        'greetings': 'handshake',
        'food': 'utensils',
        'family': 'users',
        'verbs': 'running'
    };
    return icons[category] || 'language';
}

// Fungsi untuk setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            filterVocabulary(category);
        });
    });
    
    // Search functionality
    searchButton.addEventListener('click', searchVocabulary);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchVocabulary();
    });
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('active');
    });
    
    // Event delegation untuk elemen dinamis
    document.addEventListener('click', handleDynamicElementsClick);
}

// Fungsi untuk menangani klik pada elemen dinamis
function handleDynamicElementsClick(e) {
    // Audio button
    if (e.target.closest('.audio-btn')) {
        const audioBtn = e.target.closest('.audio-btn');
        if (!audioBtn.dataset.audio) {
            console.error("Data audio tidak ditemukan pada tombol");
            return;
        }
        playAudio(audioBtn.dataset.audio);
    }
    
    // Save button
    if (e.target.closest('.save-btn')) {
        const saveBtn = e.target.closest('.save-btn');
        toggleSaveVocab(saveBtn);
    }
}

// Fungsi untuk filter vocabulary
function filterVocabulary(category) {
    filteredData = category === 'all' 
        ? [...vocabularyData] 
        : vocabularyData.filter(item => item.category === category);
    
    currentPage = 1;
    renderVocabulary();
}

// Fungsi untuk search vocabulary
function searchVocabulary() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredData = searchTerm === ''
        ? [...vocabularyData]
        : vocabularyData.filter(item => 
            item.word.toLowerCase().includes(searchTerm) || 
            item.meaning.toLowerCase().includes(searchTerm)
        );
    
    currentPage = 1;
    renderVocabulary();
}

// Fungsi untuk memutar audio
async function playAudio(audioFile) {
    if (!isAudioEnabled) {
        alert("Silakan klik di halaman terlebih dahulu untuk mengaktifkan audio");
        return;
    }

    try {
        const audioPath = `audio/english/${audioFile}`;
        console.log("Mencoba memutar:", audioPath);
        
        // Cek apakah file ada
        const response = await fetch(audioPath);
        if (!response.ok) {
            throw new Error(`File audio tidak ditemukan: ${audioPath}`);
        }

        const audio = new Audio(audioPath);
        audio.preload = 'auto';
        
        // Tambahkan error handler
        audio.addEventListener('error', (e) => {
            console.error("Error loading audio:", e);
            showError("Format audio tidak didukung");
        });

        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            await playPromise.catch(e => {
                throw e;
            });
        }
    } catch (e) {
        console.error("Error memutar audio:", e);
        showError(`Gagal memutar audio: ${e.message}`);
    }
}

// Fungsi untuk toggle save vocabulary
function toggleSaveVocab(button) {
    const vocabId = parseInt(button.dataset.id);
    
    if (button.classList.contains('saved')) {
        savedVocab = savedVocab.filter(id => id !== vocabId);
        button.classList.remove('saved');
    } else {
        savedVocab.push(vocabId);
        button.classList.add('saved');
    }
    
    localStorage.setItem('savedVocab', JSON.stringify(savedVocab));
}

// Fungsi untuk pagination
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderVocabulary();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderVocabulary();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    pageNumber.textContent = currentPage;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Fungsi untuk menampilkan error
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'audio-error';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 3000);
}

// Fungsi untuk menampilkan error ke user
function showErrorToUser(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'global-error';
    errorElement.innerHTML = `
        <p>${message}</p>
        <button onclick="location.reload()">Coba Lagi</button>
    `;
    document.body.appendChild(errorElement);
}

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', initializeApp);