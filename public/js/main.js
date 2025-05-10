/**
 * Task Management App - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI components
  initializeUI();
  
  // Set up event listeners
  setupEventListeners();
  
  // Apply page-specific enhancements
  applyPageEnhancements();
});

/**
 * Initialize UI components
 */
function initializeUI() {
  // Enable Bootstrap tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
  
  // Enable Bootstrap popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  popoverTriggerList.forEach(el => new bootstrap.Popover(el));
  
  // Add fade-in animation with sequenced timing
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50 * (index + 1));
  });
  
  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
  
  // Highlight current nav item
  highlightCurrentNavItem();
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
  // Confirm delete actions
  const deleteLinks = document.querySelectorAll('a[href*="delete"]');
  deleteLinks.forEach(link => {
    if (!link.getAttribute('onclick')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        confirmDelete(this.href);
      });
    }
  });
  
  // Task status update
  const statusSelects = document.querySelectorAll('.task-status-select');
  statusSelects.forEach(function(select) {
    select.addEventListener('change', function() {
      this.closest('form').submit();
    });
  });
  
  // Card hover effects
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Button ripple effect
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Handle filter changes
  const filterForm = document.querySelector('form[action="/tasks"]');
  if (filterForm) {
    const filterSelects = filterForm.querySelectorAll('select');
    filterSelects.forEach(select => {
      select.addEventListener('change', function() {
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.classList.add('loader');
        document.querySelector('.page-header').after(loadingIndicator);
        
        // Submit form
        filterForm.submit();
      });
    });
  }
}

/**
 * Apply page-specific enhancements
 */
function applyPageEnhancements() {
  // Format dates
  formatDates();
  
  // Add task card visual enhancements
  enhanceTaskCards();
  
  // Add responsive adjustments
  applyResponsiveAdjustments();
}

/**
 * Highlight the current navigation item based on URL
 */
function highlightCurrentNavItem() {
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if the current URL matches this link (excluding query parameters)
    if (href === currentLocation || 
        (href !== '/' && currentLocation.startsWith(href) && 
         !link.classList.contains('dropdown-toggle'))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
      
      // Also highlight the parent dropdown if this is a dropdown item
      const dropdownParent = link.closest('.dropdown');
      if (dropdownParent) {
        const dropdownToggle = dropdownParent.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
          dropdownToggle.classList.add('active');
        }
      }
    }
  });
}

/**
 * Enhanced delete confirmation
 */
function confirmDelete(url) {
  // Create modal if it doesn't exist
  if (!document.getElementById('deleteConfirmModal')) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'deleteConfirmModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <a href="#" class="btn btn-danger" id="confirmDeleteBtn">
              <i class="fas fa-trash me-1"></i> Delete
            </a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  // Set the confirm button href
  document.getElementById('confirmDeleteBtn').href = url;
  
  // Show the modal
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  deleteModal.show();
}

/**
 * Format dates to be more human-readable
 */
function formatDates() {
  const dates = document.querySelectorAll('.format-date');
  dates.forEach(dateEl => {
    const dateStr = dateEl.textContent;
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date)) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = date.toLocaleDateString(undefined, options);
      }
    }
  });
}

/**
 * Enhance task cards with visual improvements
 */
function enhanceTaskCards() {
  const taskCards = document.querySelectorAll('.task-card');
  taskCards.forEach(card => {
    // Add status classes
    const statusBadge = card.querySelector('.badge');
    if (statusBadge) {
      if (statusBadge.textContent.includes('Completed')) {
        card.classList.add('border-success', 'border-opacity-25');
      } else if (statusBadge.textContent.includes('Progress')) {
        card.classList.add('border-primary', 'border-opacity-25');
      }
    }
    
    // Add priority indicator
    const priorityBadge = card.querySelector('.card-header .badge');
    if (priorityBadge) {
      let priorityClass = '';
      if (priorityBadge.textContent.includes('High')) {
        priorityClass = 'border-danger';
      } else if (priorityBadge.textContent.includes('Medium')) {
        priorityClass = 'border-warning';
      } else {
        priorityClass = 'border-info';
      }
      card.classList.add(priorityClass, 'border-opacity-25');
    }
  });
}

/**
 * Apply responsive adjustments
 */
function applyResponsiveAdjustments() {
  // For mobile, add swipe actions to task cards
  if (window.innerWidth < 768) {
    const taskCards = document.querySelectorAll('.task-card');
    let touchStartX = 0;
    let touchEndX = 0;
    
    taskCards.forEach(card => {
      card.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, false);
      
      card.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(card);
      }, false);
    });
    
    function handleSwipe(card) {
      const swipeThreshold = 100;
      if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - show actions
        card.classList.add('show-actions');
      } else if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - hide actions
        card.classList.remove('show-actions');
      }
    }
  }
} 