function isImage(asset) {
  return asset.type.startsWith('image/');
}

function assetUrl(asset) {
  const base = isImage(asset)
    ? 'https://drive.google.com/uc?export=view&id='
    : 'https://drive.google.com/uc?export=download&id=';
  return `${base}${asset.id}`;
}

function createImageCard(asset) {
  const title = asset.name || `Image ${asset.id}`;
  return `
    <article class="group overflow-hidden rounded-3xl border border-white/10 bg-surface-container-lowest shadow-2xl">
      <div class="overflow-hidden bg-black">
        <img
          class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          src="${assetUrl(asset)}"
          alt="${title}"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="p-5">
        <h4 class="font-headline text-lg font-bold mb-2">${title}</h4>
        <p class="text-xs uppercase tracking-[0.3em] text-outline">Image</p>
      </div>
    </article>
  `;
}

function createVideoCard(asset) {
  const title = asset.name || `Video ${asset.id}`;
  return `
    <article class="group overflow-hidden rounded-3xl border border-white/10 bg-surface-container-lowest shadow-2xl">
      <div class="overflow-hidden bg-black">
        <video
          controls
          preload="none"
          class="w-full h-64 object-cover bg-black"
          src="${assetUrl(asset)}"
        ></video>
      </div>
      <div class="p-5">
        <h4 class="font-headline text-lg font-bold mb-2">${title}</h4>
        <p class="text-xs uppercase tracking-[0.3em] text-outline">Video</p>
      </div>
    </article>
  `;
}

function updateFilterButtons(activeFilter) {
  const buttons = document.querySelectorAll('[data-gallery-filter]');
  buttons.forEach((button) => {
    const filter = button.dataset.galleryFilter;
    const isActive = filter === activeFilter;
    button.classList.toggle('bg-primary', isActive);
    button.classList.toggle('text-on-primary', isActive);
    button.classList.toggle('bg-white/10', !isActive);
    button.classList.toggle('text-on-surface', !isActive);
  });
}

function applyGalleryFilter(filter) {
  const imageSection = document.getElementById('image-section');
  const videoSection = document.getElementById('video-section');
  if (imageSection) {
    imageSection.classList.toggle('hidden', filter === 'videos');
  }
  if (videoSection) {
    videoSection.classList.toggle('hidden', filter === 'images');
  }
  updateFilterButtons(filter);
}

function attachGalleryFilterControls() {
  const buttons = document.querySelectorAll('[data-gallery-filter]');
  if (!buttons.length) {
    return;
  }
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.galleryFilter;
      applyGalleryFilter(filter);
    });
  });
}

function renderGallery() {
  if (!window.GALLERY_ASSETS || !Array.isArray(window.GALLERY_ASSETS)) {
    return;
  }

  const images = window.GALLERY_ASSETS.filter(isImage);
  const videos = window.GALLERY_ASSETS.filter((asset) => asset.type === 'video/mp4');
  const imageCount = document.getElementById('gallery-image-count');
  const videoCount = document.getElementById('gallery-video-count');
  const imageGrid = document.getElementById('image-gallery');
  const videoGrid = document.getElementById('video-gallery');

  if (imageCount) {
    imageCount.textContent = images.length;
  }
  if (videoCount) {
    videoCount.textContent = videos.length;
  }

  if (imageGrid) {
    imageGrid.innerHTML = images.map(createImageCard).join('');
  }
  if (videoGrid) {
    videoGrid.innerHTML = videos.map(createVideoCard).join('');
  }

  attachGalleryFilterControls();
  applyGalleryFilter('all');
}

document.addEventListener('DOMContentLoaded', renderGallery);
