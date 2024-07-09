const openModalButton = document.getElementById('openModalButton');
const modal = document.getElementById('modal');
const closeModalButton = modal.querySelector('.close');
const modalContent = modal.querySelector('.modal-content');
console.log('Modal script loaded. Token:', localStorage.getItem('token'));

openModalButton.addEventListener('click', () => {
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
  
        modalContent.innerHTML = `
          <h3 style="text-align: center;">Galerie Photo</h3>
          <div class="gallery-images">${travauxHTML}</div>
          <hr>
          <button id="addPhotoButton">Ajouter une photo</button>
        `;
  
        modal.style.display = 'block';
        const addPhotoButton = document.getElementById('addPhotoButton');
        addPhotoButton.addEventListener('click', showAddPhotoForm);
  
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', deleteWork);
        });
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
            </select>
            <button type="submit">Ajouter</button>
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
        .catch(error => console.error('Erreur lors de la récupération des catégories :', error));

    document.getElementById('addPhotoForm').addEventListener('submit', uploadPhoto);
}

function uploadPhoto(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', event.target.photoFile.files[0]);
    formData.append('title', event.target.photoTitle.value);
    formData.append('category', event.target.photoCategory.value);
  
    fetch('http://localhost:5678/api/works', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('debug_token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Photo added successfully', data);
        addPhotoToGallery(data);
        addPhotoToModal(data);
        modal.style.display = 'none';
      })
      .catch(error => console.error('Error adding photo:', error));
      closeModal();
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
          throw new Error('Failed to delete work');
        }
      })
      .catch(error => console.error('Error deleting work:', error));
      closeModal();
  }
  
  function removeWorkFromGallery(workId) {
    document.querySelector(`.gallery figure[data-id="${workId}"]`)?.remove();
  }
  
  function removeWorkFromModal(workId) {
    document.querySelector(`.gallery-images .work-item[data-id="${workId}"]`)?.remove();
  }

  function closeModal() {
    modal.style.display = 'none';
  }