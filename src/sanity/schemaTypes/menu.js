// src/sanity/schemaTypes/menu.js
export default {
  name: "menu",
  title: "Menu Makanan",
  type: "document",
  fields: [
    {
      name: "nama",
      title: "Nama Menu",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "kategori",
      title: "Kategori",
      type: "string",
      options: {
        list: ["Makanan", "Minuman", "Cemilan"],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "deskripsi",
      title: "Deskripsi Singkat",
      type: "text",
    },
    {
      name: "harga",
      title: "Harga (Rp)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "gambar",
      title: "Foto Makanan",
      type: "image",
      options: {
        hotspot: true, // Memungkinkan admin memotong/fokus pada area gambar tertentu
      },
    },
  ],
};
