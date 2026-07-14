# Panduan Implementasi — Buat Iza

## 1. Cara kerja singkat

```
Website dibuka
  → Load config.json (aturan)
  → Load workflow.json (isi cerita)
  → Tentukan halaman aktif
  → Animation Engine pilih paket (A–E) otomatis, berganti tiap animation_group halaman
  → Background Engine pilih scenery otomatis
  → Doodle Engine pilih sepasang SVG latar otomatis + doodle kecil DI DALAM kartu yang berganti tiap satu halaman
  → Audio Engine mainkan musik (jika ada) + bar musik kecil di kartu
  → Renderer menggambar
  → Realtime: presence aktif, statistik dicatat
```

Saat **Penulis** login (`login.html`) dan mengklik salah satu titik
navigator di `index.html`, klik itu ditulis ke tabel `player_state` di
Supabase. Semua pembaca lain (jika `config.json → allow_jump: false`)
langsung ikut berpindah ke halaman yang sama secara realtime — cocok untuk
"membacakan" surat secara langsung. Jika `allow_jump: true` (default),
setiap pembaca bebas menjelajah halaman sendiri dengan kecepatannya
masing-masing, dan posisi klik Penulis hanya ditampilkan sebagai info kecil
("Penulis di halaman 3") tanpa memaksa pembaca berpindah.

## 2. Mengisi cerita (`workflow.json`)

Setiap halaman adalah satu object di `nodes`:

```json
{
  "id": 11,
  "title": "Judul Halaman",
  "subtitle": "Subjudul singkat",
  "description": "Isi halaman. Bisa beberapa baris —\ngunakan \\n untuk baris baru.",
  "image": "data/images/illustration/11.jpg",
  "musik": "contoh"
}
```

- `image` boleh dikosongkan (`""`) — jika gambar tidak ditemukan,
  elemen otomatis disembunyikan.
- `musik` **bukan path file**, melainkan KUNCI yang didaftarkan di
  `config.json → music_library`. Contoh, jika `config.json` berisi:

  ```json
  "music_library": {
      "contoh": { "file": "data/music/contoh.mp3", "title": "Judul Lagu" }
  }
  ```

  maka cukup tulis `"musik": "contoh"` di halaman manapun yang ingin
  memutar lagu itu. Halaman lain bisa memakai kunci lain, atau `""`
  untuk tanpa musik (memakai `default_music` di `config.json` bila
  diisi). Bar musik kecil (judul lagu, tombol putar/jeda, progress)
  otomatis muncul di kartu setiap kali halaman punya musik.
- **Jangan** menambahkan field warna/animasi/status — semua itu memang
  sengaja tidak ada di sini, biar Penulis fokus menulis. Tampilan
  sepenuhnya otomatis dari `config.json` + urutan halaman.
- Urutan array = urutan tampil. Tambah/hapus/sisipkan halaman bebas,
  `id` cukup unik.

## 3. Mengatur tampilan (`config.json`)

Field yang paling sering diubah:

| Field | Fungsi |
|---|---|
| `theme` | `"cute"` \| `"paper"` \| `"dark"` — mengganti seluruh palet warna |
| `font.display` / `font.body` | Nama font Google Fonts untuk judul/isi |
| `allow_jump` | `true` = pembaca bebas jelajah; `false` = terkunci mengikuti Penulis (mode "dibacakan langsung") |
| `animation_group` | Setiap berapa halaman paket animasi/background/doodle berganti (default `2`) |
| `music_library` | Daftar musik (kunci → file + judul) yang bisa dipakai lewat `"musik": "<kunci>"` di workflow.json |
| `default_music`, `music_volume` | Kunci musik & volume default bila halaman tidak punya `musik` sendiri |
| `show_header`, `show_node`, `show_music_button` | Tampil/sembunyikan bagian antarmuka |
| `empty_state` | Teks yang muncul bila `workflow.json` masih kosong |

## 4. Setup Supabase — proyek realtime baru

Buat project baru di [supabase.com](https://supabase.com) khusus untuk
"Buat Iza" (jangan pakai project sidang/proyek lain). Lalu di **SQL
Editor**, jalankan file di `sql/` **berurutan**:

1. `sql/schema.sql` — membuat tabel `projects`, `player_state`,
   `presence` (cadangan), `analytics`, dan fungsi `increment_total_views()`.
2. `sql/rls.sql` — mengaktifkan Row Level Security di semua tabel.
3. `sql/policies.sql` — publik hanya boleh `SELECT`; hanya Penulis yang
   login (Supabase Auth) yang boleh `UPDATE player_state`.
4. `sql/seed.sql` — membuat baris awal `project_id = 1`.

Aktifkan **Realtime** untuk tabel `player_state`:
**Database → Replication** (atau buka tabel di Table Editor → toggle
**Enable Realtime**) → pastikan `player_state` masuk publication
`supabase_realtime`.

> Catatan soal presence: implementasi bawaan memakai **Supabase Realtime
> Presence** (fitur channel, tidak menulis ke database, otomatis hilang
> saat tab ditutup) — bukan tabel `presence` di `schema.sql`. Tabel itu
> hanya disediakan sebagai cadangan bila di masa depan ingin presence
> berbasis heartbeat database. Tidak perlu diisi manual.

Buat akun Penulis: **Authentication → Users → Add user** (email + password).
Akun ini dipakai untuk masuk di `login.html`.

## 5. Di mana menempel link project & publish key Supabase

Buka **Settings → API** di dashboard Supabase project Anda, salin:

- **Project URL**
- **anon / publishable key**

Tempel keduanya di **`config.json`**, pada objek `"supabase"` di bagian
paling bawah:

```json
"supabase": {
    "projectUrl": "https://xxxxxxxx.supabase.co",
    "publishableKey": "sb_publishable_xxxxxxxxxxxxxxxxxxxx",
    "projectId": 1
}
```

`projectId` harus sama dengan `id` yang dipakai di `sql/seed.sql`
(default `1`). Key ini **aman ditaruh di file publik** selama
`sql/rls.sql` + `sql/policies.sql` sudah dijalankan — publik hanya bisa
membaca, tidak bisa menulis.

Tidak ada file `.env` atau kredensial tersembunyi lain — `config.json`
adalah satu-satunya tempat menyimpan koneksi Supabase untuk proyek ini.

## 6. Struktur JS (untuk yang ingin mengembangkan lebih jauh)

| File | Tanggung jawab |
|---|---|
| `config-loader.js` | Satu-satunya yang membaca `config.json` |
| `workflow-loader.js` | Satu-satunya yang membaca `workflow.json` |
| `state.js` | Posisi baca lokal di browser pembaca (localStorage) |
| `animation.js` / `background.js` / `doodle.js` | Mesin otomatis, menerima index halaman → mengembalikan paket yang harus dipakai |
| `audio.js` | Satu track aktif, crossfade saat halaman berganti, expose status/progress |
| `musicplayer.js` | Menggambar bar musik kecil di kartu (judul, tombol putar/jeda, progress) dari status `audio.js` |
| `renderer.js` | Satu-satunya yang menyentuh DOM konten cerita |
| `navigator.js` | Titik-titik halaman yang bisa diklik |
| `realtime.js` | Satu-satunya yang bicara ke Supabase (client, sinkronisasi, presence, statistik) |
| `admin.js` | Login/logout Penulis (Supabase Auth) |
| `analytics.js` | Statistik ringan untuk Penulis |
| `ui.js` | Potongan kecil UI: tombol musik, bilah Penulis |
| `engine.js` | Orkestrator — memanggil semua modul di atas sesuai urutan di §1 |
| `app.js` | Entry point, hanya memanggil `engine.init()` |

Menambah paket animasi/doodle/background baru = tambah entri di array
`PACKAGES`/`PAIRS`/`ORDER` pada file terkait — tidak perlu mengubah
`engine.js` maupun `workflow.json`.
