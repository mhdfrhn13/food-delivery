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
        "Upload gambar barcode QRIS untuk metode pembayaran digital.",
      options: { hotspot: true },
    },
    // --- FIELD BARU DI BAWAH INI ---
    {
      name: "nomorWhatsapp",
      title: "Nomor WhatsApp Admin",
      type: "string",
      description:
        "Gunakan awalan kode negara tanpa tanda (+) atau angka 0. Contoh: 6285365968845. Nomor ini akan menerima pesan checkout.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "alamatToko",
      title: "Alamat Toko Lengkap",
      type: "text",
      description: "Alamat yang akan ditampilkan di halaman Kontak.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "jamOperasional",
      title: "Jam Operasional",
      type: "string",
      description: "Contoh: Setiap Hari: 09:00 - 22:00 WIB",
      validation: (Rule) => Rule.required(),
    },
  ],
};
