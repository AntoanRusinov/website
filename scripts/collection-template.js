// Load and display collection data
async function loadCollectionData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        displayCollection(data);
    } catch (error) {
        console.error('Error loading collection data:', error);
        document.getElementById('collection-grid').innerHTML =
            '<p>Error loading collection. Please try again later.</p>';
    }
}

// Display collection data
function displayCollection(data) {
    if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid data format:', data);
        return;
    }

    // Set title and description
    document.getElementById('collection-title').textContent = data.title;

    // Only add video if it doesn't already exist
    const existingVideo = document.querySelector('.collection-video');
    if (!existingVideo) {
        const videoHTML = `
            <div class="collection-video">
                <iframe width="100%" height="450"
                    src="https://www.youtube.com/embed/IGnrsP5Ec30?autoplay=1&mute=0&vq=hd1080&hd=1"
                    title="Bulgarian Broderie Collection" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
                </iframe>
            </div>
        `;

        // Insert video before description
        const descriptionElement = document.getElementById('collection-description');
        descriptionElement.insertAdjacentHTML('beforebegin', videoHTML);
    }

    document.getElementById('collection-description').textContent = data.description;

    const gridContainer = document.getElementById('collection-grid');
    gridContainer.innerHTML = '';

    // Loop through all items in the data.json
    data.items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'collection-item';

        itemDiv.innerHTML = `
            <img src="images/${item.image}"
                 alt="${item.title}"
                 class="collection-img"
                 loading="lazy">
        `;

        // Add click event to show detail view
        itemDiv.addEventListener('click', () => openDetail(index));
        gridContainer.appendChild(itemDiv);
    });

    // Store data for detail view
    window.collectionData = data;
}

// Open detail view
function openDetail(index) {
    const item = window.collectionData.items[index];

    // Update detail view with item data
    document.getElementById('detail-img').src = `images/${item.image}`;
    document.getElementById('detail-img').alt = item.title;
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-description').textContent = item.description;
    document.getElementById('detail-material').textContent = item.material;
    document.getElementById('detail-fabric').textContent = item.fabric;
    document.getElementById('detail-craftsmanship').textContent = item.craftsmanship;

    // Show the detail view
    document.getElementById('product-detail').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close detail view
function closeDetail(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const detailView = document.getElementById('product-detail');
    if (detailView) {
        detailView.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    // Load collection data
    loadCollectionData();

    // Add click event listener to close button
    const closeBtn = document.getElementById('closeDetailBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDetail);
    }

    // Handle escape key
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            e.preventDefault(); // Prevent default escape behavior
            const detailView = document.getElementById('product-detail');
            if (detailView && detailView.style.display === 'block') {
                closeDetail();
            }
        }
    });
});
