// ===== Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyBhpABmtMs7AcTanSaw6j97PTKSgvumbjw",
  authDomain: "banya-podols.firebaseapp.com",
  projectId: "banya-podols",
  storageBucket: "banya-podols.firebasestorage.app",
  messagingSenderId: "1009856434300",
  appId: "1:1009856434300:web:839aa9584bd3843752b9f9",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== Состояние =====
let state = { checkIn: null, checkOut: null, guests: 1, children: 0 };
let bookingType = null;
let blockedDates = [];
let activeDateField = null;
let currentCollageIndex = 0;
let currentPhotoInCollage = 0;
let galleryPhotos = [];
let currentPhotoIndex = 0;
let globalPhotoIndex = 0;

const ADMIN_PASSWORD = "admin123";
const MAX_YEAR = 2026;

// ===== Данные галереи =====
const galleryData = [
  {
    title: "Банный комплекс",
    photos: [
      { src: "images/main-1.jpg", alt: "Главное фото бани" },
      { src: "images/parnaya.jpg", alt: "Парная" },
      { src: "images/room.jpg", alt: "Комната отдыха" },
      { src: "images/pool.jpg", alt: "Бассейн" },
    ],
  },
  {
    title: "Интерьер дома",
    photos: [
      { src: "images/int1.webp", alt: "Кухня" },
      { src: "images/int2.webp", alt: "Спальня" },
      { src: "images/int3.jpg", alt: "Ванная" },
      { src: "images/int4.webp", alt: "Гостиная" },
    ],
  },
  {
    title: "Территория участка",
    photos: [
      { src: "images/terr1.webp", alt: "Двор" },
      { src: "images/terr2.webp", alt: "Мангал" },
      { src: "images/terr3.webp", alt: "Парковка" },
      { src: "images/terr4.webp", alt: "Сад" },
    ],
  },
];

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

// ===== Галерея =====
function displayCurrentPhoto() {
  const container = document.getElementById("gallerySliderSingleImg");
  const counter = document.getElementById("gallerySliderSingleCounter");
  const titleElement = document.getElementById("collageTitle");
  if (!container || !counter || !titleElement) return;

  const collage = galleryData[currentCollageIndex];
  const photo = collage.photos[currentPhotoInCollage];

  titleElement.textContent = collage.title;
  container.innerHTML = `<img src="${photo.src}" alt="${photo.alt}">`;
  counter.textContent = `${currentPhotoInCollage + 1} / ${collage.photos.length}`;
  globalPhotoIndex = galleryPhotos.indexOf(photo.src);
  updateCollageDots();

  container.style.animation = "none";
  setTimeout(() => (container.style.animation = "fadeIn 0.3s ease"), 10);
}

function changePhotoInCollage(direction) {
  const collage = galleryData[currentCollageIndex];
  currentPhotoInCollage =
    (currentPhotoInCollage + direction + collage.photos.length) %
    collage.photos.length;
  displayCurrentPhoto();
}

function changeCollage(direction) {
  currentCollageIndex =
    (currentCollageIndex + direction + galleryData.length) % galleryData.length;
  currentPhotoInCollage = 0;
  displayCurrentPhoto();
}

function goToCollage(index) {
  currentCollageIndex = index;
  currentPhotoInCollage = 0;
  displayCurrentPhoto();
}

function updateCollageDots() {
  const dotsContainer = document.getElementById("collageDots");
  if (!dotsContainer) return;

  dotsContainer.innerHTML = "";
  galleryData.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("collage-dot");
    if (index === currentCollageIndex) dot.classList.add("active");
    dot.addEventListener("click", () => goToCollage(index));
    dotsContainer.appendChild(dot);
  });
}

function initGallery() {
  galleryPhotos = galleryData.flatMap((c) => c.photos.map((p) => p.src));
  displayCurrentPhoto();
}

// ===== Модалка фото =====
function openPhotoModal(index) {
  currentPhotoIndex = index >= 0 ? index : globalPhotoIndex;
  updateModalImage();

  const modal = document.getElementById("photoModal");
  if (!modal) return;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePhotoModal() {
  const modal = document.getElementById("photoModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function updateModalImage() {
  const modalImage = document.getElementById("modalImage");
  const photoCounter = document.getElementById("photoCounter");
  if (!modalImage || !photoCounter) return;

  modalImage.src = galleryPhotos[currentPhotoIndex];
  photoCounter.textContent = `${currentPhotoIndex + 1} / ${galleryPhotos.length}`;
}

function changePhoto(direction) {
  currentPhotoIndex =
    (currentPhotoIndex + direction + galleryPhotos.length) %
    galleryPhotos.length;
  updateModalImage();
}

// ===== Утилиты дат =====
function formatDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function parseDate(dateString) {
  const parts = dateString.split(".");
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function isTodayDate(date) {
  return date.toDateString() === new Date().toDateString();
}

function isSelectedDate(date) {
  if (!state.checkIn && !state.checkOut) return false;
  const dateString = formatDate(date);
  return dateString === state.checkIn || dateString === state.checkOut;
}

function isInRangeDate(date) {
  if (!state.checkIn || !state.checkOut) return false;
  const dateTime = date.getTime();
  return (
    dateTime > parseDate(state.checkIn).getTime() &&
    dateTime < parseDate(state.checkOut).getTime()
  );
}

function checkBlockedDatesBetween(startStr, endStr) {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  let current = new Date(start);

  while (current < end) {
    if (blockedDates.includes(formatDate(current))) return true;
    current = new Date(current.getTime() + 86400000);
  }
  return false;
}

// ===== Календарь =====
function getValidYearMonth(year, month) {
  const today = new Date();
  if (year > MAX_YEAR) return { year: MAX_YEAR, month: 11 };
  if (year < today.getFullYear())
    return { year: today.getFullYear(), month: today.getMonth() };
  return { year, month };
}

function renderCalendarToContainer(container, year, month, isMobile = false) {
  if (!container) return;

  const valid = getValidYearMonth(year, month);
  year = valid.year;
  month = valid.month;

  const firstDay = new Date(year, month, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDay.getDay();

  const changeMonthFunc = isMobile ? "changeMobileMonth" : "changeMonth";

  let html = `
    <div class="calendar-header">
      <button onclick="${changeMonthFunc}(${year}, ${month}, -1)"><i class="fas fa-chevron-left"></i></button>
      <h3>${MONTHS[month]} ${year}</h3>
      <button onclick="${changeMonthFunc}(${year}, ${month}, 1)"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="calendar-weekdays">
      <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
    </div>
    <div class="calendar-days">
  `;

  for (let i = 0; i < startingDay; i++)
    html += '<div class="calendar-day"></div>';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);
    let className = "calendar-day";

    if (isTodayDate(date)) className += " today";
    if (date < now) className += " past";
    else if (blockedDates.includes(dateString)) className += " blocked";
    if (isSelectedDate(date)) className += " selected";
    if (isInRangeDate(date)) className += " in-range";

    const isDisabled = date < now || blockedDates.includes(dateString);
    html += `<div class="${className}"${isDisabled ? "" : ` onclick="selectDate('${dateString}')"`}>${day}</div>`;
  }

  container.innerHTML = html + "</div>";
}

function renderCalendar(year, month) {
  const calendar =
    document.getElementById("calendar") ||
    document.getElementById("mobileCalendar");
  renderCalendarToContainer(calendar, year, month, false);
}

function renderMobileCalendar() {
  const container = document.getElementById("mobileCalendar");
  if (!container) return;

  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  if (state.checkIn) {
    const parts = state.checkIn.split(".");
    year = parseInt(parts[2]);
    month = parseInt(parts[1]) - 1;
  }

  renderCalendarToContainer(container, year, month, true);
}

function changeMobileMonth(year, month, delta) {
  const newDate = new Date(year, month + delta, 1);
  if (
    newDate.getFullYear() > MAX_YEAR ||
    (newDate.getFullYear() === MAX_YEAR && newDate.getMonth() > 11)
  )
    return;

  const container = document.getElementById("mobileCalendar");
  renderCalendarToContainer(
    container,
    newDate.getFullYear(),
    newDate.getMonth(),
    true,
  );
}

function initCalendar() {
  const today = new Date();
  renderCalendar(today.getFullYear(), today.getMonth());
}

function changeMonth(year, month, delta) {
  const newDate = new Date(year, month + delta, 1);
  if (
    newDate.getFullYear() > MAX_YEAR ||
    (newDate.getFullYear() === MAX_YEAR && newDate.getMonth() > 11)
  )
    return;
  renderCalendar(newDate.getFullYear(), newDate.getMonth());
}

function refreshCalendars() {
  if (state.checkIn) {
    const parts = state.checkIn.split(".");
    renderCalendar(parseInt(parts[2]), parseInt(parts[1]) - 1);
    renderMobileCalendar();
  } else {
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());
    renderMobileCalendar();
  }
}

function selectDate(dateString) {
  const date = parseDate(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now || blockedDates.includes(dateString)) return;

  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");

  if (bookingType === "hourly") {
    if (state.checkIn === dateString) {
      state.checkIn = null;
      checkIn.value = "";
      refreshCalendars();
      return;
    }
    state.checkIn = dateString;
    state.checkOut = null;
    checkIn.value = dateString;
    checkOut.value = "";
  } else if (!state.checkIn || (state.checkIn && state.checkOut)) {
    if (state.checkIn === dateString) {
      state.checkIn = null;
      state.checkOut = null;
      checkIn.value = "";
      checkOut.value = "";
      refreshCalendars();
      return;
    }
    state.checkIn = dateString;
    state.checkOut = null;
    checkIn.value = dateString;
    checkOut.value = "";
  } else if (state.checkIn && !state.checkOut) {
    const checkInDate = parseDate(state.checkIn);
    if (dateString === state.checkIn) {
      state.checkIn = null;
      checkIn.value = "";
      refreshCalendars();
      return;
    }
    if (date <= checkInDate) {
      state.checkIn = dateString;
      checkIn.value = dateString;
    } else {
      if (checkBlockedDatesBetween(state.checkIn, dateString)) {
        alert("В выбранном диапазоне есть заблокированная дата");
        return;
      }
      state.checkOut = dateString;
      checkOut.value = dateString;
    }
  }

  refreshCalendars();
}

// ===== Мобильный календарь =====
function openMobileCalendar(fieldId) {
  activeDateField = fieldId;
  const modal = document.getElementById("mobileCalendarModal");
  if (!modal) return;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  renderMobileCalendar();
}

function closeMobileCalendar() {
  const modal = document.getElementById("mobileCalendarModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function selectMobileDate(dateString) {
  const date = parseDate(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now || blockedDates.includes(dateString)) return;

  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");

  if (activeDateField === "checkOut") {
    if (!state.checkIn) {
      alert("Сначала выберите дату заезда");
      closeMobileCalendar();
      return;
    }
    if (dateString <= state.checkIn) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }
    if (checkBlockedDatesBetween(state.checkIn, dateString)) {
      alert("В выбранном диапазоне есть заблокированная дата");
      return;
    }
    state.checkOut = dateString;
    checkOut.value = dateString;
  } else {
    state.checkIn = dateString;
    state.checkOut = null;
    checkIn.value = dateString;
    checkOut.value = "";
  }

  if (state.checkIn) {
    const parts = state.checkIn.split(".");
    renderCalendar(parseInt(parts[2]), parseInt(parts[1]) - 1);
  }
  closeMobileCalendar();
}

// ===== Бронирование =====
function selectBookingType(type) {
  bookingType = type;

  const selector = document.getElementById("bookingTypeSelector");
  const wrapper = document.getElementById("bookingCalendarWrapper");
  const formTitle = document.getElementById("bookingFormTitle");
  const checkOutField = document.getElementById("checkOutField");
  const hoursField = document.getElementById("hoursField");
  const calendarHint = document.getElementById("calendarHint");
  const servicesSection = document.getElementById("services");
  const tooltip = document.getElementById("whatYouGetTooltip");

  selector.style.animation = "fadeOut 0.3s ease forwards";

  setTimeout(() => {
    selector.style.display = "none";
    wrapper.style.display = "grid";
    wrapper.style.animation = "slideApart 0.6s ease";
    if (servicesSection) servicesSection.style.display = "block";

    if (type === "daily") {
      formTitle.textContent = "Посуточная аренда";
      checkOutField.style.display = "flex";
      hoursField.style.display = "none";
      calendarHint.textContent = "Нажмите на дату заезда, затем на дату выезда";
      tooltip.innerHTML = `
        <strong>В базовую стоимость входит:</strong><br />
        • Ухоженная територия 4 сотки <br>
        • Три парковочных места за територией <br>    
        • Мангальная зона с навесом <br>
        • Скамейка-качеля на 3 мест <br>
        • Уютный, теплый, двухэтажный просторный дом-баня: <br>
          - праздничный стол на 8 человек; <br>
          - музыка по bluetooth; <br>
          - телевизор (триколор); <br>
          - три спальные комнаты (2 этаж); <br>
          - раскладной диван 160х200см (1 этаж); <br>
          - постельное белье; <br>
          - полотенца; <br>
          - туалетная комната; <br>
          - душевая комната. <br>
      `;
    } else {
      formTitle.textContent = "Почасовая аренда";
      checkOutField.style.display = "none";
      hoursField.style.display = "flex";
      calendarHint.textContent = "Выберите один день";
      state.checkOut = null;
      document.getElementById("checkOut").value = "";
      tooltip.innerHTML = `
        <strong>В стоимость входит:</strong><br>
        • Ухоженная територия 4 сотки; <br>
        • Три парковочных места за територией; <br>
        • Мангальная зона с навесом; <br>
        • Скамейка-качеля на 3 мест; <br>
        • Уютный, теплый, двухэтажный просторный дом-баня: <br>
        - праздничный стол на 8 человек; <br>
        - музыка по bluetooth; <br>
        - телевизор (триколор); <br>
        - туалетная и душевая комнаты. <br>
        - джакузи с гидромассажем. <br>
        - бассейн. <br>
        - обливное устройство. <br>
      `;
    }

    initCalendar();
    wrapper.scrollIntoView({ behavior: "smooth", block: "end" });
  }, 300);
}

function calculatePrice(shouldScroll = true) {
  const guests = parseInt(document.getElementById("guestsCount").value);
  const children = parseInt(document.getElementById("childrenCount").value);

  let totalPrice = 0;
  let periodText = "";
  let basePriceText = "";

  if (bookingType === "daily") {
    if (!state.checkIn || !state.checkOut)
      return alert("Пожалуйста, выберите даты заезда и выезда");

    const days = Math.ceil(
      (parseDate(state.checkOut) - parseDate(state.checkIn)) / 86400000,
    );
    if (days <= 0) return alert("Дата выезда должна быть позже даты заезда");

    let dailyPrice = 17500;
    if (guests >= 3) dailyPrice += (guests - 2) * 1600;

    totalPrice = dailyPrice * days;
    if (days >= 3) totalPrice -= 3000;

    periodText = `${state.checkIn} — ${state.checkOut} (${days} нч.)`;
    basePriceText = `${dailyPrice}₽/сутки`;
  } else if (bookingType === "hourly") {
    if (!state.checkIn) return alert("Пожалуйста, выберите дату");

    const hours = parseInt(document.getElementById("hoursCount").value);
    const hourlyPrice = guests <= 6 ? 3500 : 4000;

    totalPrice = hourlyPrice * hours;
    periodText = `${state.checkIn} (${hours} ч.)`;
    basePriceText = `${hourlyPrice}₽/час (${guests <= 6 ? "до 6 гостей" : "7-8 гостей"})`;
  } else {
    return alert("Выберите тип аренды");
  }

  let extraPrice = 0;
  const extraList = [];

  document.querySelectorAll(".extra-service:checked").forEach((s) => {
    const price = parseInt(s.value);
    extraPrice += price;
    extraList.push(`${s.dataset.name} (${price}₽)`);
  });

  document.querySelectorAll(".service-card[data-price]").forEach((card) => {
    const count = parseInt(
      card.querySelector(".counter-value")?.textContent || "0",
    );
    if (count > 0) {
      const price = parseInt(card.dataset.price) * count;
      extraPrice += price;
      extraList.push(
        `${card.querySelector("h3").textContent} × ${count} (${price}₽)`,
      );
    }
  });

  document.querySelectorAll(".service-checkbox:checked").forEach((s) => {
    const price = parseInt(s.value);
    extraPrice += price;
    extraList.push(
      `${s.closest(".service-card").querySelector("h3").textContent} (${price}₽)`,
    );
  });

  totalPrice += extraPrice;

  const resultDiv = document.getElementById("priceResult");
  resultDiv.classList.add("active");
  resultDiv.innerHTML = `
    <h3>Расчёт стоимости:</h3>
    <p><strong>Тип аренды:</strong> ${bookingType === "daily" ? "Посуточно" : "Почасовое"}</p>
    <p><strong>Даты:</strong> ${periodText}</p>
    <p><strong>Гости:</strong> ${guests} взрослых + ${children} детей (бесплатно)</p>
    <p><strong>Базовая стоимость:</strong> ${basePriceText}</p>
    ${extraList.length ? `<p><strong>Дополнительно:</strong> ${extraList.join(", ")} = ${extraPrice}₽</p>` : ""}
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; margin-top: 20px;">
      <h2 style="color: #FF5A5F; margin: 0;">Итого: ${totalPrice}₽</h2>
      <button class="btn-payment" onclick="openPaymentModal(${totalPrice})">
        <i class="fas fa-credit-card"></i> Забронировать
        <span class="lava-particle"></span>
        <span class="lava-particle"></span>
        <span class="lava-particle"></span>
        <span class="lava-particle"></span>
        <span class="lava-particle"></span>
      </button>
    </div>
  `;

  if (shouldScroll) {
    setTimeout(() => {
      const payBtn = resultDiv.querySelector(".btn-payment");
      if (payBtn)
        payBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }
}

function autoUpdatePrice() {
  const wrapper = document.getElementById("bookingCalendarWrapper");
  if (!wrapper || wrapper.style.display === "none") return;
  if (!state.checkIn) return;
  calculatePrice(false);
}

// ===== Навигация и скролл =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset =
        target.getBoundingClientRect().top + window.pageYOffset - 160;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  });
}

function scrollToBooking() {
  const el = document.getElementById("booking");
  if (!el) return;
  const offset = el.getBoundingClientRect().top + window.pageYOffset - 100;
  window.scrollTo({ top: offset, behavior: "smooth" });
}

function initHeaderScroll() {
  const header = document.querySelector(".header");
  window.addEventListener(
    "scroll",
    () => {
      const scrolled = window.pageYOffset > 30;
      header?.classList.toggle("scrolled", scrolled);
      document.body.classList.toggle("scrolled", scrolled);
    },
    { passive: true },
  );
}

// ===== Услуги =====
function changeServiceCount(btn, delta) {
  const card = btn.closest(".service-card");
  const valueEl = card.querySelector(".counter-value");
  let count = Math.max(0, Math.min(5, parseInt(valueEl.textContent) + delta));
  valueEl.textContent = count;
  card.style.border = count > 0 ? "2px solid var(--primary)" : "none";
  autoUpdatePrice();
}

function goBackToTypeSelector() {
  const selector = document.getElementById("bookingTypeSelector");
  const wrapper = document.getElementById("bookingCalendarWrapper");
  const servicesSection = document.getElementById("services");

  wrapper.style.animation = "fadeOut 0.3s ease forwards";

  setTimeout(() => {
    wrapper.style.display = "none";
    wrapper.style.animation = "";
    if (servicesSection) servicesSection.style.display = "none";
    selector.style.display = "flex";
    selector.style.animation = "fadeIn 0.3s ease";

    bookingType = null;
    state.checkIn = null;
    state.checkOut = null;
    document.getElementById("checkIn").value = "";
    document.getElementById("checkOut").value = "";
    document.getElementById("priceResult").classList.remove("active");
    document.getElementById("priceResult").innerHTML = "";
    document
      .querySelectorAll(".counter-value")
      .forEach((el) => (el.textContent = "0"));
    document
      .querySelectorAll(".service-card")
      .forEach((card) => (card.style.border = "none"));
    document
      .querySelectorAll(".service-checkbox, .extra-service")
      .forEach((cb) => (cb.checked = false));
  }, 300);
}

// ===== Яндекс.Карта =====
function initYandexMap() {
  if (typeof ymaps === "undefined") return;
  ymaps.ready(() => {
    const el = document.getElementById("yandex-map");
    if (!el) return;
    const coords = [55.440366, 37.554479];
    const map = new ymaps.Map("yandex-map", {
      center: coords,
      zoom: 19,
      controls: ["zoomControl", "fullscreenControl"],
    });
    const placemark = new ymaps.Placemark(
      coords,
      {
        hintContent: "Дом-баня в Подольске",
        balloonContent: `<strong>Дом-баня в Подольске</strong><br>Московская обл., Подольск, Овражный тупик<br><a href="tel:+79001234567">+7 (900) 123-45-67</a>`,
      },
      {
        iconLayout: "default#image",
        iconImageHref: "https://img.icons8.com/color/48/000000/marker.png",
        iconImageSize: [40, 40],
        iconImageOffset: [-20, -40],
      },
    );
    map.geoObjects.add(placemark);
  });
}

// ===== Ввод даты =====
function autoFormatDate(input) {
  let value = input.value.replace(/[^\d.]/g, "");
  value = value.replace(/\.+/g, ".");
  if (value.startsWith(".")) value = value.slice(1);
  if (value.length > 10) value = value.slice(0, 10);

  const digitsOnly = value.replace(/\./g, "");
  if (digitsOnly.length > 2 && !value.includes(".")) {
    value = digitsOnly.slice(0, 2) + "." + digitsOnly.slice(2);
  }
  if (digitsOnly.length > 4 && value.split(".").length === 2) {
    value =
      digitsOnly.slice(0, 2) +
      "." +
      digitsOnly.slice(2, 4) +
      "." +
      digitsOnly.slice(4);
  }

  input.value = value;
}

function validateDateInput(input) {
  const value = input.value.trim();
  if (!value) return;

  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    alert("Введите дату в формате ДД.ММ.ГГГГ");
    input.value = "";
    return;
  }

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  if (year > MAX_YEAR)
    return (
      alert("Бронирование доступно только до конца 2026 года"),
      (input.value = "")
    );
  if (month < 1 || month > 12)
    return (alert("Неверный месяц"), (input.value = ""));

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth)
    return (alert("Неверный день"), (input.value = ""));

  const date = new Date(year, month - 1, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now)
    return (alert("Нельзя выбрать прошедшую дату"), (input.value = ""));
  if (date > new Date(MAX_YEAR, 11, 31))
    return (
      alert("Бронирование доступно только до конца 2026 года"),
      (input.value = "")
    );

  const dateString = formatDate(date);

  if (blockedDates.includes(dateString))
    return (alert("Эта дата заблокирована"), (input.value = ""));

  if (input.id === "checkIn") {
    state.checkIn = dateString;
  } else if (input.id === "checkOut") {
    if (bookingType === "hourly")
      return (
        alert("При почасовой аренде дата выезда не нужна"),
        (input.value = "")
      );
    if (state.checkIn && dateString <= state.checkIn)
      return (
        alert("Дата выезда должна быть позже даты заезда"),
        (input.value = "")
      );
    if (state.checkIn && checkBlockedDatesBetween(state.checkIn, dateString))
      return (
        alert("В выбранном диапазоне есть заблокированная дата"),
        (input.value = "")
      );
    state.checkOut = dateString;
  }

  const currentDate = new Date();
  renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// ===== Отправка заявки =====
function submitOrder() {
  const name = document.getElementById("paymentName").value.trim();
  const phone = document.getElementById("paymentPhone").value.trim();
  const btn = document.getElementById("submitOrderBtn");

  if (!name) return alert("Введите ваше имя");
  if (!phone) return alert("Введите ваш телефон");

  btn.classList.add("loading");
  btn.disabled = true;

  const totalPrice =
    document.querySelector(".payment-order-summary strong")?.textContent ||
    "Не указана";

  const formData = {
    name,
    phone,
    price: totalPrice,
    dates: `${state.checkIn}${state.checkOut ? " — " + state.checkOut : ""}`,
    guests: `${state.guests} взрослых + ${state.children} детей`,
    type: bookingType === "daily" ? "Посуточно" : "Почасовое",
    hours:
      bookingType === "hourly"
        ? document.getElementById("hoursCount").value
        : "-",
  };

  fetch("https://formspree.io/f/mkjwadey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (response.ok) showPaymentSuccess();
      else alert("Ошибка отправки. Попробуйте ещё раз.");
    })
    .catch(() => alert("Ошибка отправки. Попробуйте ещё раз."))
    .finally(() => {
      btn.classList.remove("loading");
      btn.disabled = false;
    });
}

function showPaymentSuccess() {
  document.querySelector(".payment-modal-content").innerHTML = `
    <span class="payment-modal-close" onclick="closePaymentModal()">&times;</span>
    <div class="payment-modal-icon" style="background: #e8f5e9;">
      <i class="fas fa-check-circle" style="color: #4caf50;"></i>
    </div>
    <h2>Заявка отправлена!</h2>
    <p style="color: var(--text-light); margin-bottom: 20px;">Я свяжусь с вами в ближайшее время</p>
    <button class="btn btn-primary" onclick="closePaymentModal()">Закрыть</button>
  `;
}

// ===== Модалки =====
function openPaymentModal(totalPrice) {
  const modal = document.getElementById("paymentModal");
  const summary = document.getElementById("paymentOrderSummary");
  if (!modal || !summary) return;

  summary.innerHTML = `Стоимость аренды: <strong>${totalPrice}₽</strong>`;
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function closePaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "auto";
}

function openVideoModal() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("videoPlayer");
  if (!modal) return;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  if (video) {
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play();
    });
  }
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("videoPlayer");
  if (!modal) return;

  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
}

function toggleFaq(btn) {
  const item = btn.closest(".faq-item");
  document.querySelectorAll(".faq-item.active").forEach((el) => {
    if (el !== item) el.classList.remove("active");
  });
  item.classList.toggle("active");
}

// ===== Админ-панель =====
function openAdminModal() {
  const modal = document.getElementById("adminModal");
  if (!modal) return;

  document.getElementById("adminLogin").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminPassword").value = "";

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAdminModal() {
  const modal = document.getElementById("adminModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function checkAdminPassword() {
  const password = document.getElementById("adminPassword").value;
  if (password === ADMIN_PASSWORD) {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadBlockedDates();
  } else {
    alert("Неверный пароль");
  }
}

function loadBlockedDates() {
  db.collection("blockedDates")
    .get()
    .then((snapshot) => {
      blockedDates = [];
      snapshot.forEach((doc) => blockedDates.push(doc.data().date));
      blockedDates.sort((a, b) => parseDate(a) - parseDate(b));
      renderBlockedDates();
      const today = new Date();
      renderCalendar(today.getFullYear(), today.getMonth());
    })
    .catch((err) => console.error("Ошибка загрузки дат:", err));
}

function isValidAdminDate(dateString) {
  const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  if (year > MAX_YEAR || year < new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  const date = new Date(year, month - 1, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now) return false;
  if (date > new Date(MAX_YEAR, 11, 31)) return false;

  return true;
}

function addBlockedDate() {
  const input = document.getElementById("adminDateInput");
  const date = input.value.trim();

  if (!date) return alert("Введите дату");
  if (!isValidAdminDate(date))
    return (
      alert("Неверная дата. Используйте формат ДД.ММ.ГГГГ"),
      (input.value = "")
    );
  if (blockedDates.includes(date)) return alert("Эта дата уже заблокирована");

  db.collection("blockedDates")
    .add({ date, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
    .then(() => {
      input.value = "";
      loadBlockedDates();
    })
    .catch((err) => {
      console.error("Ошибка:", err);
      alert("Ошибка сохранения");
    });
}

function blockDateRange() {
  const start = document.getElementById("adminDateStart").value.trim();
  const end = document.getElementById("adminDateEnd").value.trim();

  if (!start || !end) return alert("Введите обе даты");
  if (!isValidAdminDate(start) || !isValidAdminDate(end))
    return alert("Неверные даты. Используйте формат ДД.ММ.ГГГГ");

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (startDate > endDate)
    return alert("Дата начала должна быть раньше даты окончания");

  const datesToBlock = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    datesToBlock.push(formatDate(current));
    current = new Date(current.getTime() + 86400000);
  }

  const newDates = datesToBlock.filter((d) => !blockedDates.includes(d));
  if (newDates.length === 0) return alert("Все эти даты уже заблокированы");

  const batch = db.batch();
  newDates.forEach((date) => {
    const docRef = db.collection("blockedDates").doc();
    batch.set(docRef, {
      date,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  });

  batch
    .commit()
    .then(() => {
      document.getElementById("adminDateStart").value = "";
      document.getElementById("adminDateEnd").value = "";
      loadBlockedDates();
      alert(`Заблокировано дат: ${newDates.length}`);
    })
    .catch((err) => {
      console.error("Ошибка:", err);
      alert("Ошибка сохранения");
    });
}

function removeBlockedDate(dateString) {
  db.collection("blockedDates")
    .where("date", "==", dateString)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => doc.ref.delete());
    })
    .then(() => loadBlockedDates())
    .catch((err) => console.error("Ошибка удаления:", err));
}

function deleteAllBlockedDates() {
  if (blockedDates.length === 0) return alert("Нет заблокированных дат");
  if (!confirm("Удалить все заблокированные даты?")) return;

  db.collection("blockedDates")
    .get()
    .then((snapshot) => {
      const batch = db.batch();
      snapshot.forEach((doc) => batch.delete(doc.ref));
      return batch.commit();
    })
    .then(() => {
      loadBlockedDates();
      alert("Все даты удалены");
    })
    .catch((err) => {
      console.error("Ошибка:", err);
      alert("Ошибка удаления");
    });
}

function renderBlockedDates() {
  const list = document.getElementById("adminBlockedList");
  if (!list) return;

  if (blockedDates.length === 0) {
    list.innerHTML = '<p class="admin-empty">Нет заблокированных дат</p>';
    return;
  }

  list.innerHTML = blockedDates
    .map(
      (date) => `
    <div class="admin-blocked-date">
      <span>${date}</span>
      <button class="admin-unblock-btn" onclick="removeBlockedDate('${date}')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `,
    )
    .join("");
}

// ===== Обработчики =====
document.addEventListener("click", (e) => {
  const link = e.target.closest(".what-you-get-link");
  if (link) {
    link.classList.toggle("active");
    e.stopPropagation();
  } else {
    document
      .querySelectorAll(".what-you-get-link.active")
      .forEach((el) => el.classList.remove("active"));
  }

  ["photoModal", "paymentModal", "videoModal", "adminModal"].forEach((id) => {
    const modal = document.getElementById(id);
    if (modal && e.target === modal) {
      if (id === "photoModal") closePhotoModal();
      if (id === "paymentModal") closePaymentModal();
      if (id === "videoModal") closeVideoModal();
      if (id === "adminModal") closeAdminModal();
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePhotoModal();
    closePaymentModal();
    closeVideoModal();
    closeAdminModal();
    closeMobileCalendar();
  }

  const modal = document.getElementById("photoModal");
  const paymentModal = document.getElementById("paymentModal");

  if (modal?.classList.contains("active")) {
    if (e.key === "ArrowLeft") changePhoto(-1);
    if (e.key === "ArrowRight") changePhoto(1);
  } else if (!paymentModal?.classList.contains("active")) {
    if (e.key === "ArrowLeft") changePhotoInCollage(-1);
    if (e.key === "ArrowRight") changePhotoInCollage(1);
  }
});

// ===== Инициализация =====
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
  initCalendar();
  initSmoothScroll();
  initHeaderScroll();
  initYandexMap();
  loadBlockedDates();

  document
    .getElementById("mobileCalendarModal")
    ?.addEventListener("click", function (e) {
      if (e.target === this) closeMobileCalendar();
    });

  document.getElementById("guestsCount")?.addEventListener("change", (e) => {
    state.guests = parseInt(e.target.value);
    autoUpdatePrice();
  });

  document.getElementById("childrenCount")?.addEventListener("change", (e) => {
    state.children = parseInt(e.target.value);
    autoUpdatePrice();
  });

  document
    .getElementById("hoursCount")
    ?.addEventListener("change", autoUpdatePrice);

  document
    .querySelectorAll(".extra-service")
    .forEach((cb) => cb.addEventListener("change", autoUpdatePrice));
  document
    .querySelectorAll(".service-checkbox")
    .forEach((cb) => cb.addEventListener("change", autoUpdatePrice));

  document.getElementById("logo")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  console.log("Сайт инициализирован");
});

window.addEventListener("load", function () {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
});
