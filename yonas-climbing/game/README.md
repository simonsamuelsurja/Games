# Yonas — Satu Pegangan Lagi

Game web bulan pertama: satu ilustrasi penuh per adegan, dialog bergantian, dan empat pilihan mingguan. Gambar hitam putih dengan aksen oranye.

[Mainkan versi yang sudah tayang](https://yonas-bulan-satu.rustymatch1.chatgpt.site/).

## Menjalankan di perangkat lain

Gunakan Node.js 20 atau yang lebih baru. Dari folder ini, jalankan:

```sh
npm start
```

Buka http://127.0.0.1:4173. Tidak ada paket tambahan yang perlu dipasang. Seluruh halaman dan gambar ada di `dist/`, sehingga juga bisa dipasang pada layanan hosting statis.

## Yang sudah tersedia

- Nama karakter dapat diisi sebelum cerita dimulai; nama bawaan Yonas.
- Intro: Yonas sudah menjadi manajer penuh waktu dan langsung berlangganan climbing.
- Empat minggu dengan pilihan tetap: Kerja, Latihan, Istirahat.
- Indikator tersembunyi; keadaan karakter disampaikan lewat dialog.
- Setelah Latihan kedua, Raka meminta izin merekam sekaligus memposting ke sosmed.
- Tiga pilihan Latihan menyelesaikan jalur pertama.
- Dua penutup bab sesuai keberhasilan jalur, serta catatan keputusan rekaman.
- Simpan/lanjut otomatis di browser, riwayat dialog, main ulang, efek suara opsional, dan ekspor perjalanan lokal.

## Naskah

Game ini menggunakan naskah versi tayang pertama. Naskah bulan pertama yang sudah ditulis ulang disimpan di [folder naskah](../naskah/README.md) untuk ditinjau sebelum diterapkan ke game.

## Pemeriksaan

```sh
npm test
```

Delapan pemeriksaan mencakup hasil latihan, izin posting, kekurangan sumber daya, simpan/lanjut, mini event pada minggu terakhir, dan ekspor perjalanan.

## Gambar

Empat ilustrasi dalam `dist/assets/` sudah tersedia dalam WebP, dengan ukuran gabungan sekitar 1,76 MB. Tidak memakai video atau tampilan 3D. [Arahan gambar dan prompt](ART-DIRECTION.md) disimpan untuk melanjutkan pengerjaan di perangkat lain.
