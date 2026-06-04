// src/sanity/schemaTypes/pengaturan.js
export default {
  name: "pengaturan",
  title: "Pengaturan Toko",
  type: "document",
  fields: [
    {
      name: "namaToko",
      title: "Nama Toko",
      type: "string",
      description: "Nama rumah makan atau toko Anda.",
      initialValue: "Rumah Makan",
    },
    {
      name: "gambarQris",
      title: "Gambar Barcode QRIS",
      type: "image",
      description:
        "Upload gambar barcode QRIS yang akan ditampilkan pada saat pelanggan memilih metode pembayaran QRIS.",
      options: {
        hotspot: true,
      },
    },
  ],
};
