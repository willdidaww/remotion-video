# Three.js — Kristal Es Heksagonal 3D

Scene 3D interaktif yang menampilkan struktur molekul air saat membeku (ice Ih).
Pelengkap video edukatif "Kenapa es mengapung?".

## Cara menjalankan

Butuh server HTTP lokal (karena memakai ES modules + importmap):

```bash
# dari folder ini
npx serve .
# atau
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000/ice-crystal.html` di browser.

> Membuka file langsung lewat `file://` tidak bekerja karena importmap/CORS.

## Fitur

- **Drag** untuk memutar, **scroll** untuk zoom (OrbitControls).
- **Rotasi otomatis** pelan saat tidak disentuh.
- Tombol **Ikatan hidrogen** — tampilkan/sembunyikan batang ikatan antar molekul.
- Tombol **Highlight rongga** — tandai ruang kosong heksagon (inti alasan es lebih renggang → mengapung).
- Tombol **Reset kamera**.

## Teknis

- Three.js r186 via CDN (jsDelivr), tanpa build step.
- Molekul: `SphereGeometry` (O merah + 2 H putih) + `CylinderGeometry` untuk batang.
- Kisi: susunan honeycomb di bidang XZ, ditumpuk beberapa lapis ke sumbu Y.
- Ikatan hidrogen dihitung dari jarak antar molekul.
- Pencahayaan: ambient + directional (dengan bayangan) + rim light.
