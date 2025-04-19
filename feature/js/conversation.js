// Data dan State Aplikasi
let conversationData = [];
let filteredData = [];
let currentConversation = null;
let audioContext = null;
let audioEnabled = false;

// DOM Elements
const conversationGrid = document.getElementById('conversationGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const messageContainer = document.getElementById('messageContainer');
const playConversationBtn = document.getElementById('playConversation');
const recordBtn = document.getElementById('recordBtn');
const nextConversationBtn = document.getElementById('nextConversation');
const feedback = document.getElementById('feedback');

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup event listeners terlebih dahulu
        setupEventListeners();
        
        // Load data
        await loadConversationData();
        
        // Aktifkan audio setelah interaksi pertama
        document.addEventListener('click', enableAudio, { once: true });
    } catch (error) {
        console.error('Error initializing app:', error);
        showFeedback('Gagal memuat data percakapan', 'error');
    }
});

// Fungsi untuk mengaktifkan audio
function enableAudio() {
    if (audioEnabled) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioEnabled = true;
        showFeedback('Fitur audio telah diaktifkan', 'success');
    } catch (error) {
        console.error('Error enabling audio:', error);
        showFeedback('Browser tidak mendukung fitur audio', 'error');
    }
}

// Fungsi untuk memuat data dari JSON
async function loadConversationData() {
    try {
        // Coba load dari file JSON
        const response = await fetch('data/conversations.json');
        
        if (response.ok) {
            conversationData = await response.json();
        } else {
            // Fallback data jika file tidak tersedia
            conversationData = [
                {
                    "id": 1,
                    "title": "Memperkenalkan Diri",
                    "description": "Percakapan dasar untuk memperkenalkan diri",
                    "category": "greetings",
                    "dialog": [
                        {
                            "speaker": "John",
                            "english": "Hello, my name is John. What's your name?",
                            "indonesian": "Halo, nama saya John. Siapa nama Anda?"
                        },
                        {
                            "speaker": "Lisa",
                            "english": "Hi John, I'm Lisa. Nice to meet you.",
                            "indonesian": "Hai John, saya Lisa. Senang bertemu denganmu."
                        },
                        {
                            "speaker": "John",
                            "english": "Nice to meet you too, Lisa. Where are you from?",
                            "indonesian": "Senang bertemu denganmu juga, Lisa. Kamu dari mana?"
                        }
                    ],
                    "audio_file": "introduction.mp3"
                },
                {
                    "id": 2,
                    "title": "Belanja di Toko",
                    "description": "Percakapan saat berbelanja di toko",
                    "category": "shopping",
                    "dialog": [
                        {
                            "speaker": "Customer",
                            "english": "Excuse me, how much is this shirt?",
                            "indonesian": "Permisi, berapa harga kemeja ini?"
                        },
                        {
                            "speaker": "Shopkeeper",
                            "english": "It's $25. Would you like to try it on?",
                            "indonesian": "Harganya $25. Apakah Anda ingin mencobanya?"
                        }
                    ],
                    "audio_file": "shopping.mp3"
                }
            ];
        }
        
        filteredData = [...conversationData];
        renderConversationCards();
        
    } catch (error) {
        console.error('Error loading conversation data:', error);
        showFeedback('Gagal memuat data percakapan', 'error');
        throw error;
    }
}

// Render kartu percakapan
function renderConversationCards() {
    if (!conversationGrid) return;
    
    conversationGrid.innerHTML = '';
    
    if (filteredData.length === 0) {
        conversationGrid.innerHTML = '<p class="no-results">Tidak ada percakapan yang ditemukan</p>';
        return;
    }
    
    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'conversation-card';
        card.dataset.id = item.id;
        card.innerHTML = `
            <div class="card-header">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
            <div class="card-body">
                <p>Kategori: ${item.category}</p>
                <button class="start-btn" data-id="${item.id}">
                    Mulai Percakapan
                </button>
            </div>
        `;
        conversationGrid.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterConversations(button.dataset.category);
        });
    });
    
    // Play conversation button
    playConversationBtn?.addEventListener('click', playConversationAudio);
    
    // Next conversation button
    nextConversationBtn?.addEventListener('click', selectRandomConversation);
    
    // Event delegation for conversation cards
    conversationGrid?.addEventListener('click', (e) => {
        if (e.target.closest('.start-btn')) {
            const startBtn = e.target.closest('.start-btn');
            const conversationId = parseInt(startBtn.dataset.id);
            loadConversation(conversationId);
        }
    });
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle')?.addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('active');
    });
}

// Filter conversations by category
function filterConversations(category) {
    if (category === 'all') {
        filteredData = [...conversationData];
    } else {
        filteredData = conversationData.filter(item => item.category === category);
    }
    
    renderConversationCards();
}

// Memuat percakapan yang dipilih
function loadConversation(conversationId) {
    const conversation = conversationData.find(item => item.id === conversationId);
    if (!conversation) return;
    
    currentConversation = conversation;
    displayConversation(conversation.dialog);
    
    showFeedback(`Percakapan "${conversation.title}" telah dimuat. Klik "Putar Percakapan" untuk mendengarkan.`, 'success');
}

// Menampilkan percakapan di layar
function displayConversation(dialog) {
    if (!messageContainer) return;
    
    messageContainer.innerHTML = '';
    
    dialog.forEach((line, index) => {
        // Tambahkan delay untuk efek animasi berurutan
        setTimeout(() => {
            const englishMessage = document.createElement('div');
            englishMessage.className = 'message message-english';
            englishMessage.innerHTML = `
                <span class="message-speaker">${line.speaker} (English)</span>
                ${line.english}
            `;
            messageContainer.appendChild(englishMessage);
            
            // Scroll ke bawah
            messageContainer.scrollTop = messageContainer.scrollHeight;
            
            // Tambahkan terjemahan setelah 300ms
            setTimeout(() => {
                const indonesianMessage = document.createElement('div');
                indonesianMessage.className = 'message message-indonesian';
                indonesianMessage.innerHTML = `
                    <span class="message-speaker">${line.speaker} (Indonesia)</span>
                    ${line.indonesian}
                `;
                messageContainer.appendChild(indonesianMessage);
                
                // Scroll ke bawah lagi
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }, 300);
        }, index * 600);
    });
}

// Memutar audio percakapan
function playConversationAudio() {
    if (!currentConversation || !audioEnabled) {
        showFeedback('Silakan pilih percakapan terlebih dahulu dan klik di halaman untuk mengaktifkan audio', 'info');
        return;
    }
    
    const audioPath = `audio/conversation/${currentConversation.audio_file}`;
    const audio = new Audio(audioPath);
    
    audio.addEventListener('error', (e) => {
        console.error('Error playing audio:', e);
        showFeedback('Gagal memutar audio percakapan', 'error');
    });
    
    audio.play().catch(e => {
        console.error('Audio play failed:', e);
        showFeedback('Silakan klik di halaman terlebih dahulu untuk mengaktifkan audio', 'info');
    });
}

// Memilih percakapan acak
function selectRandomConversation() {
    if (filteredData.length === 0) {
        showFeedback('Tidak ada percakapan yang tersedia untuk kategori ini', 'info');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    const randomConversation = filteredData[randomIndex];
    loadConversation(randomConversation.id);
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