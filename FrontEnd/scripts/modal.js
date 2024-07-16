document.addEventListener('DOMContentLoaded', () => {
    const openModalButton = document.getElementById('openModalButton');
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');

    
    openModalButton.addEventListener('click', () => {
        showGallery();
        modal.style.display = 'block';
    });

    
    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('close') || event.target === modal) {
            closeModal();
        }
    });
});

function showGallery() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="arrow-left"></span>
        <span class="close">&times;</span>
        <h3 style="text-align: center;">Galerie Photo</h3>
        <div class="gallery-images"></div>
        <hr>
        <button id="addPhotoButton">Ajouter une photo</button>
    `;

    const addPhotoButton = document.getElementById('addPhotoButton');
    addPhotoButton.addEventListener('click', showAddPhotoForm);

    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(data => {
            const travauxHTML = data.map(travail => `
                <div class="work-item">
                    <img src="${travail.imageUrl}" alt="${travail.title}">
                    <button class="delete-button" data-id="${travail.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join('');

            const galleryImages = document.querySelector('.gallery-images');
            galleryImages.innerHTML = travauxHTML;

            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', deleteWork);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des travaux pour la modale :', error);
        });
}

function showAddPhotoForm() {
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

    fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('photoCategory');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des catégories :', error);
        });

    const customFileButton = document.getElementById('customFileButton');
    const photoFileInput = document.getElementById('photoFile');
  
    
    customFileButton.addEventListener('click', () => photoFileInput.click());
  
    
    photoFileInput.addEventListener('change', handleFileSelect);

    document.getElementById('addPhotoForm').addEventListener('submit', uploadPhoto);
  
    const backToGalleryButton = document.getElementById('backToGalleryButton');
    backToGalleryButton.addEventListener('click', showGallery);
  
    const closeModalButton = document.querySelector('.close');
    closeModalButton.addEventListener('click', closeModal);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const previewZone = document.getElementById('previewZone');
    const rectangleZone = document.getElementById('rectangleZone');

    if (file) {
        
        const imageURL = URL.createObjectURL(file);

        
        document.getElementById('imageIcon').style.display = 'none';
        document.getElementById('customFileButton').style.display = 'none';
        document.getElementById('fileInfoText').style.display = 'none';

        
        previewZone.innerHTML = `<img src="${imageURL}" style="max-height: 100%; max-width: 100%; object-fit: contain;">`;
        previewZone.style.display = 'block';
    }
}

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

    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('debug_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Photo ajoutée avec succès', data);
        addPhotoToGallery(data);
        addPhotoToModal(data);
        closeModal();
    })
    .catch(error => {
        console.error('Erreur lors de l\'ajout de la photo :', error);
    });
}

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
    div.querySelector('.delete-button').addEventListener('click', deleteWork);
}

function deleteWork(event) {
    const workId = event.currentTarget.dataset.id;
    const token = sessionStorage.getItem('debug_token');

    fetch(`http://localhost:5678/api/works/${workId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            removeWorkFromGallery(workId);
            removeWorkFromModal(workId);
        } else {
            throw new Error('Échec de la suppression du travail');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la suppression du travail :', error);
    });
}

function removeWorkFromGallery(workId) {
    document.querySelector(`.gallery figure[data-id="${workId}"]`)?.remove();
}

function removeWorkFromModal(workId) {
    document.querySelector(`.gallery-images .work-item[data-id="${workId}"]`)?.remove();
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}