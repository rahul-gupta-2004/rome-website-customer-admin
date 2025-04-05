// Generic function for inline editing
function setupInlineEdit(tableClass) {
  // Edit button click handler
  document.querySelectorAll(`.${tableClass} .edit-btn`).forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      row.querySelectorAll('.inline-edit').forEach(input => {
        input.disabled = false;
        if (input.tagName === 'SELECT') {
          input.style.backgroundColor = '#fff';
          input.style.cursor = 'pointer';
          // Show the hidden out-of-stock select
          if (input.name === 'is_out_of_stock') {
            input.style.display = 'block';
          }
        }
      });
      this.style.display = 'none';
      row.querySelector('.save-btn').style.display = 'inline-block';
    });
  });

  // Save button click handler
  document.querySelectorAll(`.${tableClass} .save-btn`).forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = row.dataset.id;
      const endpoint = row.closest('table').dataset.endpoint;
      const data = {};

      row.querySelectorAll('.inline-edit').forEach(input => {
        data[input.name] = input.value;
        // Hide the out-of-stock select again after saving
        if (input.name === 'is_out_of_stock') {
          input.style.display = 'none';
        }
      });

      fetch(`/admin/${endpoint}/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          row.querySelectorAll('.inline-edit').forEach(input => {
            input.disabled = true;
            if (input.tagName === 'SELECT') {
              input.style.backgroundColor = 'transparent';
              input.style.cursor = 'default';
            }
          });
          this.style.display = 'none';
          row.querySelector('.edit-btn').style.display = 'inline-block';
          
          // Update row styling based on out-of-stock status
          if (data.is_out_of_stock) {
            row.classList.add('out-of-stock-row');
          } else {
            row.classList.remove('out-of-stock-row');
          }
        } else {
          showError(row, data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showError(row, 'Error saving changes');
      });
    });
  });

  // Delete button click handler
  document.querySelectorAll(`.${tableClass} .delete-btn`).forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = row.dataset.id;
      const endpoint = row.closest('table').dataset.endpoint;
      const itemName = row.querySelector('[name*="name"]')?.value || 'this item';

      if (confirm(`Are you sure you want to delete ${itemName}?`)) {
        fetch(`/admin/${endpoint}/delete/${id}`, {
          method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            row.remove();
          } else {
            showError(row, data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showError(row, 'Error deleting item');
        });
      }
    });
  });
}

function showError(row, message) {
  // Remove any existing error messages
  const existingError = row.querySelector('.error-message');
  if (existingError) existingError.remove();

  // Create and show new error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  row.appendChild(errorElement);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

// Initialize for all tables
document.addEventListener('DOMContentLoaded', function() {
  // Setup inline editing for all tables
  document.querySelectorAll('.admin-table').forEach(table => {
    if (!table.classList.contains('tables-table')) {
      setupInlineEdit(table.classList[1]); // Use the second class as identifier
    }
  });

  // Special handling for tables delete
  document.querySelectorAll('.tables-table .delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = row.dataset.id;
      const tableNumber = row.querySelector('td:nth-child(2)').textContent;

      if (confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
        fetch(`/admin/tables/delete/${id}`, {
          method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            row.remove();
          } else {
            showError(row, data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showError(row, 'Error deleting table');
        });
      }
    });
  });
});