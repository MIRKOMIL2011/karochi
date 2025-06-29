const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    stock INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    email TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (row.count === 0) {
      const products = [
        { name: 'Laptop', description: 'High-performance laptop', price: 999.99, category: 'Electronics', stock: 10 },
        { name: 'Smartphone', description: 'Latest model smartphone', price: 699.99, category: 'Electronics', stock: 20 },
        { name: 'Headphones', description: 'Wireless headphones', price: 99.99, category: 'Accessories', stock: 50 }
      ];
      const stmt = db.prepare('INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)');
      products.forEach(p => stmt.run(p.name, p.description, p.price, p.category, p.stock));
      stmt.finalize();
    }
  });
});

app.get('/api/v1/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/v1/products/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

app.get('/api/v1/search', (req, res) => {
  const query = req.query.query || '';
  db.all('SELECT * FROM products WHERE name LIKE ? OR description LIKE ?', [`%${query}%`, `%${query}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/v1/cart/add', (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = 1;
  db.get('SELECT stock FROM products WHERE id = ?', [product_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || row.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });
    db.run('INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Added to cart', cart_id: this.lastID });
    });
  });
});

app.get('/api/v1/cart', (req, res) => {
  const user_id = 1;
  db.all(`SELECT c.id, c.quantity, p.name, p.price FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/v1/checkout', (req, res) => {
  const user_id = 1;
  db.all(`SELECT c.id, c.quantity, c.product_id, p.price FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [user_id], (err, cartItems) => {
    if (err) return res.status(500).json({ error: err.message });
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    let total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    db.run('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)', [user_id, total, 'pending'], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const order_id = this.lastID;
      const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      cartItems.forEach(item => stmt.run(order_id, item.product_id, item.quantity, item.price));
      stmt.finalize();
      db.run('DELETE FROM carts WHERE user_id = ?', [user_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Checkout successful', order_id });
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});