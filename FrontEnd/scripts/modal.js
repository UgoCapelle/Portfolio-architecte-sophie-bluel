const openModalButton = document.getElementById('openModalButton');
const modal = document.getElementById('modal');
const closeModalButton = modal.querySelector('.close');
const modalContent = modal.querySelector('.modal-content');

openModalButton.addEventListener('click', () => {
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(data => {
            const travauxHTML = data.map(travail => `
                <div>
                    <img src="${travail.imageUrl}" alt="${travail.title}">
                </div>
            `).join('');

            modalContent.innerHTML = `
                <h3 style="text-align: center;">Galerie Photo</h3>
                <div class="gallery-images">${travauxHTML}</div>
                <hr>
                <button id="addPhotoButton">Ajouter une photo</button>
            `;

            modal.style.display = 'block';

            const addPhotoButton = document.getElementById('addPhotoButton');
            addPhotoButton.addEventListener('click', showAddPhotoForm);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des travaux pour la modale :', error);
        });
});

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

function showAddPhotoForm() {
    modalContent.innerHTML = `
        <h3 style="text-align: center;">Ajouter une photo</h3>
        <form id="addPhotoForm">
            <label for="photoFile">Choisir une photo</label>
            <input type="file" id="photoFile" name="file" accept="image/*" required>
            <label for="photoTitle">Titre de la photo</label>
            <input type="text" id="photoTitle" name="title" required>
            <label for="photoCategory">Catégorie</label>
            <select id="photoCategory" name="category" required>
                <!-- Les options seront ajoutées dynamiquement -->
            </select>
            <button type="submit">Ajouter</button>
        </form>
    `;

    // Fetch categories
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
        .catch(error => console.error('Erreur lors de la récupération des catégories :', error));

    const addPhotoForm = document.getElementById('addPhotoForm');
    addPhotoForm.addEventListener('submit', uploadPhoto);
}

function uploadPhoto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

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
        modal.style.display = 'none';
    })
    .catch(error => console.error('Erreur lors de l\'ajout de la photo :', error));
}
