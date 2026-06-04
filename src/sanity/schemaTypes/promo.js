// src/sanity/schemaTypes/promo.js
export default {
  name: "promo",
  title: "Pengelola Promo / Voucher",
  type: "document",
  fields: [
    {
      name: "namaPromo",
      title: "Nama Promo",
      type: "string",
      validation: (Rule) => Rule.required(),
      placeholder: "Misal: Promo Pembukaan Toko",
    },
    {
      name: "kodeVoucher",
      title: "Kode Voucher",
      type: "string",
      description:
        "Kode unik yang dimasukkan pelanggan (Gunakan huruf kapital, tanpa spasi).",
      validation: (Rule) => Rule.required().min(3),
      placeholder: "MISAL: MAKANKENYANG",
    },
    {
      name: "tipeDiskon",
      title: "Tipe Diskon",
      type: "string",
      options: {
        list: [
          { title: "Potongan Tetap (Rp)", value: "nominal" },
          { title: "Persentase (%)", value: "persentase" },
        ],
        layout: "radio",
      },
      initialValue: "nominal",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "nilaiDiskon",
      title: "Nilai Diskon",
      type: "number",
      description:
        "Jika tipe nominal masukkan angka rupiah (cth: 10000). Jika persentase masukkan angka persen (cth: 15).",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "minimalPembelian",
      title: "Minimal Pembelian (Rp)",
      type: "number",
      description:
        "Total harga keranjang minimum agar voucher ini bisa digunakan.",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "maksimalPotongan",
      title: "Maksimal Potongan (Rp) - Opsional",
      type: "number",
      description:
        "Khusus tipe persentase, batasi batas maksimal diskon (misal diskon 10% maksimal Rp 15.000).",
    },
    {
      name: "statusAktif",
      title: "Status Promo",
      type: "boolean",
      initialValue: true,
    },
  ],
};
