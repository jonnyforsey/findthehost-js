console.log('✅ JS script is now loaded from GitHub');

const h1 = document.querySelector('h1');
if (h1) h1.style.color = 'red'; // Just as a visual test


document.addEventListener("DOMContentLoaded", function () {

<!--Gallery Script and CSS -->

// Master Script Setup
window.Webflow ||= [];
window.Webflow.push(() => {
  setTimeout(() => {
    initImageGallery();
    initHighlightModal();
    initQtySelector();
    initStickyBanner();
  }, 200);
});

const PROPERTY_BASE_URL = "/stay/united-kingdom-falmouth-thetis-place";

function initImageGallery() {
  const urlsText = document.querySelector('.gallery-image-urls');
  if (!urlsText) return;
  const urls = urlsText.textContent.split(',').map(u => u.trim()).filter(Boolean);

  const mainWrapper = document.querySelector('.main-image-wrapper');
  const sideWrapper = document.querySelector('.side-images-wrapper');

  if (!mainWrapper || !sideWrapper) return;

  mainWrapper.innerHTML = '';
  sideWrapper.innerHTML = '';

  if (urls.length === 0) return;

  const mainImg = document.createElement('img');
  mainImg.src = urls[0];
  mainImg.style = "width: 100%; height: 100%; object-fit: cover; border-radius: 12px; cursor: pointer;";
  mainWrapper.appendChild(mainImg);

  urls.slice(1, 5).forEach((url) => {
    const img = document.createElement('img');
    img.src = url;
    img.style = "width: 100%; height: 100%; object-fit: cover; border-radius: 12px; cursor: pointer;";
    const div = document.createElement('div');
    div.className = 'gallery-side-image';
    div.style.overflow = 'hidden';
    div.appendChild(img);
    sideWrapper.appendChild(div);
  });

  document.querySelectorAll('.main-image-wrapper img, .side-images-wrapper img').forEach(img => {
    img.addEventListener('click', () => openGalleryOverview(urls));
  });

  //Check initial URL on load
  handleInitialURL(urls);
}

function openGalleryOverview(urls) {
  const gridModal = document.querySelector('.gallery-grid-modal');
  const gridContent = gridModal.querySelector('.grid-content');
  const imageCountEl = gridModal.querySelector('.image-count');
  const backdrop = document.querySelector('.modal-backdrop');

  gridContent.innerHTML = '';
  imageCountEl.textContent = `${urls.length} image${urls.length === 1 ? '' : 's'}`;

  urls.forEach((url, index) => {
    const thumb = document.createElement('img');
    thumb.src = url;
    thumb.style = `
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 16px;
      cursor: pointer;
      transition: transform 0.15s ease-in-out;
      margin-bottom: 12px;
      display: inline-block;
    `;
    thumb.addEventListener('mouseover', () => thumb.style.transform = 'scale(1.05)');
    thumb.addEventListener('mouseout', () => thumb.style.transform = 'scale(1)');
    thumb.addEventListener('click', () => {
      gridModal.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.classList.remove('modal-open');
      openCarousel(urls, index);
    });
    gridContent.appendChild(thumb);
  });

  gridModal.classList.add('active');
  backdrop.classList.add('active');
  document.body.classList.add('modal-open');

  history.pushState({ modal: "grid" }, "", `${PROPERTY_BASE_URL}/image-grid`);
}

function openCarousel(urls, startIndex = 0) {
  const carouselModal = document.querySelector('.gallery-carousel-modal');
  const carouselImage = carouselModal.querySelector('.carousel-image');
  const currentIndexEl = carouselModal.querySelector('.current-index');
  const totalCountEl = carouselModal.querySelector('.total-count');
  const countHeader = carouselModal.querySelector('.image-count');
  const backdrop = document.querySelector('.modal-backdrop');

  let currentIndex = startIndex;

  totalCountEl.textContent = urls.length;
  countHeader.textContent = `${urls.length} image${urls.length === 1 ? '' : 's'}`;

  function updateImage(push = true) {
    const url = urls[currentIndex];
    carouselImage.src = url;
    currentIndexEl.textContent = currentIndex + 1;

    if (push) {
      const encoded = encodeURIComponent(url);
      history.pushState({ modal: "image", index: currentIndex }, "", `${PROPERTY_BASE_URL}/image-carousel/${encoded}`);
    }
  }

  updateImage();

  carouselModal.classList.add('active');
  backdrop.classList.add('active');
  document.body.classList.add('modal-open');

  carouselModal.querySelector('.carousel-prev').onclick = () => {
    currentIndex = (currentIndex - 1 + urls.length) % urls.length;
    updateImage();
  };

  carouselModal.querySelector('.carousel-next').onclick = () => {
    currentIndex = (currentIndex + 1) % urls.length;
    updateImage();
  };
}

function closeAllModals() {
  document.querySelector('.gallery-grid-modal').classList.remove('active');
  document.querySelector('.gallery-carousel-modal').classList.remove('active');
  document.querySelector('.modal-backdrop').classList.remove('active');
  document.body.classList.remove('modal-open');
  history.pushState({}, "", PROPERTY_BASE_URL);
}

//Modal close buttons
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[data-close-gallery]').forEach(el =>
    el.addEventListener('click', closeAllModals)
  );
  document.querySelectorAll('[data-close-carousel]').forEach(el =>
    el.addEventListener('click', closeAllModals)
  );
});

//Handle back/forward button behavior
window.addEventListener("popstate", (event) => {
  const urlsText = document.querySelector('.gallery-image-urls');
  const urls = urlsText?.textContent.split(',').map(u => u.trim()).filter(Boolean) || [];
  if (event.state?.modal === "grid") {
    closeAllModals();
    openGalleryOverview(urls);
  } else if (event.state?.modal === "image") {
    closeAllModals();
    openCarousel(urls, event.state.index || 0);
  } else {
    closeAllModals();
  }
});

//Reopen modal on direct link
function handleInitialURL(urls) {
  const path = window.location.pathname;
  if (path.includes("/image-grid")) {
    openGalleryOverview(urls);
  } else if (path.includes("/image-carousel/")) {
    const encodedUrl = decodeURIComponent(path.split("/image-carousel/")[1]);
    const index = urls.findIndex(u => u === encodedUrl);
    if (index >= 0) openCarousel(urls, index);
  }
}


// ✅ Highlight Modal Logic with URL hash sync & auto-open
function initHighlightModal() {
  const modal = document.querySelector('.highlight-modal');
  const content = document.querySelector('.highlight-modal-content');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  const closeBtn = document.querySelector('.highlight-close');
  let currentIndex = 0;
  let mediaItems = [];
  let isMuted = true;
  let scrollPosition = 0;

  const propertyUrl = 'https://www.findthehost.com/stay/united-kingdom-falmouth-thetis-place'; // Main property URL

  const bubbles = document.querySelectorAll('.highlight-bubble');
  if (!bubbles.length || !modal || !content) return;

  // Helper to open modal for a given slug and find matching media
  function openHighlightBySlug(slug) {
    let matchedBubble = null;
    bubbles.forEach(bubble => {
      if (bubble.dataset.highlightId === slug) matchedBubble = bubble;
    });
    if (!matchedBubble) return;

    mediaItems = Array.from(document.querySelectorAll(`.highlight-media[data-highlight-id="${slug}"]`)).map(el => ({
      url: el.dataset.url,
      type: el.dataset.type.toLowerCase(),
      slug: el.dataset.slug
    }));
    if (!mediaItems.length) return;

    currentIndex = 0;
    scrollPosition = window.scrollY;
    document.body.style.top = `-${scrollPosition}px`;
    document.body.classList.add('modal-open');

    let progressWrapper = document.querySelector('.highlight-progress-bar-wrapper');
    if (!progressWrapper) {
      progressWrapper = document.createElement('div');
      progressWrapper.className = 'highlight-progress-bar-wrapper';
      content.parentNode.insertBefore(progressWrapper, content);
    }

    modal.style.display = 'flex';
    modal.classList.add('active');

    function show() {
      content.innerHTML = '';
      progressWrapper.innerHTML = '';
      const item = mediaItems[currentIndex];
      if (!item) return;

      // Update URL hash with highlight slug
      if (item.slug) {
        history.replaceState(null, '', `${propertyUrl}#highlight=${item.slug}`);
      }

      mediaItems.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('highlight-progress-segment');
        if (i === currentIndex) dot.classList.add('active');
        progressWrapper.appendChild(dot);
      });

      if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.url;
        video.setAttribute('playsinline', true);
        video.setAttribute('autoplay', true);
        video.setAttribute('preload', 'metadata');
        video.muted = isMuted;
        video.style = 'border-radius:12px;max-width:100%;height:100%;object-fit:cover;';
        content.appendChild(video);
        video.play().catch(() => console.warn("Autoplay failed"));

        video.onended = () => {
          if (currentIndex < mediaItems.length - 1) {
            currentIndex++;
            show();
          } else {
            closeBtn.click();
          }
        };

        const volumeBtn = document.createElement('div');
        volumeBtn.className = 'volume-toggle';
        volumeBtn.style = `
          position: absolute;
          bottom: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.3);
          z-index: 9;
          cursor: pointer;
        `;

        const updateVolumeIcon = () => {
          volumeBtn.innerHTML = isMuted
            ? `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>`
            : `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>`;
        };

        updateVolumeIcon();

        volumeBtn.onclick = (e) => {
          e.stopPropagation();
          isMuted = !isMuted;
          video.muted = isMuted;
          updateVolumeIcon();
        };

        content.appendChild(volumeBtn);
      } else {
        const img = document.createElement('img');
        img.src = item.url;
        img.style = 'width:100%;height:100%;object-fit:cover;border-radius:12px;';
        content.appendChild(img);
      }

      leftArrow.style.opacity = currentIndex === 0 ? '0.3' : '1';
      leftArrow.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      rightArrow.style.opacity = currentIndex === mediaItems.length - 1 ? '0.3' : '1';
      rightArrow.style.pointerEvents = currentIndex === mediaItems.length - 1 ? 'none' : 'auto';
    }

    leftArrow.onclick = e => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        show();
      }
    };

    rightArrow.onclick = e => {
      e.stopPropagation();
      if (currentIndex < mediaItems.length - 1) {
        currentIndex++;
        show();
      }
    };

function closeModal() {
  modal.style.display = 'none';
  modal.classList.remove('active'); // <- This line is the key fix
  content.innerHTML = '';
  const progressWrapper = document.querySelector('.highlight-progress-bar-wrapper');
  if (progressWrapper) progressWrapper.innerHTML = '';
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, scrollPosition);
  history.replaceState(null, '', propertyUrl);
}


closeBtn.onclick = closeModal;

modal.addEventListener('click', e => {
  if (e.target === modal) {
    closeModal();
  }
});


    show();
  }

  // On bubble click - open modal and update URL hash
  bubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      const id = bubble.dataset.highlightId;
      openHighlightBySlug(id);
    });
  });


  // On page load: check if URL hash contains highlight slug and auto open modal
  const hash = window.location.hash;
  const hashMatch = hash.match(/highlight=([^&]+)/);
  if (hashMatch) {
    const slug = hashMatch[1];
    setTimeout(() => openHighlightBySlug(slug), 500);
  }

  // Hide highlight section if no media
  const highlightGroups = document.querySelectorAll('.highlight-group');
  let hasMedia = false;
  highlightGroups.forEach(group => {
    const items = group.querySelectorAll('.highlight-media');
    if (items.length > 0) hasMedia = true;
  });
  if (!hasMedia) {
    const section = document.querySelector('.highlight-section-wrapper');
    if (section) section.style.display = 'none';
  }
}



  // Qty Selector
  function initQtySelector() {
    document.querySelectorAll('.rooms-available-number').forEach(el => {
      const value = el.textContent.trim();
      el.textContent = `${value} rooms left`;
    });
  }

  // Sticky Banner Logic
  function initStickyBanner() {
    const banner = document.querySelector('.sticky-banner');
    const roomCountText = document.querySelector('.room-count-text');
    const totalPriceEl = document.querySelector('.total-price-banner');
    const pricePerNightEl = document.querySelector('.current-price-banner');
    const nights = 3;

    if (banner) banner.style.display = 'none';

    document.querySelectorAll('.room-card').forEach(card => {
      const selectBtn = card.querySelector('.select-room-button');
      const qtyWrapper = card.querySelector('.qty-selector');
      const minusBtn = card.querySelector('.qty-button.minus');
      const plusBtn = card.querySelector('.qty-button.plus');
      const qtyDisplay = card.querySelector('.qty-display');
      const max = parseInt(qtyWrapper?.dataset.max, 10) || 10;

      if (!selectBtn || !qtyWrapper || !qtyDisplay) return;

      selectBtn.addEventListener('click', () => {
        selectBtn.style.display = 'none';
        qtyWrapper.style.display = 'flex';
        qtyDisplay.textContent = '1';
        updateBanner();
      });

      plusBtn.addEventListener('click', () => {
        const current = parseInt(qtyDisplay.textContent, 10) || 1;
        if (current < max) {
          qtyDisplay.textContent = current + 1;
          updateBanner();
        }
      });

      minusBtn.addEventListener('click', () => {
        const current = parseInt(qtyDisplay.textContent, 10) || 1;
        if (current > 1) {
          qtyDisplay.textContent = current - 1;
        } else {
          qtyWrapper.style.display = 'none';
          selectBtn.style.display = 'block';
        }
        updateBanner();
      });
    });

    function updateBanner() {
      let totalQty = 0;
      let totalPrice = 0;

      document.querySelectorAll('.room-card').forEach(card => {
        const qtyWrapper = card.querySelector('.qty-selector');
        const qtyDisplay = card.querySelector('.qty-display');
        const priceEl = card.querySelector('.current-price');

        if (!qtyWrapper || !qtyDisplay || !priceEl) return;

        if (qtyWrapper.style.display !== 'none') {
          const qty = parseInt(qtyDisplay.textContent.trim(), 10) || 0;
          const raw = priceEl.textContent.trim();
          const num = raw.match(/[\d,.]+/);
          const price = num ? parseFloat(num[0].replace(/,/g, '')) : 0;
          totalQty += qty;
          totalPrice += price * qty * nights;
        }
      });

      if (totalQty > 0) {
        banner.style.display = 'flex';
        roomCountText.textContent = `${totalQty} room${totalQty > 1 ? 's' : ''} selected`;
        totalPriceEl.textContent = `£${totalPrice.toLocaleString()} Total`;
        const pricePerNight = totalPrice / (nights * totalQty);
        pricePerNightEl.textContent = `£${pricePerNight.toFixed(2)} / night`;
      } else {
        banner.style.display = 'none';
        roomCountText.textContent = '';
        totalPriceEl.textContent = '';
        pricePerNightEl.textContent = '';
      }
    }
  }


  // ✅ Currency value switcher


  window.Webflow ||= [];
  window.Webflow.push(() => {
    // Handle currency dropdown click
    document.querySelectorAll('.currency-dropdown').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedCurrency = item.getAttribute('data-currency');
        const selectedText = item.textContent;

        if (!selectedCurrency) return;

        // Update selected currency text
        const selector = document.querySelector('.selected-currency');
        if (selector) selector.textContent = selectedText;

        // Set active currency on body
        document.body.setAttribute('data-active-currency', selectedCurrency);

        // Update room prices
        updateRoomPrices(selectedCurrency);

        // Close dropdown (Webflow style)
        const dropdown = document.querySelector('[data-currency-selector]');
        if (dropdown && dropdown.classList.contains('w--open')) {
          dropdown.querySelector('.w-dropdown-toggle').click();
        }
      });
    });
  });

  function updateRoomPrices(currency) {
    document.querySelectorAll('.original-price, .current-price').forEach(el => {
      const price = el.getAttribute(`data-price-${currency}`);
      if (!price) return;

      el.textContent = formatCurrency(price, currency);
    });
  }

  function formatCurrency(value, currency) {
    value = parseFloat(value);

    if (currency === 'thb') {
      if (value >= 10000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      return `฿${Math.round(value)}`;
    }

    if (currency === 'idr') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
      return `${Math.round(value / 1000)}K`;
    }

    const currencySymbols = {
      gbp: '£',
      usd: '$',
      eur: '€',
      aud: '$',
      nzd: '$',
    };

    const symbol = currencySymbols[currency] || '';
    return `${symbol}${Math.round(value)}`;
  }




  document.addEventListener('DOMContentLoaded', () => {
    const badges = document.querySelectorAll('.review-badge');
    const reviewSection = document.querySelector('.review-section');

    let hasAtLeastOneReview = false;

    badges.forEach((badge, index) => {
      const countEl = badge.querySelector('.hidden-review-count');
      const visibleCountSpan = badge.querySelector('.review-count');
      const avgRatingEl = badge.querySelector('.dynamic-average-rating');
      const avgRatingTarget = badge.querySelector('.average-rating');
      const reviewString = badge.querySelector('.review-string');

      const rawCount = countEl?.textContent.trim();
      const count = parseInt(rawCount, 10);
      const rawAvg = avgRatingEl?.textContent.trim();

      if (!isNaN(count) && count > 0) {
        visibleCountSpan.textContent = `${count} review${count !== 1 ? 's' : ''}`;
        reviewString?.classList.remove('no-underline');
        badge.style.display = 'inline-flex';
        badge.style.cursor = 'pointer';
        hasAtLeastOneReview = true;

        if (rawAvg && avgRatingTarget) {
          avgRatingTarget.textContent = parseFloat(rawAvg).toFixed(2);
        }

        if (index === 0 && reviewSection) {
          badge.addEventListener('click', () => {
            reviewSection.scrollIntoView({ behavior: 'smooth' });
          });
        }
      } else {
        visibleCountSpan.textContent = 'No reviews yet';
        reviewString?.classList.add('no-underline');
        badge.style.display = 'inline-flex';
        badge.style.cursor = 'default';
      }
    });

    if (!hasAtLeastOneReview && reviewSection) {
      reviewSection.style.display = 'none';
    }
  });





<!-- ✅ Moment Videos  -->


(function() {
  const momentVideos = document.querySelectorAll('.preview-video');
  const momentModal = document.querySelector('.moment-modal');
  const momentModalVideo = document.querySelector('.moment-modal-video');
  const momentCloseBtn = document.querySelector('.moment-close-button');
  const momentSoundToggle = document.querySelector('.moment-sound-toggle');
  const momentLeftArrow = document.querySelector('.moment-arrow-left');
  const momentRightArrow = document.querySelector('.moment-arrow-right');

  let momentCurrentIndex = -1;
  let momentIsMuted = true;
  let momentList = [];
  let playingPreview = null;
  let previewLoopRequest;
  let originalPath = window.location.pathname;

  function loopPreview(video, previewStart, previewEnd) {
    cancelAnimationFrame(previewLoopRequest);
    const loop = () => {
      if (video.currentTime >= previewEnd) {
        video.currentTime = previewStart;
      }
      previewLoopRequest = requestAnimationFrame(loop);
    };
    loop();
  }

  function stopPreview(video) {
    cancelAnimationFrame(previewLoopRequest);
    video.pause();
  }

  momentVideos.forEach((video, index) => {
    momentList.push(video);
    const previewStart = parseFloat(video.dataset.previewStart || 0);
    const previewDuration = parseFloat(video.dataset.previewDuration || 2);
    const previewEnd = previewStart + previewDuration;

    if (index === 0) {
      video.currentTime = previewStart;
      video.play();
      playingPreview = video;
      loopPreview(video, previewStart, previewEnd);
    }

    video.addEventListener('click', () => {
      momentCurrentIndex = index;
      openMoment(video);
      history.pushState(null, '', `/moment/${video.dataset.momentId}`);
    });

    video.addEventListener('mouseenter', () => {
      if (playingPreview && playingPreview !== video) {
        stopPreview(playingPreview);
      }
      video.currentTime = previewStart;
      video.play();
      playingPreview = video;
      loopPreview(video, previewStart, previewEnd);
    });
  });

  function openMoment(video) {
    momentModalVideo.src = video.src;
    momentModalVideo.currentTime = 0;
    momentModalVideo.muted = momentIsMuted;
    momentModalVideo.play();
    momentModal.style.display = 'flex';
    originalPath = window.location.pathname;

    momentLeftArrow.style.opacity = momentCurrentIndex === 0 ? '0.25' : '1';
    momentLeftArrow.style.pointerEvents = momentCurrentIndex === 0 ? 'none' : 'auto';

    momentRightArrow.style.opacity = momentCurrentIndex === momentList.length - 1 ? '0.25' : '1';
    momentRightArrow.style.pointerEvents = momentCurrentIndex === momentList.length - 1 ? 'none' : 'auto';
  }

  function closeMomentModal() {
    momentModal.style.display = 'none';
    momentModalVideo.pause();
    history.pushState(null, '', originalPath);
  }

  momentCloseBtn.addEventListener('click', closeMomentModal);

  momentSoundToggle.addEventListener('click', () => {
    momentIsMuted = !momentIsMuted;
    momentModalVideo.muted = momentIsMuted;
    momentSoundToggle.textContent = momentIsMuted ? '🔇' : '🔊';
  });

  momentLeftArrow.addEventListener('click', () => {
    if (momentCurrentIndex > 0) {
      momentCurrentIndex--;
      openMoment(momentList[momentCurrentIndex]);
      history.pushState(null, '', `/moment/${momentList[momentCurrentIndex].dataset.momentId}`);
    }
  });

  momentRightArrow.addEventListener('click', () => {
    if (momentCurrentIndex < momentList.length - 1) {
      momentCurrentIndex++;
      openMoment(momentList[momentCurrentIndex]);
      history.pushState(null, '', `/moment/${momentList[momentCurrentIndex].dataset.momentId}`);
    }
  });

  momentModalVideo.addEventListener('ended', () => {
    if (momentCurrentIndex < momentList.length - 1) {
      momentCurrentIndex++;
      openMoment(momentList[momentCurrentIndex]);
      history.pushState(null, '', `/moment/${momentList[momentCurrentIndex].dataset.momentId}`);
    } else {
      momentModalVideo.currentTime = 0;
      momentModalVideo.play();
    }
  });

  momentModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('moment-modal')) {
      closeMomentModal();
    }
  });

  window.addEventListener('popstate', () => {
    closeMomentModal();
  });

  momentVideos.forEach(video => {
    video.style.cursor = 'pointer';
  });
})();




<!--Filter For Host Section - show only linked host  -->


  document.addEventListener("DOMContentLoaded", function () {
    const currentHostId = document.getElementById("current-host-id")?.textContent?.trim();
    const userCards = document.querySelectorAll('[data-clerk-id]');

    userCards.forEach(card => {
      const clerkId = card.getAttribute('data-clerk-id');
      if (clerkId !== currentHostId) {
        card.closest('.w-dyn-item').style.display = "none";
      }
    });
  });


<!--Host Joined Date  -->


  document.addEventListener("DOMContentLoaded", function () {
    const joinedEls = document.querySelectorAll(".host-joined-date");

    joinedEls.forEach((el) => {
      const rawDate = new Date(el.textContent.trim());
      if (!isNaN(rawDate)) {
        const options = { month: "short", year: "numeric" };
        const formatted = rawDate.toLocaleDateString("en-GB", options);
        el.textContent = formatted;
      }
    });
  });



<!--Host Average Reviews and Count  -->


  document.addEventListener("DOMContentLoaded", function () {
    function updateReviewText() {
      const summaryEls = document.querySelectorAll(".host-review-summary");

      summaryEls.forEach((el) => {
        const avgEl = el.querySelector(".host-review-average");
        const countEl = el.querySelector(".host-review-count");

        const avg = avgEl?.textContent.trim();
        const count = countEl?.textContent.trim();

        if (avg && count) {
          const countNum = parseInt(count, 10);
          const plural = countNum === 1 ? "review" : "reviews";
          el.textContent = `${avg} ★ · ${count} ${plural}`;
        }
      });
    }

    setTimeout(updateReviewText, 300); 
  });


<!-- ✅ Amenities Section -->


  document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector('.view-full-list-button');
    const amenitiesGrid = document.querySelector('.amenities-grid');

    toggleButton.addEventListener('click', function (e) {
      e.preventDefault();
      amenitiesGrid.classList.toggle('expanded');
      toggleButton.textContent = amenitiesGrid.classList.contains('expanded') 
        ? "Hide amenities" 
        : "View the full list";
    });
  });


  window.initCalendarOverrides = function () {
    const overrideEls = document.querySelectorAll(".calendar-override");
    const overrides = [];

    overrideEls.forEach((el) => {
      const start = el.getAttribute("data-start");
      const end = el.getAttribute("data-end");
      const price = el.getAttribute("data-price");
      const blocked = el.getAttribute("data-blocked") === "true";
      const room = el.getAttribute("data-room");
      const property = el.getAttribute("data-property");

      overrides.push({
        start: start ? new Date(start) : null,
        end: end ? new Date(end) : null,
        price: price ? parseFloat(price) : null,
        blocked,
        room,
        property,
      });
    });

    window.calendarOverrides = overrides;
  };

  window.getCalendarOverrideForDate = function (date, activeRoomName, activePropertyName) {
    if (!window.calendarOverrides) return null;

    return window.calendarOverrides.find((override) => {
      const isWithinRange =
        override.start && override.end && date >= override.start && date <= override.end;

      const roomMatches = override.room === activeRoomName;
      const propertyMatches = override.property === activePropertyName;

      return isWithinRange && (roomMatches || propertyMatches);
    });
  };



  function initCustomCalendar() {
    const container = document.getElementById("calendar-container");
    const modal = document.querySelector("[data-calendar-modal]");
    const openBtn = document.querySelector(".change-dates-button");
    const selectedText = document.querySelector(".selected-dates-text");
    const tooltip = document.getElementById("calendar-range-tooltip");

    let start = null;
    let end = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today.getFullYear(), today.getMonth());

    const basePrice = parseInt(document.querySelector(".calendar-wrapper").getAttribute("data-base-price"));
    const activeRoomName = document.querySelector(".calendar-wrapper").getAttribute("data-room");
    const activePropertyName = document.querySelector(".calendar-wrapper").getAttribute("data-property");

    openBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!modal.contains(e.target) && !openBtn.contains(e.target)) {
        modal.style.display = "none";
      }
    });

    modal.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent closing when clicking inside modal
    });

    function formatDate(date) {
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    }

    function renderCalendar(date) {
      container.innerHTML = "";

      const leftMonth = new Date(date.getFullYear(), date.getMonth());
      const rightMonth = new Date(date.getFullYear(), date.getMonth() + 1);
      const months = [leftMonth, rightMonth];

      const monthWrapper = document.createElement("div");
      monthWrapper.className = "calendar-months";

      months.forEach((monthDate, index) => {
        const monthDiv = document.createElement("div");
        monthDiv.className = "calendar-month";

        const nav = document.createElement("div");
        nav.className = "calendar-nav-header";

        if (index === 0) {
          const prevBtn = document.createElement("button");
          prevBtn.className = "calendar-nav";
          prevBtn.innerHTML = "←";
          prevBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
          });
          nav.appendChild(prevBtn);
        } else {
          nav.appendChild(document.createElement("span"));
        }

        const title = document.createElement("span");
        title.textContent = monthDate.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        });
        nav.appendChild(title);

        if (index === 1) {
          const nextBtn = document.createElement("button");
          nextBtn.className = "calendar-nav";
          nextBtn.innerHTML = "→";
          nextBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
          });
          nav.appendChild(nextBtn);
        } else {
          nav.appendChild(document.createElement("span"));
        }

        const grid = document.createElement("div");
        grid.className = "calendar-grid";
        
        const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
daysOfWeek.forEach((day) => {
  const dayLabel = document.createElement("div");
  dayLabel.className = "calendar-day-label";
  dayLabel.textContent = day;
  grid.appendChild(dayLabel);
});


        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        const startDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
        const offset = (startDay + 6) % 7;

        for (let i = 0; i < offset; i++) {
          const empty = document.createElement("div");
          grid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          const dayEl = document.createElement("div");
          dayEl.className = "calendar-day";
          dayEl.textContent = day;

          const override = window.getCalendarOverrideForDate(d, activeRoomName, activePropertyName);

          const priceEl = document.createElement("div");
          priceEl.className = "calendar-price";

          if (override && override.blocked) {
            dayEl.classList.add("disabled", "blocked");
            priceEl.textContent = "-";
            dayEl.appendChild(priceEl);
            grid.appendChild(dayEl);
            continue;
          }

          if (override && override.price != null) {
            priceEl.textContent = `£${override.price}`;
          } else {
            priceEl.textContent = `£${basePrice}`;
          }

          dayEl.appendChild(priceEl);

          if (d < today) {
            dayEl.classList.add("disabled");
          } else {
            dayEl.addEventListener("click", () => {
              if (!start || (start && end)) {
                start = d;
                end = null;
              } else if (d > start) {
                end = d;
              } else if (d.getTime() === start.getTime()) {
                return;
              }

              renderCalendar(currentDate);

              if (start && end) {
                const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
                selectedText.textContent = `${formatDate(start)} - ${formatDate(end)}`;
                tooltip.textContent = `${nights} night${nights > 1 ? "s" : ""}`;
                tooltip.style.display = "block";
              } else {
                tooltip.style.display = "none";
              }
            });
          }

          if (start && d.getTime() === start.getTime()) {
            dayEl.classList.add("selected");
          }
          if (start && end && d > start && d < end) {
            dayEl.classList.add("in-range");
          }
          if (end && d.getTime() === end.getTime()) {
            dayEl.classList.add("selected");
          }

          grid.appendChild(dayEl);
        }

        monthDiv.appendChild(nav);
        monthDiv.appendChild(grid);
        monthWrapper.appendChild(monthDiv);
      });

      container.appendChild(monthWrapper);
    }

    renderCalendar(currentDate);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof initCalendarOverrides === "function") initCalendarOverrides();
    initCustomCalendar();
  });





//PRICE CALENDAR LOGIC

function initPriceCalendar() {
  const calendar = document.querySelector('.custom-calendar');
  if (!calendar) return;

  const currentDate = new Date();
  const basePrices = JSON.parse(calendar.getAttribute('data-base-prices') || '{}');
  const overrides = JSON.parse(calendar.getAttribute('data-overrides') || '[]');
  const timezoneOffset = currentDate.getTimezoneOffset() * 60000;

  const rooms = Array.from(document.querySelectorAll('[data-room]'));

  function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  function updateCalendarUI() {
    const dateElements = calendar.querySelectorAll('[data-date]');
    dateElements.forEach(dateEl => {
      const dateStr = dateEl.getAttribute('data-date');
      const date = new Date(dateStr);
      const isoDate = new Date(date.getTime() - timezoneOffset).toISOString().split('T')[0];

      const basePrice = basePrices[isoDate];
      const matchingOverrides = overrides.filter(o => o.date === isoDate);

      // --- Handle Base Price
      if (basePrice && !matchingOverrides.some(o => o.overridePrice != null)) {
        const priceEl = document.createElement('div');
        priceEl.className = 'date-price';
        priceEl.textContent = formatPrice(basePrice);
        dateEl.appendChild(priceEl);
      }

      //Apply Overrides
      matchingOverrides.forEach(override => {
        if (override.overridePrice != null) {
          const overridePriceEl = document.createElement('div');
          overridePriceEl.className = 'date-price override';
          overridePriceEl.textContent = formatPrice(override.overridePrice);
          dateEl.appendChild(overridePriceEl);
        }

        // If date is blocked or availability = 0, hide matching rooms
        if (override.blocked || override.availability === 0) {
          rooms.forEach(roomEl => {
            const roomSlug = roomEl.getAttribute('data-room');
            const linkedRooms = override.rooms || [];
            if (linkedRooms.includes(roomSlug)) {
              roomEl.style.display = 'none';
            }
          });
        }
      });
    });
  }

  updateCalendarUI();
}

document.addEventListener('DOMContentLoaded', () => {
  initPriceCalendar();
});




//SELECTED DATE INIT LOGIC

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function updateSelectedDatesUI(checkin, checkout) {
  const textEl = document.querySelector('.selected-dates-text');
  if (checkin && checkout) {
    const formatted = `${formatDisplayDate(checkin)} - ${formatDisplayDate(checkout)}`;
    textEl.textContent = formatted;
  } else {
    textEl.textContent = 'Please select dates';
  }
}

function initSelectedDatesFromURLOrStorage() {
  let checkin = getQueryParam('checkin');
  let checkout = getQueryParam('checkout');

  if (!checkin || !checkout) {
    checkin = localStorage.getItem('checkin');
    checkout = localStorage.getItem('checkout');
  } else {
    localStorage.setItem('checkin', checkin);
    localStorage.setItem('checkout', checkout);
  }

  updateSelectedDatesUI(checkin, checkout);
}

document.addEventListener('DOMContentLoaded', initSelectedDatesFromURLOrStorage);

});
