// Data Grammar
let grammarData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 6;

// DOM Elements
const grammarGrid = document.getElementById('grammarGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-btn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumber = document.getElementById('pageNumber');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchGrammarData();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Gagal memuat data tata bahasa');
    }
});

// Fetch data from JSON
async function fetchGrammarData() {
    try {
        const response = await fetch('data/grammar.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        grammarData = await response.json();
        filteredData = [...grammarData];
        renderGrammar();
    } catch (error) {
        console.error('Error fetching grammar data:', error);
        throw error;
    }
}

// Render grammar cards
function renderGrammar() {
    grammarGrid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    if (paginatedData.length === 0) {
        grammarGrid.innerHTML = '<p class="no-results">Tidak ada materi yang ditemukan</p>';
        return;
    }
    
    paginatedData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'grammar-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${item.topic}</h3>
            </div>
            <div class="card-body">
                <p>${item.explanation}</p>
                <div class="example">
                    <div class="example-title">Contoh:</div>
                    <p>${item.example}</p>
                </div>
            </div>
        `;
        grammarGrid.appendChild(card);
    });
    
    updatePagination();
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            filterGrammar(category);
        });
    });
    
    // Search functionality
    searchButton.addEventListener('click', searchGrammar);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchGrammar();
    });
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('active');
    });
}

// Filter grammar by category
function filterGrammar(category) {
    if (category === 'all') {
        filteredData = [...grammarData];
    } else {
        filteredData = grammarData.filter(item => item.category === category);
    }
    
    currentPage = 1;
    renderGrammar();
}

// Search grammar
function searchGrammar() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredData = [...grammarData];
    } else {
        filteredData = grammarData.filter(item => 
            item.topic.toLowerCase().includes(searchTerm) || 
            item.explanation.toLowerCase().includes(searchTerm) ||
            item.example.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderGrammar();
}

// Pagination functions
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderGrammar();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderGrammar();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    pageNumber.textContent = currentPage;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Show error message
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}