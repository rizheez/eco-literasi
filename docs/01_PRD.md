# PRD - ECO DAYAK Kids

## Overview

ECO DAYAK Kids adalah aplikasi edukasi interaktif untuk anak usia 4–6 tahun yang bertujuan meningkatkan literasi bahasa dan eco-literacy berbasis kearifan lokal Dayak Kalimantan Timur.

Aplikasi harus dapat berjalan sepenuhnya secara offline pada:

- Android
- Windows (.exe melalui Tauri)
- Linux
- macOS (opsional)

Target utama adalah menghasilkan aplikasi ringan, cepat, dan mudah digunakan oleh anak PAUD maupun guru.

---

# Goal

Mengembangkan aplikasi edukasi digital yang mengintegrasikan:

- Literasi Bahasa
- Eco Literacy
- Budaya Dayak
- Game Edukasi

sesuai model ECO-DL (Eco Literacy Digital Learning).

---

# Non Goal

Tidak membuat:

- Sistem login online
- Backend server
- Cloud storage
- Multiplayer
- Iklan
- Pembelian dalam aplikasi

Semua fitur wajib berjalan offline.

---

# Target Platform

Desktop

- Windows (Tauri)
- Linux
- macOS

Mobile

- Android (Capacitor)

Frontend

- React

---

# Tech Stack

## Framework

React 19

TypeScript

Vite

React Router

TanStack Query (opsional)

Zustand

TailwindCSS

shadcn/ui

Framer Motion

React Hook Form

Zod

Dexie (IndexedDB)

Howler.js

React Use

Tauri

Capacitor

---

# Code Style

Gunakan:

- Functional Component
- Hooks
- Strict TypeScript
- Composition Pattern
- Reusable Component

Hindari:

- Class Component
- Redux
- jQuery
- Inline CSS

---

# Folder Structure

```
src/

assets/

audio/

images/

animations/

components/

features/

home/

story/

flora/

fauna/

language/

eco/

game/

progress/

settings/

hooks/

lib/

router/

services/

store/

database/

types/

utils/

pages/
```

---

# Database

Gunakan Dexie.

Table:

```
children

stories

vocabulary

games

progress

score

badges

settings
```

Semua data harus offline.

---

# Asset

Semua asset berada di folder assets.

```
audio/

images/

animations/

video/
```

Tidak boleh mengambil asset dari internet.

---

# Theme

UI harus:

- penuh warna
- ramah anak
- icon besar
- font besar
- tombol besar
- animasi sederhana

Tidak boleh menggunakan tampilan enterprise.

---

# Navigation

```
Home

Belajar

Cerita

Flora Fauna

Game

Progress

Pengaturan
```

Bottom Navigation pada Android.

Sidebar pada Desktop.

---

# Home

Berisi:

Logo

Maskot

Menu utama

Progress hari ini

Badge terbaru

---

# Modul 1

## Eksplorasi Budaya

Menu:

Cerita Dayak

Rumah Lamin

Burung Enggang

Hutan

Sungai

Musik Tradisional

Setiap materi terdiri dari:

- gambar
- audio
- teks
- animasi ringan

---

# Modul 2

## Literasi Bahasa

Fitur

Menyimak

Tebak Gambar

Kosakata

Susun Huruf

Mencocokkan Kata

Rekam Suara

---

# Modul 3

## Eco Literacy

Game:

Menjaga Hutan

Menjaga Sungai

Buang Sampah

Pohon

Hewan

Sebab Akibat

Contoh:

Jika hutan ditebang

↓

Apa akibatnya?

Jika sungai bersih

↓

Apa manfaatnya?

---

# Modul 4

## Game Edukasi

Puzzle

Drag and Drop

Memory Card

Quiz

True False

Matching

Sorting

Word Puzzle

Semua game harus bisa dimainkan offline.

---

# Progress

Menampilkan:

Level

Bintang

Skor

Badge

Riwayat bermain

---

# Badge

Contoh:

🌳 Penjaga Hutan

🐟 Sahabat Sungai

🦜 Ahli Burung Enggang

📚 Pintar Bercerita

---

# Audio

Gunakan:

Howler.js

Semua audio preload.

Tidak streaming.

---

# Animasi

Gunakan:

Framer Motion

Animasi ringan.

Tidak berlebihan.

---

# State Management

Gunakan Zustand.

Pisahkan store berdasarkan fitur.

Contoh:

```
useProgressStore

useGameStore

useSettingsStore

useChildStore
```

---

# Routing

Gunakan React Router.

Lazy Loading untuk semua halaman.

---

# Offline First

Semua fitur harus bekerja tanpa internet.

Tidak boleh ada API.

Tidak boleh fetch.

Tidak boleh axios.

Semua data berasal dari local database atau assets.

---

# Accessibility

Target pengguna:

Anak usia 4–6 tahun.

Maka:

Button minimal 48px.

Font minimal 20px.

Kontras tinggi.

Audio sebagai panduan.

---

# Performance

Target:

Startup < 2 detik

FPS stabil

Memory rendah

Asset dioptimalkan

Lazy loading

Code splitting

---

# Build

Desktop

Gunakan Tauri.

Output:

Windows EXE

Linux

macOS

Mobile

Gunakan Capacitor.

Output:

Android APK

---

# Future Feature

- Sinkronisasi cloud
- Dashboard guru
- Dashboard orang tua
- Statistik perkembangan
- Update konten
- Multi bahasa
- Speech Recognition
- AI Story Generator

Fitur tersebut tidak termasuk versi pertama.

---

# Acceptance Criteria

Aplikasi dinyatakan selesai apabila:

- Semua menu dapat diakses tanpa internet.
- Semua game berjalan offline.
- Progress tersimpan di IndexedDB.
- Build berhasil menjadi APK Android.
- Build berhasil menjadi Windows EXE menggunakan Tauri.
- UI responsif untuk desktop dan mobile.
- Tidak ada dependency terhadap backend atau layanan cloud.
- Seluruh kode menggunakan TypeScript strict mode dan mengikuti struktur proyek yang telah ditentukan.
