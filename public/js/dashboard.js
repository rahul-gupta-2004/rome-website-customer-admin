document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map centered on Mumbai
    const map = L.map('restaurant-map').setView([19.0760, 72.8777], 12); // Mumbai coordinates and zoom level
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch and plot restaurants
    fetch('/api/restaurants')
        .then(response => response.json())
        .then(restaurants => {
            const markers = [];
            let hasValidLocations = false;
            
            restaurants.forEach(restaurant => {
                if (restaurant.coordinates && restaurant.coordinates.lat && restaurant.coordinates.lng) {
                    hasValidLocations = true;
                    const marker = L.marker([restaurant.coordinates.lat, restaurant.coordinates.lng])
                        .addTo(map)
                        .bindPopup(`<b>${restaurant.restaurant_name}</b><br>${restaurant.coordinates.formatted}`);
                    markers.push(marker);
                }
            });

            if (markers.length > 0) {
                // Create a feature group containing all markers
                const group = new L.featureGroup(markers);
                // Zoom the map to fit all markers
                map.fitBounds(group.getBounds().pad(0.1));
                
                // If all markers are in Mumbai area, zoom in closer
                const mumbaiBounds = L.latLngBounds(
                    L.latLng(18.8, 72.7), // SW corner
                    L.latLng(19.3, 73.2)  // NE corner
                );
                
                if (group.getBounds().intersects(mumbaiBounds)) {
                    map.setZoom(12); // Set a comfortable zoom level for Mumbai
                }
            } else if (!hasValidLocations) {
                alert('Could not determine locations for any restaurants. Showing Mumbai area.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load restaurant locations. Showing Mumbai area.');
        });
});