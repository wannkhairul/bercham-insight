// --- LOGIK ANIMASI ON SCROLL ---
const animateElements = () => {
    const sections = document.querySelectorAll('section');
    const screenHeight = window.innerHeight;

    sections.forEach(section => {
        // Mendapatkan posisi elemen berbanding viewport
        const elementPosition = section.getBoundingClientRect().top;

        // Jika elemen berada dalam 80% daripada viewport, tunjukkannya
        if (elementPosition < screenHeight * 0.8) {
            section.querySelectorAll('.fade-item').forEach((item, index) => {
                // Tambah sedikit delay untuk kesan beransur-ansur
                item.style.animationDelay = `${index * 0.1}s`; 
                item.classList.add('animate-fade-up');
            });
        }
    });
};

// Panggil fungsi apabila skrol dan selepas memuatkan
window.addEventListener('scroll', animateElements);
window.addEventListener('load', animateElements);
document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('building-results');
    const searchInput = document.getElementById('search-input');
    let allBuildings = [];

    // Fungsi untuk menarik data dari Backend
    const fetchBuildings = async () => {
        try {
            const response = await fetch('https://bercham-insight.vercel.app/api/bangunan');
            if (!response.ok) {
                throw new Error('Gagal mengambil data bangunan.');
            }
            allBuildings = await response.json();
            displayBuildings(allBuildings); // Paparkan semua selepas memuatkan
        } catch (error) {
            resultsContainer.innerHTML = `<p class="text-red-500 text-center">Ralat: ${error.message}. Pastikan server (node server.js) sedang berjalan!</p>`;
        }
    };

    // Fungsi untuk memaparkan senarai
    const displayBuildings = (buildings) => {
        if (buildings.length === 0) {
            resultsContainer.innerHTML = `<p class="text-gray-500 text-center">Tiada bangunan ditemui.</p>`;
            return;
        }

        // Kod Baharu dalam main.js (dalam fungsi displayBuildings)
resultsContainer.innerHTML = buildings.map(building => `
    <div class="p-4 border-l-4 border-secondary bg-gray-50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md hover:bg-white transition duration-300 fade-item">
        <div>
            <h3 class="text-xl font-semibold text-primary">${building.name} (${building.code})</h3>
            <p class="text-gray-600 text-sm mb-2 md:mb-0">${building.description || 'Tiada penerangan.'}</p>
        </div>
        ${building.locationUrl ? `<a href="${building.locationUrl}" target="_blank" class="text-secondary hover:text-primary font-medium flex items-center mt-2 md:mt-0 px-4 py-2 border border-secondary rounded-full">
            Lihat Peta
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-2l-2 2m0 0l-2-2m2 2V8"></path></svg>
        </a>` : ''}
    </div>
`).join('');
    };

    // Fungsi untuk Pencarian (Filtering)
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredBuildings = allBuildings.filter(building => 
            building.name.toLowerCase().includes(searchTerm) || 
            building.code.toLowerCase().includes(searchTerm)
        );
        displayBuildings(filteredBuildings);
    });

    fetchBuildings();

    // --- Logik Tempahan Fasiliti ---

const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.getElementById('booking-message');

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Menghentikan borang daripada dihantar secara lalai

        const bookingData = {
            facilityName: document.getElementById('facility').value,
            date: document.getElementById('date').value,
            timeSlot: document.getElementById('time-slot').value,
            userMatric: document.getElementById('matric').value,
            purpose: document.getElementById('purpose').value,
        };

        try {
            const response = await fetch('https://bercham-insight.vercel.app/api/tempahan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();
            
            // Paparkan mesej kejayaan atau kegagalan
            bookingMessage.classList.remove('hidden');
            if (response.ok) {
                bookingMessage.textContent = data.message || "Tempahan Berjaya!";
                bookingMessage.classList.add('bg-green-100', 'text-green-800');
                bookingMessage.classList.remove('bg-red-100', 'text-red-800');
                bookingForm.reset(); // Kosongkan borang jika berjaya
            } else {
                bookingMessage.textContent = data.message || "Tempahan Gagal. Sila cuba lagi.";
                bookingMessage.classList.add('bg-red-100', 'text-red-800');
                bookingMessage.classList.remove('bg-green-100', 'text-green-800');
            }

        } catch (error) {
            bookingMessage.classList.remove('hidden');
            bookingMessage.textContent = "Ralat Sambungan: Pastikan server (node server.js) sedang berjalan.";
            bookingMessage.classList.add('bg-red-100', 'text-red-800');
            bookingMessage.classList.remove('bg-green-100', 'text-green-800');
        }
    });
}

// --- LOGIK INFO KAMPUS ---

const announcementList = document.getElementById('announcement-list');

const fetchAnnouncements = async () => {
    try {
        const response = await fetch('https://bercham-insight.vercel.app/api/info');
        if (!response.ok) {
            throw new Error('Gagal mengambil data pengumuman.');
        }
        const announcements = await response.json();
        displayAnnouncements(announcements);
    } catch (error) {
        announcementList.innerHTML = `<p class="text-red-500 text-center col-span-full">Ralat: ${error.message}. Gagal menyambung ke API Info.</p>`;
    }
};

const displayAnnouncements = (announcements) => {
    if (announcements.length === 0) {
        announcementList.innerHTML = `<p class="text-gray-500 text-center col-span-full">Tiada pengumuman terkini buat masa ini.</p>`;
        return;
    }

    announcementList.innerHTML = announcements.map(announcement => {
        // Format tarikh
        const date = new Date(announcement.date).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' });
        
        return `
            <div class="p-6 bg-white rounded-xl shadow-lg border-t-4 border-primary hover:shadow-xl transition duration-300 transform hover:-translate-y-1 fade-item">
                <p class="text-sm text-gray-500 mb-2">${date}</p>
                <h3 class="text-xl font-bold text-primary mb-3">${announcement.title}</h3>
                <p class="text-gray-700">${announcement.content.substring(0, 100)}...</p>
                <a href="#" class="mt-3 inline-block text-secondary hover:text-primary font-medium text-sm">Baca Selanjutnya &rarr;</a>
            </div>
        `;
    }).join('');
};

// Panggil fungsi ini apabila laman dimuat
fetchAnnouncements();
});