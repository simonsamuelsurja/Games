# Peta cerita

Peta merangkum kesepakatan, bukan semua percabangan final. Garis putus-putus menunjukkan peluang bersyarat atau detail yang belum dirinci.

[FigJam — Perjalanan Yonas](https://www.figma.com/board/gVs4wVijce1YfwekofJmMI/Perjalanan-Yonas)

Bagian papan: [panduan rutin](https://www.figma.com/board/gVs4wVijce1YfwekofJmMI?node-id=9-148), [12 event utama](https://www.figma.com/board/gVs4wVijce1YfwekofJmMI?node-id=12-148), [bulan pertama](https://www.figma.com/board/gVs4wVijce1YfwekofJmMI?node-id=12-188), [influencer](https://www.figma.com/board/gVs4wVijce1YfwekofJmMI?node-id=12-208).

Catatan sinkronisasi: Git ini memuat keputusan setelah edit FigJam terakhir. Papan masih perlu diselaraskan untuk istilah Stamina, angka indikator, Kemampuan tanpa batas, syarat Latihan 2/3 kali bulan pertama, izin rekam sekaligus posting, serta detail bulan 2 dan 3 di dokumen Git. Waktu kemunculan mini event masih belum diputuskan: pilihan pertama atau setelah jumlah minimal kegiatan; syarat bulan 1 tetap berlaku sementara.

```mermaid
flowchart TD
    intro["Intro tanpa pilihan: manager full-time mencoba climbing dan langsung berlangganan"] --> year["1 tahun: 12 bulan, masing-masing 4 minggu"]
    year --> context["Event utama dan petunjuk singkat keadaan"]
    context --> choice{"Pilihan utama minggu ini"}
    choice -->|"Kerja"| work["Uang +15; Stamina -15"]
    choice -->|"Latihan"| train["Uang -10; Stamina -20; Kemampuan +3"]
    choice -->|"Istirahat"| rest["Stamina +35"]
    work --> after["Akibat dan kesempatan mini event"]
    train --> after
    rest --> after
    after --> next["Minggu berikutnya, hingga 48 pilihan utama"]
    train -.->|"Bulan 1: Latihan kedua"| video{"Izinkan rekam dan posting?"}
    video -->|"Izinkan"| post["Video tayang dan menandai Yonas"]
    video -->|"Tolak"| nopost["Video tidak dibuat lewat tawaran ini"]
    post -.-> audience["Mini event lanjutan dan reputasi"]
    audience -.-> influencer(["Influencer"])
    train -.->|"Bulan 1: Latihan minimal 3 kali"| route["Event jalur pertama berhasil"]
    train -.->|"Terus memaksa saat kondisi buruk"| injury["Risiko cedera; pemulihan jika terjadi"]
    after -.-> phone{"Mini event telepon proyek 50 juta"}
    phone -->|"Menerima"| minister(["Pindah Jalur: menjadi menteri"])
    phone -->|"Menolak"| next
    next --> final["Kompetisi utama dan epilog"]
    final --> medal(["Juara 1 / 2 / 3 atau tanpa podium"])
    audience -.-> brand(["Brand ambassador / affiliator"])
    final -.-> fail(["Gagal sama sekali: syarat terbuka"])
```

Semua indikator tersembunyi. Uang, Stamina, Reputasi 0–100; Kemampuan mulai 0 tanpa batas maksimal. Angka kegiatan adalah nilai dasar awal yang perlu dicoba, bukan jaminan hasil pertandingan.
