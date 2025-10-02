// --- IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyA7rb5OXdQ2tbD296ZAJxmddDQ6kI9YSok",
    authDomain: "gallery-of-wonders.firebaseapp.com",
    projectId: "gallery-of-wonders",
    storageBucket: "gallery-of-wonders.firebasestorage.app",
    messagingSenderId: "1099019550255",
    appId: "1:1099019550255:web:6cbbdf1f333373ae6e50da"
};

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- MOCK DATA ---
const mockGalleryItems = [
    { id: 1, type: 'Portfolio', title: 'Cosmic Sunrise', imageUrl: 'https://placehold.co/600x400/1b3b5f/0ff?text=Cosmic+Sunrise' },
    { id: 2, type: 'Music', title: 'Galaxy Beats', imageUrl: 'https://placehold.co/600x400/5E35B1/fff?text=Galaxy+Beats' },
    { id: 3, type: 'Performance', title: 'Starlight Dance', imageUrl: 'https://placehold.co/600x400/E53935/fff?text=Starlight+Dance' },
    { id: 4, type: 'Portfolio', title: 'Nebula Dreams', imageUrl: 'https://placehold.co/600x400/1b3b5f/FF9800?text=Nebula+Dreams' },
];

const renderGallery = (items) => {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.title}">
            <div class="p-4">
                <h3 class="font-bold text-lg">${item.title}</h3>
                <p class="text-sm">${item.type}</p>
            </div>
        `;
        galleryGrid.appendChild(card);
    });
};

/**
 * Creates and renders the storage pie chart.
 */
const createStorageChart = () => {
    const ctx = document.getElementById('storageChart').getContext('2d');
    const isLight = document.body.classList.contains('light-mode');
    
    if (window.myStorageChart instanceof Chart) {
        window.myStorageChart.destroy();
    }

    window.myStorageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Music', 'Image', 'Documents', 'Other'],
            datasets: [{
                data: [30, 50, 15, 5],
                backgroundColor: ['#5E35B1', '#0ff', '#FF9800', '#E53935'],
                borderColor: isLight ? '#ffffff' : '#1e293b',
                borderWidth: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: isLight ? '#0f172a' : '#ffffff', font: { family: "'Inter', sans-serif" } } }
            }
        }
    });
};


const handleThemeSwitch = () => {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    const applyTheme = (theme) => {
        document.body.classList.toggle('light-mode', theme === 'light');
        sunIcon.classList.toggle('hidden', theme === 'light');
        moonIcon.classList.toggle('hidden', theme !== 'light');
    };
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
        createStorageChart();
    });
};

/**
 * Sets up the dashboard UI, populates user data, and initializes content.
 * @param {User} user - The authenticated Firebase user object.
 */
const setupDashboard = async (user) => {
    document.getElementById('user-display-name').textContent = user.displayName || 'Gallery Member';
    const initial = (user.displayName || 'U').charAt(0).toUpperCase();
    document.getElementById('user-avatar').src = `https://placehold.co/40x40/0ff/111?text=${initial}`;

    handleThemeSwitch();
    createStorageChart();
    
    document.getElementById('logout-button').addEventListener('click', () => {
        signOut(auth).catch(error => console.error("Logout failed:", error));
    });
    
  
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    const photoHeader = document.getElementById('photo-header');

    const switchView = (viewId) => {
        // hide all views
        views.forEach(view => view.classList.add('hidden'));
        
        // Show the selected view
        const activeView = document.getElementById(viewId + '-view');
        if (activeView) {
            activeView.classList.remove('hidden');
        }
        // Toggle header visibility for Photo view
        photoHeader.classList.toggle('hidden', viewId !== 'Photo');

        // Update active link styling
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewId);
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = e.currentTarget.dataset.view;
            switchView(viewId);
        });
    });

    // Set initial view to Photo
    switchView('Photo');
    renderGallery(mockGalleryItems);

    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filterType = tab.textContent;
            const filteredItems = filterType === 'All' 
                ? mockGalleryItems 
                : mockGalleryItems.filter(item => item.type === filterType);
            renderGallery(filteredItems);
        });
    });
};


onAuthStateChanged(auth, (user) => {
    if (user) {
        setupDashboard(user);
    } else {
        window.location.href = '../signin_frontend/signin.html';
    }
});

