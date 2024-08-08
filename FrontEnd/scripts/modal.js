// Écouteur d'événements qui se déclenche lorsque le DOM est complètement chargé.
document.addEventListener('DOMContentLoaded', () => {
    const openModalButton = document.getElementById('openModalButton');
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');

    modal.style.display = 'none'; // Cache la modal au chargement initial.

    // Écouteur pour ouvrir la modale.
    openModalButton.addEventListener('click', () => {
        showGallery(); // Affiche la galerie dans la modale.
        modal.style.display = 'block'; // Affiche la modale.
    });

    // Écouteur pour fermer la modale lorsque l'on clique sur la croix ou l'extérieur du modal.
    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('close') || event.target === modal) {
            closeModal();
        }
    });

    // Observe les changements d'attributs sur la modale pour les logs.
    new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                console.log('Changement de style détecté :', modal.style.display);
            }
        }
    }).observe(modal, { attributes: true });
});

// Fonction pour afficher la galerie dans la modale.
async function showGallery() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="arrow-left"></span>
        <span class="close">&times;</span>
        <h3 style="text-align: center;">Galerie Photo</h3>
        <div class="gallery-images"></div>
        <hr>
        <button id="addPhotoButton">Ajouter une photo</button>
    `;

    document.getElementById('addPhotoButton').addEventListener('click', showAddPhotoForm);

    try {
        const response = await fetch('http://localhost:5678/api/works');
        const data = await response.json();
        const travauxHTML = data.map(travail => `
            <div class="work-item">
                <img src="${travail.imageUrl}" alt="${travail.title}">
                <button class="delete-button" data-id="${travail.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
        modalContent.querySelector('.gallery-images').innerHTML = travauxHTML;

        // Ajout des écouteurs d'événements pour les boutons de suppression
        modalContent.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const workId = event.currentTarget.dataset.id;
                deleteWork(workId);
            });
        });
    } catch (error) {
        console.error('Error fetching works:', error);
    }
}


// Fonction pour afficher le formulaire d'ajout de photo dans la modale.
async function showAddPhotoForm() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button id="backToGalleryButton" class="back-button">
            <i class="fas fa-arrow-left"></i>
        </button>
        <span class="close">&times;</span>
        <h3 style="text-align: center;">Ajout photo</h3>
        <div id="rectangleZone">
            <i class="fa-regular fa-image" id="imageIcon" style="color: #b9c5cc;"></i>
            <button id="customFileButton">+ Ajouter Photo</button>
            <input type="file" id="photoFile" name="file" accept="image/*" style="display: none;" required>
            <p id="fileInfoText">jpg, png : 4mo max</p>
            <div id="previewZone" style="display: none;"></div>
        </div>
        <form id="addPhotoForm">
            <label for="photoTitle">Titre</label>
            <input type="text" id="photoTitle" name="title" required>
            <label for="photoCategory">Catégorie</label>
            <select id="photoCategory" name="category" required></select>
            <hr>
            <button type="submit">Valider</button>
        </form>
    `;

    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();
        const categorySelect = document.getElementById('photoCategory');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
    }

    // Configuration du bouton de sélection de fichier et de la prévisualisation.
    const customFileButton = document.getElementById('customFileButton');
    const photoFileInput = document.getElementById('photoFile');
    customFileButton.addEventListener('click', () => photoFileInput.click());
    photoFileInput.addEventListener('change', handleFileSelect);

    // Configuration du formulaire d'ajout de photo.
    document.getElementById('addPhotoForm').addEventListener('submit', uploadPhoto);

    // Écouteur pour revenir à la galerie depuis le formulaire d'ajout.
    document.getElementById('backToGalleryButton').addEventListener('click', showGallery);

    // Écouteur pour fermer la modale.
    const closeModalButton = document.querySelector('.close');
    closeModalButton.addEventListener('click', closeModal);
}

// Fonction pour gérer la sélection de fichiers et afficher un aperçu.
function handleFileSelect(event) {
    const file = event.target.files[0];
    const previewZone = document.getElementById('previewZone');
    const rectangleZone = document.getElementById('rectangleZone');
    const imageIcon = document.getElementById('imageIcon');
    const customFileButton = document.getElementById('customFileButton');
    const fileInfoText = document.getElementById('fileInfoText');

    if (file) {
        const imageURL = URL.createObjectURL(file);

        imageIcon.classList.add('hidden');
        customFileButton.classList.add('hidden');
        fileInfoText.classList.add('hidden');

        previewZone.innerHTML = `<img src="${imageURL}" alt="Preview">`;
        previewZone.style.display = 'flex';
    }
}

// Fonction pour envoyer la photo au serveur et ajouter l'œuvre à la galerie et au modal.
function uploadPhoto(event) {
    event.preventDefault();
    const photoFileInput = document.getElementById('photoFile');
    const photoTitleInput = document.getElementById('photoTitle');
    const photoCategorySelect = document.getElementById('photoCategory');

    if (!photoFileInput.files.length) {
        console.error('Aucun fichier sélectionné.');
        return;
    }

    const formData = new FormData();
    formData.append('image', photoFileInput.files[0]);
    formData.append('title', photoTitleInput.value);
    formData.append('category', photoCategorySelect.value);

    // Envoi des données du formulaire au serveur.
    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Photo ajoutée avec succès', data);
        addPhotoToGallery(data); // Ajoute la photo à la galerie principale.
        addPhotoToModal(data); // Ajoute la photo au modal.
        closeModal(); // Ferme le modal après ajout.
    })
    .catch(error => {
        console.error('Erreur lors de l\'ajout de la photo :', error);
    });
}

// Fonction pour ajouter une photo à la galerie principale.
function addPhotoToGallery(photo) {
    const gallery = document.querySelector('.gallery');
    const figure = document.createElement('figure');
    figure.dataset.id = photo.id;
    figure.innerHTML = `
        <img src="${photo.imageUrl}" alt="${photo.title}">
        <figcaption>${photo.title}</figcaption>
    `;
    gallery.appendChild(figure);
}

// Fonction pour ajouter une photo à la galerie dans le modal.
function addPhotoToModal(photo) {
    const modalGallery = document.querySelector('.gallery-images');
    const div = document.createElement('div');
    div.className = 'work-item';
    div.dataset.id = photo.id;
    div.innerHTML = `
        <img src="${photo.imageUrl}" alt="${photo.title}">
        <button class="delete-button" data-id="${photo.id}">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    modalGallery.appendChild(div);
    div.querySelector('.delete-button').addEventListener('click', (event) => {
        const workId = event.currentTarget.dataset.id;
        deleteWork(workId); // Supprime l'œuvre au clic du bouton de suppression.
    });
}

// Fonction pour supprimer une œuvre du serveur.
function deleteWork(workId) {
    fetch(`http://localhost:5678/api/works/${workId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (response.ok) {
            removeWorkFromGallery(workId);
            removeWorkFromModal(workId);
            console.log(`Work with ID ${workId} deleted.`);
            closeModal(); // Ajout de cette ligne
        } else {
            console.error(`Failed to delete work with ID ${workId}.`);
        }
    })
    .catch(error => console.error('Error deleting work:', error));
}

// Fonction pour supprimer une œuvre de la galerie principale.
function removeWorkFromGallery(workId) {
    document.querySelector(`.gallery figure[data-id="${workId}"]`)?.remove();
}

// Fonction pour supprimer une œuvre de la galerie dans le modal.
function removeWorkFromModal(workId) {
    document.querySelector(`.gallery-images .work-item[data-id="${workId}"]`)?.remove();
}

// Fonction pour fermer le modal.
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}
