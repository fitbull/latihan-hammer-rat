# Latihan Interaktif Bab 2

Permainan Phaser.js berdasarkan storyboard **المُذَكَّرُ وَالمُؤَنَّثُ**.

## Menjalankan projek

```bash
npm install
npm run dev
```

Buka URL yang dipaparkan oleh Vite. Permainan mempunyai dua pusingan 30 saat,
tiga nyawa bagi setiap pusingan, maklum balas betul/salah, skor 5 bintang setiap
pusingan, bunyi ringkas, serta paparan keputusan dan pilihan ulang/main menu.
Jawapan salah mengurangkan satu nyawa. Pusingan tamat apabila lima jawapan betul
dicapai, masa habis, atau semua nyawa hilang. Pusingan pertama tetap diteruskan
ke pusingan kedua walaupun sasaran lima jawapan belum dicapai.

## Mengganti aset

Aset visual berada di `public/assets/`. Nama fail boleh dikekalkan supaya aset
baharu terus digunakan tanpa perubahan kod:

- `cover.png` — latar halaman muka hadapan
- `garden.jpg` — latar permainan
- `rat-hole.png` — lubang tikus lutsinar yang digunakan pada 10 posisi permainan
- `pointer.png` — penunjuk ungu untuk menu dan skrin keputusan
- `hammer-cursor.png` — penunjuk tukul semasa permainan
- `mouse.png` — watak tikus lutsinar
- `wrong.png` — penanda jawapan salah
- `correct.png` — penanda jawapan betul

Penanda betul atau salah muncul di atas dialog perkataan selepas tikus dipukul.
