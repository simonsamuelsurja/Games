# Peta cerita awal

Ini rangkuman visual untuk melanjutkan penulisan, bukan seluruh percabangan final. Garis putus-putus menunjukkan hubungan atau akibat yang masih perlu digarap. Jalur cedera tidak berarti setiap pemain wajib mengalaminya; penempatannya belum dikunci.

```mermaid
flowchart TD
    awal["Yonas sudah bekerja"] --> coba["Mencoba climbing bersama teman"]
    coba --> langganan["Langsung berlangganan bulanan"]
    langganan --> mimpi["Jatuh cinta dan ingin profesional"]
    mimpi --> waktu{"Membagi waktu"}

    waktu -->|"Latihan"| jalur["Jalur V1–V15 berganti bulanan"]
    waktu -->|"Pekerjaan"| kerja["Karier dan penghasilan"]
    waktu -->|"Membuat konten"| konten["Membagikan perjalanan climbing"]

    jalur --> tantangan["Kesulitan jalur dan tantangan kecepatan"]
    tantangan --> lelah{"Lelah setelah lembur atau latihan"}
    lelah -->|"Rest day"| istirahat["Istirahat dan memulihkan tenaga"]
    lelah -->|"Tetap latihan"| memaksa["Kelelahan dapat menumpuk"]
    memaksa -.-> cedera["Cedera: jeda climbing sementara"]
    cedera --> pulih["Masa pemulihan"]

    kerja -.-> luarNegeri["Kesempatan kerja ke luar negeri"]
    luarNegeri -.-> terbuka["Keputusan dan akibat belum ditulis"]

    istirahat --> perjalanan["Perjalanan menuju tahun kedua"]
    pulih --> perjalanan
    kerja --> perjalanan
    konten --> perjalanan
    perjalanan --> arah{"Ke mana Yonas melangkah?"}

    arah -->|"Mengejar kompetisi"| persiapan["Persiapan pertandingan"]
    persiapan --> telepon{"Teman menawarkan proyek"}
    telepon -->|"Tetap latihan"| kompetisi["Hari kompetisi"]
    telepon -->|"Modal 50 juta; return 100 juta per bulan"| menteri(["RAHASIA: Pindah Jalur — Menjadi menteri"])

    kompetisi --> podium(["Juara 1 / 2 / 3"])
    kompetisi --> tanpaPodium(["Tidak mendapat podium"])
    arah -.-> reputasi["Mengembangkan konten dan reputasi"]
    reputasi -.-> ambassador(["Brand ambassador"])
    reputasi -.-> affiliator(["Affiliator climbing"])
    arah -.-> gagal(["Gagal sama sekali — makna belum ditentukan"])

    classDef choice fill:#fff0c2,stroke:#bd8c22
    classDef result fill:#d9f3de,stroke:#599365
    classDef secret fill:#eadcff,stroke:#9566c0
    classDef unresolved fill:#eeeeee,stroke:#999999
    class waktu,lelah,arah,telepon choice
    class podium,tanpaPodium,ambassador,affiliator result
    class menteri secret
    class terbuka,gagal unresolved
```

## Catatan FigJam

Pengguna meminta papan visual di FigJam melalui Figma. Pemanggilan pembuatan diagram sebelumnya meminta pemilihan tim/organisasi dan belum menghasilkan tautan papan yang terkonfirmasi. Tidak ada URL FigJam yang sudah disimpan. Diagram Mermaid ini menyimpan isi peta agar tidak bergantung pada langkah tersebut.
