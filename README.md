This project is a web-based ordering system called **R.O.M.E. (Restaurants Orders Made Easy)**. It allows restaurants to manage their menu, categories, tables, and orders efficiently, while giving customers a smooth digital ordering experience by simply scanning a QR code at their table.

### Customer Side (Website)

Customers don’t need to sign up or log in. They simply scan a QR code on their table, which redirects them to the menu for that specific table and restaurant. The menu is displayed using data fetched from Supabase, which contains the inventory of food items linked with their restaurant.

The customer menu interface supports **filtering**:
- By **food type** (Veg, Non-Veg, Egg)
- By **category** (like Beverages, Starters, etc.)

If any item is out of stock, it is clearly marked as “Out of Stock” in both the design and the functionality. This is done through a combination of EJS templating and JavaScript. Out-of-stock items appear grayed out with a label to prevent customers from selecting them.

The layout is responsive, and all filtering is done on the client side using JavaScript.

---

### Admin Panel

The admin section is only accessible to users with admin access. Admins can manage the core aspects of the system through the following panels:

- **Dashboard**: Displays a Leaflet.js-based interactive map showing the location of all registered restaurants. This helps in quickly visualizing the geographical distribution.
  
- **Restaurants**: A list of all restaurants in the system. Admins can add, edit, or remove restaurant entries.
  
- **Tables**: Shows the tables linked to each restaurant. Each table has a QR code attached to it which is used by customers to access their menu.
  
- **Categories**: Categories of menu items such as Starters, Main Course, Desserts, etc., are managed here.
  
- **Inventory**: This section manages all menu items. Each item includes details such as name, description, price, type (veg/non-veg/egg), and stock status.

Admin pages use inline editing through `admin.js` for a smoother experience, and the admin interface is also designed to be clean and functional using custom styles from SCSS.

---

### Cross-Browser Testing

A Python script named `cross_browser_testing.py` was created to ensure that all the EJS-based pages work consistently across different browsers. This script uses **Selenium WebDriver** to automatically open and test each page using two major browsers:
- **Google Chrome**
- **Microsoft Edge**

All major customer and admin-facing pages (like `index.ejs`, `dashboard.ejs`, `inventory.ejs`, `tables.ejs`, and others) were tested. The script checks for visual layout consistency, element visibility, and that all core functionalities like filtering, form submissions, and interactivity work as expected across both browsers.

---

This project is meant to provide a complete end-to-end restaurant ordering solution that is scalable, user-friendly, and easy to manage for both customers and restaurant owners.
