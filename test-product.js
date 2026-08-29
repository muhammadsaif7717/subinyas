const http = require('http');
http.get('http://localhost:3000/api/products?slug=3d-print-rechargeable-moon-night-lamp-with-wooden-stand-pppp', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json.product.packages, null, 2));
    console.log("Product originalPrice:", json.product.originalPrice);
  });
});
