# Buat Iza

**A Small Interactive Letter.**

Bukan engine khusus surat cinta — "Buat Iza" adalah *Interactive Story
Engine*: mesin generik untuk menampilkan cerita, surat, kartu ucapan,
permintaan maaf, atau presentasi personal secara interaktif, halaman demi
halaman, dengan animasi, background, dan doodle yang berganti otomatis.

## Filosofi

| Bagian | Tugas |
|---|---|
| `workflow.json` | **Isi cerita** — id, title, subtitle, description, image, musik (kunci dari `music_library`). Tidak ada logika. |
| `config.json` | **Aturan global** — tema, font, `music_library`, mode animasi, kredensial Supabase. Tidak ada isi cerita. |
| `assets/js/engine.js` | **Cara menampilkan** — memuat config & workflow, memilih animasi/background/doodle otomatis, merender. |
| Supabase | **Sinkronisasi** — hanya `current_step`, presence, dan statistik. Tidak menyimpan isi cerita. |
| `assets/css/theme-*.css` | **Identitas visual** — cute / paper / dark, palet lembut & font Fredoka + Quicksand. |

Penulis hanya perlu mengisi `workflow.json`. Sisanya — animasi, doodle,
background, transisi, hingga sinkronisasi realtime — ditangani otomatis
oleh engine, berganti setiap `config.animation_group` halaman.

## Mulai cepat

1. Baca **`panduan.md`** — langkah lengkap setup Supabase & pengisian kredensial.
2. Isi 10 halaman placeholder di `workflow.json`.
3. Tambahkan gambar ke `data/images/illustration/` dan musik (opsional) ke
   `data/music/`, lalu daftarkan tiap file musik di `config.json →
   music_library` (kunci bebas + judul lagu) sebelum dipakai di
   `workflow.json` lewat `"musik": "<kunci>"`.
4. Buka `index.html` — itu halaman publik sekaligus tempat Penulis login
   (lewat `login.html`) untuk mendapat kendali sinkronisasi.
5. Deploy ke GitHub Pages atau hosting statis apa pun.

## Struktur singkat

```
index.html / login.html      Halaman publik + gerbang Penulis
config.json                   Aturan global (isi kredensial Supabase di sini)
workflow.json                 Isi cerita (10 halaman placeholder)
assets/css/                    main, animation, responsive, theme-cute/paper/dark
assets/js/                     engine, renderer, navigator, animation, background,
                                doodle, audio, musicplayer, state, realtime, admin,
                                analytics, ui, ...
data/svg/                      10 doodle (smiley, flower, cloud, ribbon, dst.)
data/images/, data/music/       Aset milik Penulis (kosong, siap diisi)
sql/                            schema, rls, policies, seed
```
