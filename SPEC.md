# Fitness Quiz — Spesifikasi MVP

Status: **rencana, belum dibangun.** Menunggu aset gambar.

## Konsep
- Game kuis di browser (HP & laptop), mekanik cukup klik/tap jawaban.
- Menguji pengetahuan, bukan ketangkasan.
- Target: praktisi fitness. Tidak terkait Tuntun.
- MVP: single player. Belum ada login, leaderboard, multiplayer.
- Satu website berisi banyak mode/kategori. Mode berikutnya bisa meluas ke olahraga lain → struktur mode dibuat modular, tapi tanpa over-engineering untuk mode yang belum jelas.

## Mode MVP
- **Mode 1a — Tebak otot:** kartu menampilkan anatomi dengan satu otot di-highlight → pilihan ganda nama otot.
- **Mode 1b — Tunjuk otot:** gambar anatomi dengan garis penunjuk ke tiap otot (tanpa label). Nama otot muncul satu per satu; pemain **tap langsung di area otot** (bukan di ujung garis).
- **Mode 2 — Otot dominan:** kartu berisi visual gerakan olahraga → pilihan ganda otot utama (prime mover).
  - Pilih gerakan yang prime mover-nya jelas.
  - Jangan pakai otot sinergis sebagai pengecoh (mis. glute untuk squat, triceps untuk bench press).
  - Tiap soal punya penjelasan.

## Keputusan
| Hal | Keputusan |
|---|---|
| Gambar anatomi | Disediakan pemilik (nanti) |
| Gambar gerakan | Disediakan pemilik (nanti) |
| Mode 1b | Tetap pakai garis, tapi tap di otot |
| Nama otot | Nama anatomi (Latin), sama di kedua bahasa |
| Bahasa | Indonesia default, toggle ke English (soal, UI, penjelasan) |
| Timer | Ya. Default 15 dtk/soal (1a, 2), 10 dtk/otot (1b), bonus kecepatan. Mudah diubah |

## Spesifikasi aset

### Anatomi (Mode 1a & 1b)
- **SVG**, tampilan depan & belakang (2 file atau 2 artboard).
- Tiap otot = layer/group terpisah, dinamai sesuai id otot (mis. `pectoralis-major`). Otot kiri+kanan dalam satu group.
- Illustrator: Export SVG dengan *Object IDs: Layer Names*.
- Garis penunjuk di layer terpisah: `line-<id-otot>` (mis. `line-pectoralis-major`).
- Hindari PNG/JPG: 1a jadi butuh satu gambar per otot dan area tap 1b harus ditelusuri manual.

### Gerakan (Mode 2)
- JPG/PNG/WebP, satu per gerakan, rasio dan gaya seragam (usul 1:1 atau 4:3).
- Nama file = nama gerakan, mis. `barbell-back-squat.jpg`.

## Usulan daftar otot (±26, permukaan — final ditentukan pemilik)
- **Depan:** deltoideus, pectoralis major, biceps brachii, brachioradialis, rectus abdominis, obliquus externus, serratus anterior, rectus femoris, vastus lateralis, vastus medialis, sartorius, adductor longus, tibialis anterior.
- **Belakang:** trapezius, latissimus dorsi, rhomboideus*, infraspinatus, teres major, triceps brachii, erector spinae*, gluteus maximus, gluteus medius, biceps femoris, semitendinosus, gastrocnemius, soleus.
- \* Sebagian besar tertutup otot lain; lazim tetap digambar di chart fitness. Opsional.

## Urutan kerja
1. Mesin game: menu pilih mode, timer, skor, rekor lokal, toggle bahasa.
2. Mode 1a & 1b dengan placeholder → ganti dengan SVG asli tanpa ubah kode.
3. Mode 2 setelah gambar gerakan tersedia.

## Catatan risiko
- Akurasi konten: pemain adalah praktisi, kesalahan akan cepat ketahuan. Hindari topik yang masih diperdebatkan; soal sebaiknya direview orang yang kompeten.
