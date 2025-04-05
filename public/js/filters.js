document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const foodFilters = document.querySelectorAll('.food-filter');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuItems = document.querySelectorAll('.menu-item');
    const menuSections = document.querySelectorAll('.menu-section');
  
    // Current active filters
    let activeFoodFilter = 'all';
    let activeCategory = null;
  
    // Initialize - show all items
    function initialize() {
      applyFilters();
    }
  
    // Food filter click handler
    function handleFoodFilterClick(filter) {
      activeFoodFilter = filter.getAttribute('data-filter');
      
      // Update active filter
      foodFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      
      applyFilters();
    }
  
    // Category tab click handler
    function handleCategoryTabClick(tab) {
      const categoryId = tab.getAttribute('data-category');
      activeCategory = categoryId;
      
      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      applyFilters();
    }
  
    // Apply both filters
    function applyFilters() {
      // First hide all items
      menuItems.forEach(item => {
        item.style.display = 'none';
      });
  
      // Then show items that match both filters
      menuItems.forEach(item => {
        const matchesFoodType = activeFoodFilter === 'all' || 
                              item.classList.contains(activeFoodFilter);
        const matchesCategory = !activeCategory || 
                              item.getAttribute('data-category') === activeCategory;
  
        if (matchesFoodType && matchesCategory) {
          item.style.display = 'flex';
        }
      });
  
      // Show/hide entire sections based on visible items
      menuSections.forEach(section => {
        const categoryId = section.id.replace('category-', '');
        const hasVisibleItems = Array.from(section.querySelectorAll('.menu-item'))
          .some(item => item.style.display === 'flex');
        
        section.style.display = hasVisibleItems ? 'block' : 'none';
      });
  
      // Scroll to first visible section if category not specified
      if (!activeCategory) {
        const firstVisible = document.querySelector('.menu-section[style="display: block;"]');
        if (firstVisible) {
          firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  
    // Event Listeners
    foodFilters.forEach(filter => {
      filter.addEventListener('click', () => handleFoodFilterClick(filter));
    });
  
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => handleCategoryTabClick(tab));
    });
  
    // Initialize
    initialize();
  });