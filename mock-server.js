/**
 * mock-server.js — Laptop & Peripherals mock REST API
 * ─────────────────────────────────────────────────────
 * Run:  node mock-server.js
 * Port: 3001
 *
 * Endpoints:
 *   GET  /api/collections
 *   GET  /api/collections/:id/products
 *   GET  /api/products/search?q=<query>
 *   GET  /api/products/:id
 *   POST /api/checkout
 */

const http = require('http');
const url  = require('url');

const PORT = 3001;

// ── Seed Data ──────────────────────────────────────────────────────────────

const collections = [
  { id: 'col-laptops',     title: 'Laptops',            handle: 'laptops',     image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
  { id: 'col-desktops',    title: 'Desktops',           handle: 'desktops',    image_url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400' },
  { id: 'col-monitors',    title: 'Monitors',           handle: 'monitors',    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a573d93107?w=400' },
  { id: 'col-keyboards',   title: 'Keyboards & Mice',   handle: 'keyboards',   image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400' },
  { id: 'col-headsets',    title: 'Headsets & Audio',   handle: 'headsets',    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
  { id: 'col-storage',     title: 'Storage & SSDs',     handle: 'storage',     image_url: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400' },
  { id: 'col-networking',  title: 'Networking',         handle: 'networking',  image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400' },
  { id: 'col-accessories', title: 'Accessories',        handle: 'accessories', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
];

const products = [
  // ── Laptops ──────────────────────────────────────────────────────────────
  {
    id: 'prod-001', collection_id: 'col-laptops',
    title: 'Dell XPS 15 (2024)', handle: 'dell-xps-15-2024',
    description: 'The ultimate 15-inch laptop with OLED display, Intel Core Ultra 9, and NVIDIA RTX 4060. Perfect for creators and power users.',
    vendor: 'Dell', product_type: 'Laptop',
    tags: ['ultrabook', 'oled', 'intel', 'nvidia', 'creator'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600', alt_text: 'Dell XPS 15' },
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', alt_text: 'Dell XPS 15 open' },
    ],
    variants: [
      { id: 'var-001a', title: '16GB RAM / 512GB SSD', available_for_sale: true, quantity_available: 12, price: 1499.99, currency_code: 'USD', selected_options: [{ name: 'RAM', value: '16GB' }, { name: 'Storage', value: '512GB SSD' }] },
      { id: 'var-001b', title: '32GB RAM / 1TB SSD',   available_for_sale: true, quantity_available: 7,  price: 1899.99, currency_code: 'USD', selected_options: [{ name: 'RAM', value: '32GB' }, { name: 'Storage', value: '1TB SSD' }] },
    ],
    min_price: 1499.99, max_price: 1899.99, currency_code: 'USD',
    options: [{ id: 'opt-001a', name: 'RAM', values: ['16GB', '32GB'] }, { id: 'opt-001b', name: 'Storage', values: ['512GB SSD', '1TB SSD'] }],
  },
  {
    id: 'prod-002', collection_id: 'col-laptops',
    title: 'MacBook Pro 14" M3 Pro', handle: 'macbook-pro-14-m3-pro',
    description: 'Apple Silicon at its finest. M3 Pro chip, Liquid Retina XDR display, and up to 22 hours battery life.',
    vendor: 'Apple', product_type: 'Laptop',
    tags: ['apple', 'macos', 'm3', 'pro', 'creator'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', alt_text: 'MacBook Pro' },
    ],
    variants: [
      { id: 'var-002a', title: '18GB / 512GB', available_for_sale: true, quantity_available: 5, price: 1999.00, currency_code: 'USD', selected_options: [{ name: 'Memory', value: '18GB' }, { name: 'Storage', value: '512GB' }] },
      { id: 'var-002b', title: '36GB / 1TB',   available_for_sale: true, quantity_available: 3, price: 2499.00, currency_code: 'USD', selected_options: [{ name: 'Memory', value: '36GB' }, { name: 'Storage', value: '1TB' }] },
    ],
    min_price: 1999.00, max_price: 2499.00, currency_code: 'USD',
    options: [{ id: 'opt-002a', name: 'Memory', values: ['18GB', '36GB'] }, { id: 'opt-002b', name: 'Storage', values: ['512GB', '1TB'] }],
  },
  {
    id: 'prod-003', collection_id: 'col-laptops',
    title: 'ASUS ROG Zephyrus G14', handle: 'asus-rog-zephyrus-g14',
    description: 'Compact gaming powerhouse with AMD Ryzen 9, RTX 4060, 165Hz QHD display, and AniMe Matrix LED lid.',
    vendor: 'ASUS', product_type: 'Laptop',
    tags: ['gaming', 'amd', 'nvidia', 'rog', 'compact'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=600', alt_text: 'ASUS ROG Zephyrus' },
    ],
    variants: [
      { id: 'var-003a', title: '16GB / 512GB', available_for_sale: true, quantity_available: 8, price: 1299.99, currency_code: 'USD', selected_options: [{ name: 'RAM', value: '16GB' }, { name: 'Storage', value: '512GB' }] },
    ],
    min_price: 1299.99, max_price: 1299.99, currency_code: 'USD',
    options: [{ id: 'opt-003a', name: 'RAM', values: ['16GB'] }],
  },
  {
    id: 'prod-004', collection_id: 'col-laptops',
    title: 'Lenovo ThinkPad X1 Carbon Gen 12', handle: 'thinkpad-x1-carbon-gen12',
    description: 'The business ultrabook benchmark. Under 1kg, Intel vPro, MIL-SPEC durability.',
    vendor: 'Lenovo', product_type: 'Laptop',
    tags: ['business', 'intel', 'ultrabook', 'thinkpad', 'lightweight'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', alt_text: 'ThinkPad X1 Carbon' },
    ],
    variants: [
      { id: 'var-004a', title: '16GB / 512GB', available_for_sale: true, quantity_available: 10, price: 1349.00, currency_code: 'USD', selected_options: [] },
      { id: 'var-004b', title: '32GB / 1TB',   available_for_sale: false, quantity_available: 0, price: 1749.00, currency_code: 'USD', selected_options: [] },
    ],
    min_price: 1349.00, max_price: 1749.00, currency_code: 'USD',
    options: [],
  },

  // ── Monitors ─────────────────────────────────────────────────────────────
  {
    id: 'prod-005', collection_id: 'col-monitors',
    title: 'LG UltraGear 27GR95QE OLED', handle: 'lg-ultragear-27-oled',
    description: '27" QHD OLED gaming monitor, 240Hz, 0.03ms response time, NVIDIA G-Sync Compatible.',
    vendor: 'LG', product_type: 'Monitor',
    tags: ['oled', 'gaming', '240hz', 'qhd', 'g-sync'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1527443224154-c4a573d93107?w=600', alt_text: 'LG OLED Monitor' },
    ],
    variants: [
      { id: 'var-005a', title: 'Default', available_for_sale: true, quantity_available: 15, price: 799.99, currency_code: 'USD', selected_options: [] },
    ],
    min_price: 799.99, max_price: 799.99, currency_code: 'USD',
    options: [],
  },
  {
    id: 'prod-006', collection_id: 'col-monitors',
    title: 'Samsung Odyssey G9 49"', handle: 'samsung-odyssey-g9-49',
    description: 'Dual QHD super-ultrawide curved monitor, 240Hz, 1ms, Mini LED. The ultimate setup centerpiece.',
    vendor: 'Samsung', product_type: 'Monitor',
    tags: ['ultrawide', 'curved', 'gaming', '240hz', 'mini-led'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=600', alt_text: 'Samsung Odyssey G9' },
    ],
    variants: [
      { id: 'var-006a', title: 'Default', available_for_sale: true, quantity_available: 6, price: 1299.99, currency_code: 'USD', selected_options: [] },
    ],
    min_price: 1299.99, max_price: 1299.99, currency_code: 'USD',
    options: [],
  },

  // ── Keyboards & Mice ─────────────────────────────────────────────────────
  {
    id: 'prod-007', collection_id: 'col-keyboards',
    title: 'Keychron Q1 Pro QMK', handle: 'keychron-q1-pro-qmk',
    description: 'Premium 75% gasket-mounted mechanical keyboard with QMK/VIA support, hot-swappable switches.',
    vendor: 'Keychron', product_type: 'Keyboard',
    tags: ['mechanical', 'qmk', 'hot-swap', 'gasket-mount', 'wireless'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600', alt_text: 'Keychron Q1 Pro' },
    ],
    variants: [
      { id: 'var-007a', title: 'Brown Switches', available_for_sale: true, quantity_available: 20, price: 199.99, currency_code: 'USD', selected_options: [{ name: 'Switch', value: 'Brown' }] },
      { id: 'var-007b', title: 'Red Switches',   available_for_sale: true, quantity_available: 18, price: 199.99, currency_code: 'USD', selected_options: [{ name: 'Switch', value: 'Red' }] },
      { id: 'var-007c', title: 'Blue Switches',  available_for_sale: true, quantity_available: 14, price: 199.99, currency_code: 'USD', selected_options: [{ name: 'Switch', value: 'Blue' }] },
    ],
    min_price: 199.99, max_price: 199.99, currency_code: 'USD',
    options: [{ id: 'opt-007a', name: 'Switch', values: ['Brown', 'Red', 'Blue'] }],
  },
  {
    id: 'prod-008', collection_id: 'col-keyboards',
    title: 'Logitech MX Master 3S', handle: 'logitech-mx-master-3s',
    description: 'The best productivity mouse. 8K DPI, quiet clicks, MagSpeed scroll wheel, multi-device Bluetooth.',
    vendor: 'Logitech', product_type: 'Mouse',
    tags: ['wireless', 'ergonomic', 'bluetooth', 'productivity'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', alt_text: 'Logitech MX Master 3S' },
    ],
    variants: [
      { id: 'var-008a', title: 'Graphite', available_for_sale: true, quantity_available: 25, price: 99.99, currency_code: 'USD', selected_options: [{ name: 'Color', value: 'Graphite' }] },
      { id: 'var-008b', title: 'Pale Grey', available_for_sale: true, quantity_available: 20, price: 99.99, currency_code: 'USD', selected_options: [{ name: 'Color', value: 'Pale Grey' }] },
    ],
    min_price: 99.99, max_price: 99.99, currency_code: 'USD',
    options: [{ id: 'opt-008a', name: 'Color', values: ['Graphite', 'Pale Grey'] }],
  },

  // ── Headsets ─────────────────────────────────────────────────────────────
  {
    id: 'prod-009', collection_id: 'col-headsets',
    title: 'Sony WH-1000XM5', handle: 'sony-wh-1000xm5',
    description: 'Industry-leading noise cancellation, 30hr battery, multipoint Bluetooth connection.',
    vendor: 'Sony', product_type: 'Headphones',
    tags: ['noise-cancelling', 'wireless', 'bluetooth', 'premium'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', alt_text: 'Sony WH-1000XM5' },
    ],
    variants: [
      { id: 'var-009a', title: 'Black',  available_for_sale: true, quantity_available: 30, price: 349.99, currency_code: 'USD', selected_options: [{ name: 'Color', value: 'Black' }] },
      { id: 'var-009b', title: 'Silver', available_for_sale: true, quantity_available: 22, price: 349.99, currency_code: 'USD', selected_options: [{ name: 'Color', value: 'Silver' }] },
    ],
    min_price: 349.99, max_price: 349.99, currency_code: 'USD',
    options: [{ id: 'opt-009a', name: 'Color', values: ['Black', 'Silver'] }],
  },
  {
    id: 'prod-010', collection_id: 'col-headsets',
    title: 'SteelSeries Arctis Nova Pro Wireless', handle: 'steelseries-arctis-nova-pro',
    description: 'Premium gaming headset with active noise cancellation, dual wireless (2.4GHz + Bluetooth), hot-swap battery.',
    vendor: 'SteelSeries', product_type: 'Gaming Headset',
    tags: ['gaming', 'wireless', 'noise-cancelling', 'anc'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', alt_text: 'SteelSeries Arctis Nova Pro' },
    ],
    variants: [
      { id: 'var-010a', title: 'Default', available_for_sale: true, quantity_available: 12, price: 349.99, currency_code: 'USD', selected_options: [] },
    ],
    min_price: 349.99, max_price: 349.99, currency_code: 'USD',
    options: [],
  },

  // ── Storage ───────────────────────────────────────────────────────────────
  {
    id: 'prod-011', collection_id: 'col-storage',
    title: 'Samsung 990 Pro NVMe SSD', handle: 'samsung-990-pro-nvme',
    description: 'PCIe 4.0 NVMe SSD, up to 7450MB/s read speeds. Perfect for gaming and professional workloads.',
    vendor: 'Samsung', product_type: 'SSD',
    tags: ['nvme', 'pcie4', 'ssd', 'fast', 'storage'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600', alt_text: 'Samsung 990 Pro SSD' },
    ],
    variants: [
      { id: 'var-011a', title: '1TB', available_for_sale: true, quantity_available: 40, price: 89.99,  currency_code: 'USD', selected_options: [{ name: 'Capacity', value: '1TB' }] },
      { id: 'var-011b', title: '2TB', available_for_sale: true, quantity_available: 30, price: 159.99, currency_code: 'USD', selected_options: [{ name: 'Capacity', value: '2TB' }] },
      { id: 'var-011c', title: '4TB', available_for_sale: true, quantity_available: 15, price: 299.99, currency_code: 'USD', selected_options: [{ name: 'Capacity', value: '4TB' }] },
    ],
    min_price: 89.99, max_price: 299.99, currency_code: 'USD',
    options: [{ id: 'opt-011a', name: 'Capacity', values: ['1TB', '2TB', '4TB'] }],
  },

  // ── Accessories ───────────────────────────────────────────────────────────
  {
    id: 'prod-012', collection_id: 'col-accessories',
    title: 'Anker 727 Charging Station', handle: 'anker-727-charging-station',
    description: '100W desktop charging station with 4 USB-C and 2 USB-A ports. Charge up to 6 devices simultaneously.',
    vendor: 'Anker', product_type: 'Accessory',
    tags: ['charging', 'usb-c', '100w', 'multi-port', 'desk'],
    available_for_sale: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', alt_text: 'Anker Charging Station' },
    ],
    variants: [
      { id: 'var-012a', title: 'Default', available_for_sale: true, quantity_available: 50, price: 79.99, currency_code: 'USD', selected_options: [] },
    ],
    min_price: 79.99, max_price: 79.99, currency_code: 'USD',
    options: [],
  },
];

// ── Router ────────────────────────────────────────────────────────────────

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function bodyJSON(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query    = parsed.query;

  // ── CORS preflight ────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') return send(res, 204, {});

  // ── GET /api/collections ──────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/collections') {
    return send(res, 200, { collections });
  }

  // ── GET /api/collections/:id/products ────────────────────────────────
  const collMatch = pathname.match(/^\/api\/collections\/([^/]+)\/products$/);
  if (req.method === 'GET' && collMatch) {
    const collId     = collMatch[1];
    const collection = collections.find(c => c.id === collId);
    if (!collection) return send(res, 404, { error: 'Collection not found' });
    const collProducts = products.filter(p => p.collection_id === collId);
    return send(res, 200, { collection: { ...collection, products: collProducts } });
  }

  // ── GET /api/products/search?q=<query> ────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/products/search') {
    const q = (query.q || '').toLowerCase();
    const results = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
    return send(res, 200, { products: results });
  }

  // ── GET /api/products/:id ─────────────────────────────────────────────
  const prodMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (req.method === 'GET' && prodMatch) {
    const product = products.find(p => p.id === prodMatch[1]);
    if (!product) return send(res, 404, { error: 'Product not found' });
    return send(res, 200, { product });
  }

  // ── POST /api/checkout ────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/checkout') {
    const body = await bodyJSON(req);
    // In production: create a Stripe Checkout session here and return the URL
    // For now, just simulate a successful order creation
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    return send(res, 200, {
      order_id: orderId,
      checkout_url: `/order-confirmation/${orderId}`, // swap for Stripe URL in prod
    });
  }

  return send(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`\n✅  Mock API server running on http://localhost:${PORT}`);
  console.log(`   Collections : GET  /api/collections`);
  console.log(`   By category : GET  /api/collections/:id/products`);
  console.log(`   Search      : GET  /api/products/search?q=<query>`);
  console.log(`   Product     : GET  /api/products/:id`);
  console.log(`   Checkout    : POST /api/checkout\n`);
});
