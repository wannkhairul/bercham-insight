// Memuatkan pemboleh ubah persekitaran dari fail .env
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Tambah ini

const app = express();
const PORT = process.env.PORT || 3000; // Tidak digunakan di serverless, tetapi disimpan untuk keserasian

// ---------------------------------------------
// MIDDLEWARE (Alat Bantu Server)
// ---------------------------------------------
// Membenarkan server memproses data JSON
app.use(express.json());
// Membenarkan frontend dan backend berinteraksi (penting untuk projek ini)
app.use(cors());

// Menghidangkan fail statik (HTML/CSS/JS) dari folder public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------------------------------------------
// SAMBUNGAN DATABASE (MongoDB)
// ---------------------------------------------
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Berjaya menyambung ke MongoDB Atlas!');
    } catch (err) {
        console.error('❌ Ralat sambungan MongoDB:', err);
        // Jangan crash aplikasi; log sahaja dan teruskan
    }
};
connectDB(); // Panggil sambungan

// ---------------------------------------------
// DEFINISI MODEL (Mongoose Schemas)
// ---------------------------------------------
// ... (Model Announcement yang kita buat sebelum ini) ...
const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// Model BAHARU untuk Bangunan/Kelas (Untuk fungsi Pencarian Lokasi)
const BuildingSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Contoh: Blok A, Dewan Kuliah Utama
    code: { type: String, required: true, unique: true }, // Contoh: BA, DKU
    description: { type: String },
    locationUrl: { type: String } // Pautan Google Maps atau peta interaktif
});
const Building = mongoose.model('Building', BuildingSchema);

// Model BAHARU untuk Tempahan Fasiliti (Untuk fungsi Booking)
const BookingSchema = new mongoose.Schema({
    facilityName: { type: String, required: true }, // Contoh: Bilik Mesyuarat 1
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // Contoh: "10:00 - 11:00"
    userMatric: { type: String, required: true }, // Nombor Matrik pelajar
    purpose: { type: String, required: true },
    status: { type: String, default: 'Pending' } // Status: Pending, Approved, Rejected
}, { timestamps: true }); // Mongoose akan tambah createAt dan updateAt secara automatik
const Booking = mongoose.model('Booking', BookingSchema);

// ---------------------------------------------
// ROUTES (API Endpoints)
// ---------------------------------------------

// 1. Route untuk mendapatkan semua pengumuman (DIBETULKAN: Hanya pulangkan JSON)
app.get('/api/info', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: "Gagal mendapatkan info kampus." });
    }
});

// 2. Route Utama: Laluan utama '/' akan menghantar index.html secara automatik (kerana express.static('public'))
//    Kita akan tambah routes untuk Bangunan dan Tempahan kemudian.

// ... (Route untuk /api/info sedia ada) ...

// 3. Route untuk mendapatkan semua Bangunan/Kelas
app.get('/api/bangunan', async (req, res) => {
    try {
        const buildings = await Building.find().sort({ code: 1 });
        res.json(buildings);
    } catch (error) {
        res.status(500).json({ message: "Gagal mendapatkan senarai bangunan." });
    }
});

// 4. Route untuk mencipta Tempahan Baharu (POST)
app.post('/api/tempahan', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Tempahan berjaya dihantar. Menunggu kelulusan." });
    } catch (error) {
        // Ralat pengesahan atau ralat pangkalan data
        res.status(400).json({ message: "Gagal membuat tempahan.", details: error.message });
    }
});
// Route BAHARU: Mendapatkan senarai semua tempahan
app.get('/api/tempahan/all', async (req, res) => {
    try {
        // Ambil semua tempahan dan urutkan mengikut tarikh terkini
        const bookings = await Booking.find().sort({ date: -1, createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Gagal mendapatkan senarai tempahan." });
    }
});

// ---------------------------------------------
// EKSPORT APLIKASI (Untuk Serverless seperti Vercel)
// ---------------------------------------------
module.exports = app; // Eksport aplikasi untuk Vercel/Render

// Alih keluar app.listen kerana tidak diperlukan di serverless
// app.listen(PORT, () => {
//     console.log(`🚀 Server Bercham Insight berjalan di http://localhost:${PORT}`);
// });
