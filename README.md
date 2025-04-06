This project is a web-based ordering system called R.O.M.E. (Restaurants Orders Made Easy). It allows restaurants to manage their menu, categories, tables, and orders efficiently, while giving customers a smooth digital ordering experience by simply scanning a QR code at their table.



**Customer Side (Website)**

Customers do not need to sign up or log in. They simply scan a QR code placed on their table. This QR code contains a unique table and restaurant ID, which automatically redirects them to the correct menu page. The menu is loaded using live data from Supabase, which stores the restaurant's inventory and menu information.

The customer menu supports filtering options. Users can filter by food type, such as veg, non-veg, or egg-based items. They can also filter by menu categories like beverages, starters, desserts, etc. The filtering works using client-side JavaScript for fast performance.

If a food item is out of stock, it will be clearly marked as “Out of Stock” visually. These items are shown in greyed-out style and disabled so they cannot be selected. This is achieved through EJS templating and JavaScript logic that checks the stock availability.

The entire menu and interface is designed to be mobile-responsive, as the experience is optimized for customers scanning QR codes at their tables from their smartphones.


**Admin Panel**

The admin side of the project is only accessible to authorized users with admin credentials. The admin interface contains several panels for managing different aspects of the platform.

The dashboard uses Leaflet.js to display a live map with the locations of all registered restaurants. This makes it easy for the admin to view the geographical distribution of active restaurants.

The Restaurants panel lists all restaurants in the system. The admin can add, update, or delete restaurant information.

The Tables panel displays all the tables within each restaurant. Each table has a unique QR code, which customers scan to view their menu. These QR codes are automatically generated and stored for printing.

The Categories section manages different menu sections such as starters, main course, desserts, and more.

The Inventory section manages the menu items. Admins can view and edit food items with details like name, description, price, type (veg/non-veg/egg), and stock status. Inline editing is supported using a custom JavaScript file called admin.js, making updates quick and seamless.

The admin interface uses SCSS for styling to ensure clean and uniform visuals.


**Cross-Browser Testing**

To ensure consistent design and functionality across browsers, a Python script called cross_browser_testing.py was created. This script uses Selenium WebDriver to test the major EJS pages across two popular browsers: Google Chrome and Microsoft Edge.

All important pages like the customer menu page, dashboard, restaurant list, inventory list, and others were tested. The script verifies that the layout remains consistent, all elements are visible, and features like form interactions and filters work properly across both browsers.


**Deployment**

The live version of this project is hosted on Render. The deployed website can be accessed at:

https://rome-website-customer-admin.onrender.com

It is deployed as a **web service**, not a static site, because it uses a Node.js backend with EJS templating and dynamic routing.


**Supabase Integration**

All menu, table, and inventory data is stored and fetched using Supabase. It serves as the backend database, handling all CRUD operations for both the customer and admin sections.


**Summary**

R.O.M.E. provides a seamless digital ordering experience by combining QR code-based access for customers with a powerful admin panel for restaurant management. It is responsive, dynamic, and tested for performance and consistency across browsers, making it a complete solution for modern digital dining.
