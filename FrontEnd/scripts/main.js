
function recupererTravauxDepuisBackend() {
    fetch('http://localhost:5678/api/works')
      .then(response => response.json())
      .then(data => {
        console.log(data); 
        ajouterTravauxALaGalerie(data); 
        creerMenuDeCategories(data); 
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des travaux :', error);
      });
}

function creerMenuDeCategories(travaux) {
  const categories = new Set(); 
  categories.add('Tous'); 
  travaux.forEach(travail => {
    categories.add(travail.category.name);
  });

  const filtres = document.querySelector('.filtres');
  filtres.innerHTML = ''; 

  categories.forEach(categorie => {
    const li = document.createElement('li');
    li.classList.add('boutons');
    li.textContent = categorie;
    li.addEventListener('click', () => filtrerTravaux(categorie, travaux));
    filtres.appendChild(li);
  });

  const boutonTous = filtres.querySelector('li');
  boutonTous.classList.add('bouton-active');
}

function filtrerTravaux(categorie, travaux) {
  const galerie = document.querySelector('#portfolio .gallery');
  galerie.innerHTML = ''; 

  const travauxFiltres = categorie === 'Tous' ? travaux : travaux.filter(travail => travail.category.name === categorie);

  travauxFiltres.forEach(travail => {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${travail.imageUrl}" alt="${travail.title}">
      <figcaption>${travail.title}</figcaption>
    `;
    galerie.appendChild(figure);
  });

  const boutons = document.querySelectorAll('.boutons');
  boutons.forEach(bouton => bouton.classList.remove('bouton-active'));
  const boutonActif = Array.from(boutons).find(bouton => bouton.textContent === categorie);
  boutonActif.classList.add('bouton-active');
}

function ajouterTravauxALaGalerie(travaux) {
  const galerie = document.querySelector('#portfolio .gallery'); // Sélectionnez la galerie où ajouter les travaux
  galerie.innerHTML = ''; 

  travaux.forEach(travail => {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${travail.imageUrl}" alt="${travail.title}">
      <figcaption>${travail.title}</figcaption>
    `;
    galerie.appendChild(figure);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  recupererTravauxDepuisBackend();
});
