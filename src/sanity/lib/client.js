// src/sanity/lib/client.js
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

// Konfigurasi ini biasanya sudah ada jika menggunakan otomatisasi langkah 1
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false, // Gunakan false agar admin langsung melihat perubahan setelah update menu
});

// Fungsi untuk merender URL gambar dari Sanity
const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}
