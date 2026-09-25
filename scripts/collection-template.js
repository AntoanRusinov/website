// Builds a collection page from the data.json next to it and drives the
// product detail dialog.
//
// data.json shape:
//   title, description            page heading and intro
//   video.youtubeId, video.title  optional; renders the embedded player
//   imageWidth                    width of the full-size <n>.jpg files (default 1600)
//   items[]                       id, title, description, image, material, fabric,
//                                 craftsmanship, optional orientation: "landscape"
//
// Image files per item: <n>.jpg (full size, detail view), <n>-800.jpg (grid
// thumbnail, 800x1200). Landscape photos also have <n>-1200.jpg, a 1200x1800
// crop, because the grid frame is 2:3 and the full image has a different shape.

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

function variant(image, suffix) {
    const dot = image.lastIndexOf('.');
    return `${IMAGE_DIR}${image.slice(0, dot)}${suffix}${image.slice(dot)}`;
}

function thumbnailSources(item, fullWidth) {
    const small = variant(item.image, '-800');
    const large = item.orientation === 'landscape'
        ? `${variant(item.image, '-1200')} 1200w`
        : `${IMAGE_DIR}${item.image} ${fullWidth}w`;
    return {
        src: small,
        srcset: `${small} 800w, ${large}`,
        sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'
    };
}

function renderVideo(video) {
    const container = document.getElementById('collection-video');
    if (!container) {
        return;
    }
    if (!video || !video.youtubeId) {
        container.hidden = true;
        return;
    }
    const iframe = document.createElement('iframe');
    iframe.width = 800;
    iframe.height = 450;
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.youtubeId)}?autoplay=1&mute=1&rel=0`;
    iframe.title = video.title || 'Collection video';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    container.replaceChildren(iframe);
    container.hidden = false;
}

function displayCollection(data) {
    if (!data || !Array.isArray(data.items)) {
        console.error('Invalid data format:', data);
        return;
    }

    document.getElementById('collection-title').textContent = data.title;
    document.getElementById('collection-description').textContent = data.description;
    renderVideo(data.video);

    const fullWidth = data.imageWidth || 1600;
    const grid = document.getElementById('collection-grid');
    grid.replaceChildren();

    data.items.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'collection-item';
        button.setAttribute('aria-label', `View details: ${item.title}`);

        const img = document.createElement('img');
        const sources = thumbnailSources(item, fullWidth);
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

// Fills a text element and hides its wrapper when the value is empty, so
// looks without a written description or specs show only the photo and title.
function setField(id, value, wrapperSelector) {
    const el = document.getElementById(id);
    const text = (value || '').trim();
    el.textContent = text;
    const wrapper = wrapperSelector ? el.closest(wrapperSelector) : el;
    wrapper.hidden = text === '';
}

function openDetail(index) {
    const item = window.collectionData.items[index];
    const detail = detailElement();

    const img = document.getElementById('detail-img');
    img.src = IMAGE_DIR + item.image;
    img.alt = item.title;
    document.getElementById('detail-title').textContent = item.title;
    setField('detail-description', item.description);
    setField('detail-material', item.material, '.spec-item');
    setField('detail-fabric', item.fabric, '.spec-item');
    setField('detail-craftsmanship', item.craftsmanship, '.spec-item');
    const anySpec = [item.material, item.fabric, item.craftsmanship].some(v => (v || '').trim() !== '');
    detail.querySelector('.detail-specs').hidden = !anySpec;

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
