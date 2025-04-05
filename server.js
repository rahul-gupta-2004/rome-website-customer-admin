require('dotenv').config();
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const { createClient } = require('@supabase/supabase-js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configure Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Add to server.js
const NodeGeocoder = require('node-geocoder');

// Configure geocoder (using OpenStreetMap Nominatim)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// SCSS Compilation
const sass = require('sass');
const fs = require('fs');

const compileSCSS = () => {
  try {
    const scssFilePath = path.join(__dirname, 'scss', 'style.scss');
    const cssOutputPath = path.join(__dirname, 'public', 'css', 'style.css');
    const result = sass.compile(scssFilePath);
    fs.writeFileSync(cssOutputPath, result.css);
    console.log('SCSS compiled successfully');
  } catch (error) {
    console.error('Error compiling SCSS:', error);
  }
};
compileSCSS();

// Admin middleware
const checkAdmin = (req, res, next) => {
  if (req.cookies.admin === 'loggedin') {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/error?message=Please+access+via+table+URL+(/table-number/restaurant-id)');
});

app.get('/error', (req, res) => {
  res.render('error', {
    restaurant: {
      restaurant_name: process.env.RESTAURANT_NAME || 'Our Restaurant'
    },
    message: req.query.message || 'An unexpected error occurred'
  });
});

// ADMIN ROUTES
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.cookie('admin', 'loggedin', { maxAge: 900000, httpOnly: true });
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { error: 'Invalid credentials' });
  }
});

app.get('/admin/logout', (req, res) => {
  res.clearCookie('admin');
  res.redirect('/admin/login');
});

app.get('/admin', checkAdmin, (req, res) => {
  res.redirect('/admin/dashboard');
});

// Dashboard with stats
app.get('/admin/dashboard', checkAdmin, async (req, res) => {
  try {
    const [
      { count: restaurantsCount },
      { count: tablesCount },
      { count: categoriesCount },
      { count: inventoryCount }
    ] = await Promise.all([
      supabase.from('restaurants').select('*', { count: 'exact' }),
      supabase.from('tables').select('*', { count: 'exact' }),
      supabase.from('categories').select('*', { count: 'exact' }),
      supabase.from('inventory').select('*', { count: 'exact' })
    ]);

    res.render('admin/dashboard', {
      stats: {
        restaurants: restaurantsCount || 0,
        tables: tablesCount || 0,
        categories: categoriesCount || 0,
        inventory: inventoryCount || 0
      },
      error: null
    });
  } catch (error) {
    res.render('admin/dashboard', {
      stats: {
        restaurants: 0,
        tables: 0,
        categories: 0,
        inventory: 0
      },
      error: error.message
    });
  }
});

// Updated API route
app.get('/api/restaurants', checkAdmin, async (req, res) => {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('restaurant_id, restaurant_name, address');
    
    if (error) throw error;
    
    // Geocode addresses
    const restaurantsWithCoords = await Promise.all(restaurants.map(async restaurant => {
      try {
        const geoResult = await geocoder.geocode(restaurant.address);
        if (geoResult && geoResult[0]) {
          return {
            ...restaurant,
            coordinates: {
              lat: geoResult[0].latitude,
              lng: geoResult[0].longitude,
              formatted: restaurant.address
            }
          };
        }
        return restaurant; // Return original if geocoding fails
      } catch (e) {
        console.error(`Geocoding failed for ${restaurant.address}`, e);
        return restaurant;
      }
    }));

    res.json(restaurantsWithCoords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RESTAURANTS SECTION
app.get('/admin/restaurants', checkAdmin, async (req, res) => {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    res.render('admin/restaurants', { 
      restaurants: restaurants || [],
      error: null
    });
  } catch (error) {
    res.render('admin/restaurants', { 
      restaurants: [],
      error: error.message 
    });
  }
});

app.post('/admin/restaurants', checkAdmin, async (req, res) => {
  try {
    const { restaurant_name, address, contact, email, password } = req.body;
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ 
        restaurant_name, 
        address,
        contact, 
        email,
        password
      }]);
    
    if (error) throw error;
    res.redirect('/admin/restaurants');
  } catch (error) {
    res.render('admin/restaurants', { 
      restaurants: [],
      error: error.message 
    });
  }
});

app.post('/admin/restaurants/update/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurant_name, address, contact, email } = req.body;
    const { error } = await supabase
      .from('restaurants')
      .update({ restaurant_name, address, contact, email })
      .eq('restaurant_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/admin/restaurants/delete/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('restaurant_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// TABLES SECTION
app.get('/admin/tables', checkAdmin, async (req, res) => {
  try {
    const [
      { data: tables, error: tablesError },
      { data: restaurants, error: restaurantsError }
    ] = await Promise.all([
      supabase.from('tables').select('*'),
      supabase.from('restaurants').select('*')
    ]);

    if (tablesError) throw tablesError;
    if (restaurantsError) throw restaurantsError;

    res.render('admin/tables', { 
      tables: tables || [],
      restaurants: restaurants || [],
      error: null
    });
  } catch (error) {
    res.render('admin/tables', { 
      tables: [],
      restaurants: [],
      error: error.message 
    });
  }
});

app.post('/admin/tables', checkAdmin, async (req, res) => {
  try {
    const { table_number, restaurant_id } = req.body;
    const { data, error } = await supabase
      .from('tables')
      .insert([{ table_number, restaurant_id }]);
    
    if (error) throw error;
    res.redirect('/admin/tables');
  } catch (error) {
    res.render('admin/tables', { 
      tables: [],
      restaurants: [],
      error: error.message 
    });
  }
});

app.post('/admin/tables/update/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, restaurant_id } = req.body;
    const { error } = await supabase
      .from('tables')
      .update({ table_number, restaurant_id })
      .eq('table_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/admin/tables/delete/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('table_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CATEGORIES SECTION
app.get('/admin/categories', checkAdmin, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    res.render('admin/categories', { 
      categories: categories || [],
      error: null
    });
  } catch (error) {
    res.render('admin/categories', { 
      categories: [],
      error: error.message 
    });
  }
});

app.post('/admin/categories', checkAdmin, async (req, res) => {
  try {
    const { category_name } = req.body;
    const { data, error } = await supabase
      .from('categories')
      .insert([{ category_name }]);
    
    if (error) throw error;
    res.redirect('/admin/categories');
  } catch (error) {
    res.render('admin/categories', { 
      categories: [],
      error: error.message 
    });
  }
});

app.post('/admin/categories/update/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    const { error } = await supabase
      .from('categories')
      .update({ category_name })
      .eq('category_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/admin/categories/delete/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if any inventory items use this category
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('category_id', id);

    if (inventoryError) throw inventoryError;
    if (inventoryItems && inventoryItems.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete category - it has associated menu items' 
      });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// INVENTORY SECTION - Updated with proper data handling
app.get('/admin/inventory', checkAdmin, async (req, res) => {
  try {
    const [
      { data: inventory, error: inventoryError },
      { data: categories, error: categoriesError },
      { data: restaurants, error: restaurantsError }
    ] = await Promise.all([
      supabase.from('inventory').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('restaurants').select('*')
    ]);

    if (inventoryError) throw inventoryError;
    if (categoriesError) throw categoriesError;
    if (restaurantsError) throw restaurantsError;

    res.render('admin/inventory', { 
      inventory: inventory || [],
      categories: categories || [],
      restaurants: restaurants || [],
      error: null
    });
  } catch (error) {
    res.render('admin/inventory', { 
      inventory: [],
      categories: [],
      restaurants: [],
      error: error.message 
    });
  }
});

app.post('/admin/inventory', checkAdmin, async (req, res) => {
  try {
    const { item_name, item_desc, price, category_id, is_veg, restaurant_id } = req.body;
    const is_out_of_stock = req.body.is_out_of_stock || false; // Default to false

    // Validate data types
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      throw new Error('Price must be a valid number');
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert([{ 
        item_name, 
        item_desc, 
        price: priceValue, 
        category_id, 
        is_veg, 
        restaurant_id,
        is_out_of_stock
      }]);
    
    if (error) throw error;
    res.redirect('/admin/inventory');
  } catch (error) {
    res.render('admin/inventory', { 
      inventory: [],
      categories: [],
      restaurants: [],
      error: error.message 
    });
  }
});

app.post('/admin/inventory/update/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, item_desc, price, category_id, is_veg, restaurant_id, is_out_of_stock } = req.body;
    
    // Validate data types
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      return res.status(400).json({ success: false, error: 'Price must be a valid number' });
    }

    const { error } = await supabase
      .from('inventory')
      .update({ 
        item_name, 
        item_desc, 
        price: priceValue, 
        category_id, 
        is_veg, 
        restaurant_id,
        is_out_of_stock
      })
      .eq('item_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/admin/inventory/delete/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('item_id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Table view route
app.get('/:table/:restaurantId', async (req, res) => {
  const { table, restaurantId } = req.params;
  
  try {
    // 1. Fetch restaurant data
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('restaurant_id, restaurant_name, contact, email, address')
      .eq('restaurant_id', restaurantId)
      .single();

    if (restaurantError) throw restaurantError;
    if (!restaurant) throw new Error('Restaurant not found');

    // 2. Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('category_id, category_name');
    
    if (categoriesError) throw categoriesError;

    // 3. Fetch inventory items - ADD is_out_of_stock TO THE SELECT
    const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .select(`
      item_id,
      item_name,
      item_desc,
      price,
      is_veg,
      category_id,
      is_out_of_stock
    `)
    .eq('restaurant_id', restaurantId);
    
    if (inventoryError) throw inventoryError;

    // 4. Render page with all data
    res.render('index', {
      tableNumber: table,
      restaurant: {
        ...restaurant,
        logo_url: '/images/logo-1.png'
      },
      categories: categories || [],
      inventory: inventory || []
    });

  } catch (error) {
    console.error('Error loading restaurant data:', error.message);
    res.redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Error handlers
app.use((req, res) => {
  res.status(404).redirect('/error?message=Page+not+found');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).redirect('/error?message=Server+error');
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Access table view at: http://localhost:${port}/4/71b22e97-d323-44f1-bf79-e3ca48e434eb`);
});