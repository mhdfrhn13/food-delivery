// src/sanity/schemaTypes/index.js
import menu from "./menu";
import promo from "./promo";
import pengaturan from "./pengaturan"; // Import skema pengaturan

export const schema = {
  types: [menu, promo, pengaturan], // Tambahkan pengaturan ke dalam array
};
