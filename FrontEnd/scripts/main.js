document.addEventListener('DOMContentLoaded', () => {
    console.log('Debug token from session:', sessionStorage.getItem('debug_token'));
    console.log('Token from localStorage:', localStorage.getItem('token'));
    console.log('Main script loaded. Token:', localStorage.getItem('token'));
    let isAdmin = false;
    const adminBanner = document.getElementById('admin-banner');
    const openModalButtons = document.querySelectorAll('.open-modal');
  
    if (window.location.search.includes('login=true')) {
      console.log('Page loaded after login. Token:', localStorage.getItem('token'));
    }

    // Vérification du statut d'authentification et du rôle d'administrateur
    const token = sessionStorage.getItem('debug_token') || localStorage.getItem('token') || '';    if (token) {
        fetch('http://localhost:5678/api/works', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        .then(response => {
            if (!response.ok) {
                throw new Error('Not authorized');
            }
            return response.json();
        })
        .then(user => {
            isAdmin = user.isAdmin;
            if (isAdmin) {
                adminBanner.classList.add('active');
                openModalButtons.forEach(button => {
                    button.style.display = 'inline';
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du rôle utilisateur :', error);
        });
    }

    // Récupération des travaux depuis le backend
    function recupererTravauxDepuisBackend() {
        fetch('http://localhost:5678/api/works')
          .then(response => response.json())
          .then(data => {
            ajouterTravauxALaGalerie(data);
            creerMenuDeCategories(data);
          })
          .catch(error => {
            console.error('Erreur lors de la récupération des travaux :', error);
          });
    }

    // Création du menu de catégories
    function creerMenuDeCategories(travaux) {
        const categories = new Set(['Tous']);
        travaux.forEach(travail => categories.add(travail.category.name));

        const filtres = document.querySelector('.filtres');
        filtres.innerHTML = '';

        categories.forEach(categorie => {
            const li = document.createElement('li');
            li.classList.add('boutons');
            li.textContent = categorie;
            li.addEventListener('click', () => filtrerTravaux(categorie, travaux));
            filtres.appendChild(li);
        });

        filtres.querySelector('li').classList.add('bouton-active');
    }

    // Filtrage des travaux par catégorie
    function filtrerTravaux(categorie, travaux) {
        const galerie = document.querySelector('#portfolio .gallery');
        galerie.innerHTML = '';

        const travauxFiltres = categorie === 'Tous' ? travaux : travaux.filter(travail => travail.category.name === categorie);

        travauxFiltres.forEach(travail => {
            const figure = document.createElement('figure');
            figure.dataset.id = travail.id;
            figure.innerHTML = `
                <img src="${travail.imageUrl}" alt="${travail.title}">
                <figcaption>${travail.title}</figcaption>
            `;
            galerie.appendChild(figure);
        });

        document.querySelectorAll('.filtres .boutons').forEach(bouton => bouton.classList.remove('bouton-active'));
        Array.from(document.querySelectorAll('.filtres .boutons')).find(bouton => bouton.textContent === categorie).classList.add('bouton-active');
    }

    // Ajout des travaux à la galerie principale
    function ajouterTravauxALaGalerie(travaux) {
        const galerie = document.querySelector('#portfolio .gallery');
        galerie.innerHTML = '';

        travaux.forEach(travail => {
            const figure = document.createElement('figure');
            figure.dataset.id = travail.id;
            figure.innerHTML = `
                <img src="${travail.imageUrl}" alt="${travail.title}">
                <figcaption>${travail.title}</figcaption>
            `;
            galerie.appendChild(figure);
        });
    }

    // Appel initial pour récupérer les travaux depuis le backend
    recupererTravauxDepuisBackend();
});
