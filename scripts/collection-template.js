// Builds a collection page from the data.json next to it and drives the
// product detail dialog.

const IMAGE_DIR = 'images/';

async function loadCollectionData() {
    const grid = document.getElementById('collection-grid');
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        displayCollection(await response.json());
    } catch (error) {
        console.error('Error loading collection data:', error);
        grid.textContent = 'Error loading collection. Please try again later.';
    }
}

// Thumbnails are served from a small variant when one exists; the full
// image is used in the detail view and as the large srcset candidate.
function thumbnailSources(image) {
    const dot = image.lastIndexOf('.');
    const small = `${image.slice(0, dot)}-800${image.slice(dot)}`;
    return {
        src: IMAGE_DIR + small,
        srcset: `${IMAGE_DIR}${small} 800w, ${IMAGE_DIR}${image} 1600w`,
        sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'
    };
}

function displayCollection(data) {
    if (!data || !Array.isArray(data.items)) {
        console.error('Invalid data format:', data);
        return;
    }

    document.getElementById('collection-title').textContent = data.title;
    document.getElementById('collection-description').textContent = data.description;

    const grid = document.getElementById('collection-grid');
    grid.replaceChildren();

    data.items.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'collection-item';
        button.setAttribute('aria-label', `View details: ${item.title}`);

        const img = document.createElement('img');
        const sources = thumbnailSources(item.image);
        img.src = sources.src;
        img.srcset = sources.srcset;
        img.sizes = sources.sizes;
        img.width = 800;
        img.height = 1200;
        img.alt = item.title;
        img.className = 'collection-img';
        img.loading = index < 3 ? 'eager' : 'lazy';

        button.appendChild(img);
        button.addEventListener('click', () => openDetail(index));
        grid.appendChild(button);
    });

    window.collectionData = data;
}

// ----- Detail dialog -----

let lastFocused = null;

function detailElement() {
    return document.getElementById('product-detail');
}

function openDetail(index) {
    const item = window.collectionData.items[index];
    const detail = detailElement();

    const img = document.getElementById('detail-img');
    img.src = IMAGE_DIR + item.image;
    img.alt = item.title;
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-description').textContent = item.description;
    document.getElementById('detail-material').textContent = item.material;
    document.getElementById('detail-fabric').textContent = item.fabric;
    document.getElementById('detail-craftsmanship').textContent = item.craftsmanship;

    lastFocused = document.activeElement;
    detail.hidden = false;
    detail.classList.add('open');
    detail.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    document.getElementById('closeDetailBtn').focus();
}

function closeDetail() {
    const detail = detailElement();
    if (!detail || detail.hidden) {
        return;
    }
    detail.classList.remove('open');
    detail.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
    }
}

// Keep keyboard focus inside the dialog while it is open.
function trapFocus(event) {
    const detail = detailElement();
    if (event.key !== 'Tab' || detail.hidden) {
        return;
    }
    const focusable = detail.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) {
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCollectionData();

    const detail = detailElement();
    document.getElementById('closeDetailBtn').addEventListener('click', closeDetail);

    // Click on the dark backdrop (outside the content) closes the dialog.
    detail.addEventListener('click', (event) => {
        if (event.target === detail) {
            closeDetail();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !detail.hidden) {
            event.preventDefault();
            closeDetail();
            return;
        }
        trapFocus(event);
    });
});
