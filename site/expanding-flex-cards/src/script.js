// Generate a 15-day gallery, paginate 5 cards per page, and add nav
(function(){
  const images = [
    "Day 7 nuwara eliya.jpg",
    "Day 8 Ramboda.jpg",
    "Day 9 Kandy.jpg",
    "Day 10 & 19 Girithale.jpg",
    "Day 12 Sigiriya.jpg",
    "Day 13 Polonnaruwa.jpg",
    "Day 14 & 15 Negambo.jpg",
    "Grand-Tour.jpeg"
  ];

  const icons = [
    "fas fa-walking",
    "fas fa-mountain",
    "fas fa-tree",
    "fas fa-tint",
    "fas fa-sun",
    "fas fa-bicycle",
    "fas fa-umbrella-beach",
    "fas fa-route"
  ];

  const days = Array.from({ length: 15 }, (_, i) => {
    const dayNumber = i + 1;
    const img = images[i % images.length];
    const icon = icons[i % icons.length];
    return {
      title: `Day ${dayNumber}`,
      subtitle: "Highlights",
      imagePath: `./images/${img}`,
      icon
    };
  });

  const pageSize = 5;
  const numPages = Math.ceil(days.length / pageSize);
  const track = document.getElementById("galleryTrack");
  const dotsContainer = document.getElementById("galleryDots");

  function createCard(item, isActive){
    const card = document.createElement("div");
    card.className = `option${isActive ? " active" : ""}`;
    card.setAttribute("style", `--optionBackground:url('${item.imagePath}');`);
    card.innerHTML = `
      <div class="shadow"></div>
      <div class="label">
         <div class="icon"><i class="${item.icon}"></i></div>
         <div class="info">
            <div class="main">${item.title}</div>
            <div class="sub">${item.subtitle}</div>
         </div>
      </div>
    `;
    return card;
  }

  // Build pages
  const pages = [];
  for (let p = 0; p < numPages; p++) {
    const page = document.createElement("div");
    page.className = "page";

    const options = document.createElement("div");
    options.className = "options";

    const sliceStart = p * pageSize;
    const slice = days.slice(sliceStart, sliceStart + pageSize);
    slice.forEach((item, idx) => {
      options.appendChild(createCard(item, idx === 0));
    });

    page.appendChild(options);
    track.appendChild(page);
    pages.push(page);
  }

  // Activate cards within their own page
  document.addEventListener("click", function(e){
    const option = e.target.closest(".option");
    if (!option) return;
    const options = option.parentElement;
    if (!options || !options.classList.contains("options")) return;
    options.querySelectorAll(".option.active").forEach(el => el.classList.remove("active"));
    option.classList.add("active");
  });

  // Dots
  const dots = [];
  for (let i = 0; i < numPages; i++) {
    const dot = document.createElement("div");
    dot.className = `dot${i === 0 ? " active" : ""}`;
    dot.setAttribute("role", "button");
    dot.setAttribute("aria-label", `Go to page ${i+1}`);
    dot.addEventListener("click", () => scrollToPage(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  function setActiveDot(i){
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  }

  // Prev/Next buttons
  const prevBtn = document.querySelector('.nav.prev');
  const nextBtn = document.querySelector('.nav.next');
  let currentPage = 0;

  function pageLeftOffset(i){
    return pages[i].offsetLeft;
  }

  function scrollToPage(i){
    if (i < 0) i = 0;
    if (i > numPages - 1) i = numPages - 1;
    currentPage = i;
    track.scrollTo({ left: pageLeftOffset(i), behavior: 'smooth' });
    setActiveDot(i);
  }

  prevBtn.addEventListener('click', () => scrollToPage(currentPage - 1));
  nextBtn.addEventListener('click', () => scrollToPage(currentPage + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { scrollToPage(currentPage - 1); }
    if (e.key === 'ArrowRight') { scrollToPage(currentPage + 1); }
  });

  // Update current page while scrolling (snap end)
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const left = track.scrollLeft;
      let nearestIndex = 0;
      let bestDist = Infinity;
      pages.forEach((p, idx) => {
        const dist = Math.abs(p.offsetLeft - left);
        if (dist < bestDist) { bestDist = dist; nearestIndex = idx; }
      });
      currentPage = nearestIndex;
      setActiveDot(currentPage);
    }, 120);
  });
})();
