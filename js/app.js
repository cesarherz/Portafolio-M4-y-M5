const form = document.querySelector('.post-form');
const postsList = document.querySelector('.posts-list');
const loadButton = document.querySelector('.btn-load');
const successMessage = document.querySelector('.message.success');
const errorMessage = document.querySelector('.message.error');
const loadingIndicator = document.querySelector('.loading');

const titleInput = document.querySelector('#title');
const categoryInput = document.querySelector('#category');
const quantityInput = document.querySelector('#quantity');
const userIdInput = document.querySelector('#userId');
const locationInput = document.querySelector('#location');

let postsState = [];

const API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

const showMessage = (type, text) => {
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    if (type === 'success') {
        successMessage.textContent = text;
        successMessage.classList.remove('hidden');
    } else {
        errorMessage.textContent = text;
        errorMessage.classList.remove('hidden');
    }
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }, 3000);
};

const toggleLoading = (show) => {
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
};

const clearForm = () => {
    form.reset();
    titleInput.focus();
};

const validateFormData = (data) => {
    if (!data.title || !data.category || !data.location) {
        return false;
    }
    if (data.quantity < 0 || data.userId < 0) {
        return false;
    }
    return true;
};

const renderPosts = () => {
    postsList.innerHTML = '';
    
    if (postsState.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-text">No hay productos en el inventario</p>
            </div>
        `;
        return;
    }
    
    postsState.forEach(post => {
        const productHTML = `
            <article class="post-item" data-id="${post.id}">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <span class="post-id">ID: ${post.id}</span>
                </div>
                
                <div class="post-details">
                    <div class="detail-item">
                        <span class="detail-label">Categoría</span>
                        <span class="detail-value">
                            <span class="category-badge">${post.category}</span>
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Ubicación</span>
                        <span class="detail-value">${post.location}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Cantidad</span>
                        <span class="detail-value">${post.quantity} unidades</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Precio</span>
                        <span class="detail-value">$${post.userId}</span>
                    </div>
                </div>
                
                <div class="post-footer">
                    <span class="post-user">
                        Stock: <strong>${post.quantity > 0 ? 'Disponible' : 'Agotado'}</strong>
                    </span>
                    <button class="btn btn-delete" data-id="${post.id}">
                        Eliminar
                    </button>
                </div>
            </article>
        `;
        
        postsList.innerHTML += productHTML;
    });
    
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDelete);
    });
};

const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    const formData = {
        title: titleInput.value,
        category: categoryInput.value,
        quantity: parseInt(quantityInput.value),
        userId: parseFloat(userIdInput.value),
        location: locationInput.value
    };
    
    if (!validateFormData(formData)) {
        showMessage('error', 'Todos los campos son obligatorios');
        return;
    }
    
    try {
        toggleLoading(true);
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        const newProduct = {
            id: Date.now(),
            ...formData
        };
        
        postsState = [newProduct, ...postsState];
        renderPosts();
        clearForm();
        showMessage('success', 'Producto agregado exitosamente');
        
    } catch (error) {
        showMessage('error', 'Error al agregar producto');
    } finally {
        toggleLoading(false);
    }
};

const handleDelete = async (event) => {
    const postId = parseInt(event.target.dataset.id);
    
    if (!confirm('¿Eliminar este producto?')) {
        return;
    }
    
    try {
        toggleLoading(true);
        
        await fetch(`${API_BASE_URL}/${postId}`, {
            method: 'DELETE'
        });
        
        postsState = postsState.filter(post => post.id !== postId);
        renderPosts();
        showMessage('success', 'Producto eliminado');
        
    } catch (error) {
        showMessage('error', 'Error al eliminar');
    } finally {
        toggleLoading(false);
    }
};

const handleLoadPosts = async () => {
    try {
        toggleLoading(true);
        
        const response = await fetch(API_BASE_URL);
        const data = await response.json();
        
        const categories = ['Electrónica', 'Muebles', 'Herramientas', 'Suministros', 'Alimentos', 'Otros'];
        const locations = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        postsState = data.slice(0, 10).map((post, index) => {
            return {
                id: post.id,
                title: post.title.substring(0, 50),
                category: categories[index % categories.length],
                quantity: Math.floor(Math.random() * 100) + 1,
                userId: Math.floor(Math.random() * 50000) + 5000,
                location: `Estante ${locations[index % locations.length]}`
            };
        });
        
        renderPosts();
        showMessage('success', 'Datos cargados');
        
    } catch (error) {
        showMessage('error', 'Error al cargar datos');
    } finally {
        toggleLoading(false);
    }
};

form.addEventListener('submit', handleFormSubmit);
loadButton.addEventListener('click', handleLoadPosts);

renderPosts();