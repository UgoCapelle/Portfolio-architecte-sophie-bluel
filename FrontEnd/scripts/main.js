document.addEventListener('DOMContentLoaded', () => {
    const adminBanner = document.getElementById('admin-banner');
    const openModalButton = document.getElementById('openModalButton');
    const loginLink = document.getElementById('loginLink');

    function updateAdminElementsVisibility() {
        const token = localStorage.getItem('token');

        if (token) {
            // Token is present, show the admin elements
            adminBanner.style.display = 'block';
            openModalButton.style.display = 'inline';
            loginLink.textContent = 'logout';
            loginLink.classList.add('lilogin');
            loginLink.href = '#';
            loginLink.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('token');
                location.reload();
            });
        } else {
            // Token is absent, hide the admin elements
            adminBanner.style.display = 'none';
            openModalButton.style.display = 'none';
        }
    }

    // Initial check
    updateAdminElementsVisibility();

    // Fetch works from the backend and populate the gallery
    function fetchWorksFromBackend() {
        fetch('http://localhost:5678/api/works')
            .then(response => response.json())
            .then(data => {
                addWorksToGallery(data);
                createCategoryMenu(data);
            })
            .catch(error => {
                console.error('Error fetching works:', error);
            });
    }

    // Create category menu
    function createCategoryMenu(works) {
        const categories = new Set(['Tous']);
        works.forEach(work => categories.add(work.category.name));

        const filters = document.querySelector('.filtres');
        filters.innerHTML = '';

        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('boutons');
            li.textContent = category;
            li.addEventListener('click', () => filterWorks(category, works));
            filters.appendChild(li);
        });

        filters.querySelector('li').classList.add('bouton-active');
    }

    // Filter works by category
    function filterWorks(category, works) {
        const gallery = document.querySelector('#portfolio .gallery');
        gallery.innerHTML = '';

        const filteredWorks = category === 'Tous' ? works : works.filter(work => work.category.name === category);

        filteredWorks.forEach(work => {
            const figure = document.createElement('figure');
            figure.dataset.id = work.id;
            figure.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}">
                <figcaption>${work.title}</figcaption>
            `;
            gallery.appendChild(figure);
        });

        document.querySelectorAll('.filtres .boutons').forEach(button => button.classList.remove('bouton-active'));
        document.querySelector(`.filtres .boutons:contains(${category})`).classList.add('bouton-active');
    }

    // Add works to gallery
    function addWorksToGallery(works) {
        const gallery = document.querySelector('#portfolio .gallery');
        works.forEach(work => {
            const figure = document.createElement('figure');
            figure.dataset.id = work.id;
            figure.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}">
                <figcaption>${work.title}</figcaption>
            `;
            gallery.appendChild(figure);
        });
    }

    // Initial fetch of works
    fetchWorksFromBackend();
});
