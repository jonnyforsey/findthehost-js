console.log("[findthehost.js] Script loaded - latest");

document.addEventListener("DOMContentLoaded", function () {
  // Gallery Script

  // Master Script Setup
  window.Webflow ||= [];
  window.Webflow.push(() => {
    setTimeout(() => {
      initImageGallery();
      initHighlightModal();
      initQtySelector();
      initStickyBanner();
      initCustomCalendar();
    }, 200);
  });

  const PROPERTY_BASE_URL = "/stay/united-kingdom-falmouth-thetis-place";

  // --------------------- Gallery --------------------- //
  function initImageGallery() {
    const urlsText = document.querySelector(".gallery-image-urls");
    if (!urlsText) return;
    const urls = urlsText.textContent.split(",").map(u => u.trim()).filter(Boolean);

    const mainWrapper = document.querySelector(".main-image-wrapper");
    const sideWrapper = document.querySelector(".side-images-wrapper");

    if (!mainWrapper || !sideWrapper) return;

    mainWrapper.innerHTML = "";
    sideWrapper.innerHTML = "";

    if (urls.length === 0) return;

    const mainImg = document.createElement("img");
    mainImg.src = urls[0];
    mainImg.style = "width: 100%; height: 100%; object-fit: cover; border-radius: 12px; cursor: pointer;";
    mainWrapper.appendChild(mainImg);

    urls.slice(1, 5).forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.style = "width: 100%; height: 100%; object-fit: cover; border-radius: 12px; cursor: pointer;";
      const div = document.createElement("div");
      div.className = "gallery-side-image";
      div.style.overflow = "hidden";
      div.appendChild(img);
      sideWrapper.appendChild(div);
    });

    document.querySelectorAll(".main-image-wrapper img, .side-images-wrapper img").forEach(img => {
      img.addEventListener("click", () => openGalleryOverview(urls));
    });

    handleInitialURL(urls);
  }

  function openGalleryOverview(urls) {
    const gridModal = document.querySelector(".gallery-grid-modal");
    const gridContent = gridModal.querySelector(".grid-content");
    const imageCountEl = gridModal.querySelector(".image-count");
    const backdrop = document.querySelector(".modal-backdrop");

    gridContent.innerHTML = "";
    imageCountEl.textContent = `${urls.length} image${urls.length === 1 ? "" : "s"}`;

    urls.forEach((url, index) => {
      const thumb = document.createElement("img");
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
      thumb.addEventListener("mouseover", () => thumb.style.transform = "scale(1.05)");
      thumb.addEventListener("mouseout", () => thumb.style.transform = "scale(1)");
      thumb.addEventListener("click", () => {
        gridModal.classList.remove("active");
        backdrop.classList.remove("active");
        document.body.classList.remove("modal-open");
        openCarousel(urls, index);
      });
      gridContent.appendChild(thumb);
    });

    gridModal.classList.add("active");
    backdrop.classList.add("active");
    document.body.classList.add("modal-open");

    history.pushState({ modal: "grid" }, "", `${PROPERTY_BASE_URL}/image-grid`);
  }

  function openCarousel(urls, startIndex = 0) {
    const carouselModal = document.querySelector(".gallery-carousel-modal");
    const carouselImage = carouselModal.querySelector(".carousel-image");
    const currentIndexEl = carouselModal.querySelector(".current-index");
    const totalCountEl = carouselModal.querySelector(".total-count");
    const countHeader = carouselModal.querySelector(".image-count");
    const backdrop = document.querySelector(".modal-backdrop");

    let currentIndex = startIndex;

    totalCountEl.textContent = urls.length;
    countHeader.textContent = `${urls.length} image${urls.length === 1 ? "" : "s"}`;

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

    carouselModal.classList.add("active");
    backdrop.classList.add("active");
    document.body.classList.add("modal-open");

    carouselModal.querySelector(".carousel-prev").onclick = () => {
      currentIndex = (currentIndex - 1 + urls.length) % urls.length;
      updateImage();
    };

    carouselModal.querySelector(".carousel-next").onclick = () => {
      currentIndex = (currentIndex + 1) % urls.length;
      updateImage();
    };
  }

  function closeAllModals() {
    document.querySelector(".gallery-grid-modal").classList.remove("active");
    document.querySelector(".gallery-carousel-modal").classList.remove("active");
    document.querySelector(".modal-backdrop").classList.remove("active");
    document.body.classList.remove("modal-open");
    history.pushState({}, "", PROPERTY_BASE_URL);
  }

  document.querySelectorAll("[data-close-gallery]").forEach(el =>
    el.addEventListener("click", closeAllModals)
  );
  document.querySelectorAll("[data-close-carousel]").forEach(el =>
    el.addEventListener("click", closeAllModals)
  );

  window.addEventListener("popstate", (event) => {
    const urlsText = document.querySelector(".gallery-image-urls");
    const urls = urlsText?.textContent.split(",").map(u => u.trim()).filter(Boolean) || [];
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

  // --------------------- Calendar Modal --------------------- //
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

    const wrapper = document.querySelector(".calendar-wrapper");
    const basePrice = parseInt(wrapper?.getAttribute("data-base-price") || "0");
    const activeRoomName = wrapper?.getAttribute("data-room");
    const activePropertyName = wrapper?.getAttribute("data-property");

    openBtn?.addEventListener("click", () => {
      modal.style.display = "block";
      container.innerHTML = "";
      renderCalendar(currentDate);
    });

    document.addEventListener("click", (e) => {
      if (!modal.contains(e.target) && !openBtn.contains(e.target)) {
        modal.style.display = "none";
      }
    });

    modal.addEventListener("click", (e) => {
      e.stopPropagation();
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

        const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
        const offset = (firstDay + 6) % 7;
        for (let i = 0; i < offset; i++) {
          const empty = document.createElement("div");
          empty.className = "calendar-day empty";
          grid.appendChild(empty);
        }

        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          const cell = document.createElement("div");
          cell.className = "calendar-day";
          cell.textContent = day;

          if (dateObj < today) {
            cell.classList.add("disabled");
          }

          cell.addEventListener("click", () => {
            console.log("Clicked date:", dateObj);
            if (!start || (start && end)) {
              start = dateObj;
              end = null;
              selectedText.textContent = formatDate(start);
            } else if (start && !end) {
              if (dateObj >= start) {
                end = dateObj;
                selectedText.textContent = `${formatDate(start)} - ${formatDate(end)}`;
              } else {
                start = dateObj;
                selectedText.textContent = formatDate(start);
              }
            }
          });

          grid.appendChild(cell);
        }

        monthDiv.appendChild(nav);
        monthDiv.appendChild(grid);
        monthWrapper.appendChild(monthDiv);
      });

      container.appendChild(monthWrapper);
    }
  }
});
