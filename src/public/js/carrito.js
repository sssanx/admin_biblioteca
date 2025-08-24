// public/js/carrito.js

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[data-carrito]');
  const storageKey = 'carrito_etiquetas';

  const getCarrito = () => JSON.parse(localStorage.getItem(storageKey)) || [];
  const saveCarrito = (carrito) => localStorage.setItem(storageKey, JSON.stringify(carrito));

  const renderBadge = () => {
    const badge = document.querySelector('.badge');
    if (badge) {
      badge.textContent = getCarrito().length;
    }
  };

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const action = form.querySelector('[name="action"]').value;
      const ejemplar_id = form.querySelector('[name="ejemplar_id"]').value;
      const ejemplar = JSON.parse(form.dataset.item);

      let carrito = getCarrito();

      if (action === 'add') {
        if (!carrito.some(i => i.ejemplar_id === ejemplar_id)) {
          carrito.push(ejemplar);
        }
      } else if (action === 'remove') {
        carrito = carrito.filter(i => i.ejemplar_id !== ejemplar_id);
      } else if (action === 'clear') {
        carrito = [];
      }

      saveCarrito(carrito);
      renderBadge();
      window.location.reload();
    });
  });

  renderBadge();
});
