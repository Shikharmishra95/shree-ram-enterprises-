// src/utils/imageLoader.js
const imagesContext = require.context('../assets/product', false, /\.(png|jpe?g|svg)$/);
export function getProductImage(filename) {
  return imagesContext('./' + filename);
}
