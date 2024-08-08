// Lance que si le dom est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments du DOM
    const adminBanner = document.getElementById('admin-banner');
    const openModalButton = document.getElementById('openModalButton');
    const loginLink = document.getElementById('loginLink');
    const filters = document.getElementById('filters'); 

    // Fonction pour mettre à jour la visibilité des éléments d'administration quand le token est présent
    function updateAdminElementsVisibility() {
        const token = localStorage.getItem('token');
        const isAdmin = !!token; // Vérifie si un token est stocké

        // Ajout ou retirer banniere + logout si admin
        adminBanner.style.display = isAdmin ? 'block' : 'none';
        openModalButton.style.display = isAdmin ? 'inline' : 'none';
        filters.style.display = isAdmin ? 'none' : 'flex';
        loginLink.textContent = isAdmin ? 'logout' : 'login';
        loginLink.classList.toggle('lilogin', isAdmin);
        loginLink.href = isAdmin ? '#' : 'login.html';
        
        // Ajoute un écouteur pour la déconnexion si l'utilisateur est un admin.
        if (isAdmin) {
            loginLink.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('token'); // Suppression du token.
                location.reload(); // Rechargement de la page pour mettre à jour l'affichage.
            });
        }
    }

    // Fonction pour récupérer les œuvres depuis le backend.
    function fetchWorksFromBackend() {
        fetch('http://localhost:5678/api/works')
            .then(response => response.json())
            .then(data => {
                addWorksToGallery(data); // Ajoute les œuvres à la galerie.
                createCategoryMenu(data); // Crée le menu des catégories.
            })
            .catch(error => console.error('Error fetching works:', error));
    }

    // Fonction pour créer un menu de filtre.
    function createCategoryMenu(works) {
        const categories = new Set(['Tous']); // Crée un ensemble de catégories avec 'Tous' comme option par défaut.
        works.forEach(work => categories.add(work.category.name)); // Ajoute les catégories des œuvres au set.

        filters.innerHTML = ''; // Réinitialise le menu de filtrage.
        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('boutons');
            li.textContent = category;
            li.addEventListener('click', () => filterWorks(category, works)); // Ajoute un écouteur d'événements pour filtrer les œuvres.
            filters.appendChild(li);
        });

        // Ajoute une classe active au premier bouton (tous).
        filters.querySelector('li').classList.add('bouton-active');
    }

    // Fonction pour filtrer les œuvres en fonction de la catégorie sélectionnée.
    function filterWorks(category, works) {
        const gallery = document.querySelector('#portfolio .gallery');
        gallery.innerHTML = ''; // Réinitialise la galerie.

        const filteredWorks = category === 'Tous' ? works : works.filter(work => work.category.name === category); // Filtre les œuvres par catégorie.
        filteredWorks.forEach(work => addWorkToGallery(work)); // Ajoute les œuvres filtrées à la galerie.
        
        // Réinitialise et active le bouton de filtrage.
        document.querySelectorAll('.filtres .boutons').forEach(button => button.classList.remove('bouton-active'));
        const activeButton = Array.from(document.querySelectorAll('.filtres .boutons')).find(button => button.textContent === category);
        if (activeButton) {
            activeButton.classList.add('bouton-active');
        }
    }

    // Fonction pour ajouter une œuvre à la galerie.
    function addWorkToGallery(work) {
        const gallery = document.querySelector('#portfolio .gallery');
        const figure = document.createElement('figure');
        figure.dataset.id = work.id;
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    }

    // Fonction pour ajouter plusieurs œuvres à la galerie.
    function addWorksToGallery(works) {
        works.forEach(work => addWorkToGallery(work));
    }

    updateAdminElementsVisibility(); // Met à jour la visibilité des éléments d'administration.
    fetchWorksFromBackend(); // Récupère les œuvres depuis le backend.
});
