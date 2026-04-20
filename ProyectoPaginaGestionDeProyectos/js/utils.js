window.utils = {
  refreshIcons: () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  formatCurrency: (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  },

  getBadgeClass: (level) => {
    if (level === 'Alta') return 'badge badge-high';
    if (level === 'Media') return 'badge badge-medium';
    if (level === 'Baja') return 'badge badge-low';
    return 'badge';
  },
  
  closeModals: () => {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }
};
