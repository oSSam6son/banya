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

// ===== Админ =====
const ADMIN_PASSWORD = "admin123";

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

let currentCollageIndex = 0;
let currentPhotoInCollage = 0;
let galleryPhotos = [];
let currentPhotoIndex = 0;
let globalPhotoIndex = 0;

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

// ===== Календарь =====
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

function initCalendar() {
  const today = new Date();
  renderCalendar(today.getFullYear(), today.getMonth());
}

function renderCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  const firstDay = new Date(year, month, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDay.getDay();

  const today = new Date();
  const maxYear = 2026;

  if (year > maxYear) {
    year = maxYear;
    month = 11;
  }
  if (year < today.getFullYear()) {
    year = today.getFullYear();
    month = today.getMonth();
  }

  let html = `
    <div class="calendar-header">
      <button onclick="changeMonth(${year}, ${month}, -1)"><i class="fas fa-chevron-left"></i></button>
      <h3>${MONTHS[month]} ${year}</h3>
      <button onclick="changeMonth(${year}, ${month}, 1)"><i class="fas fa-chevron-right"></i></button>
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

    if (date < now) {
      className += " past";
    } else if (blockedDates.includes(dateString)) {
      className += " blocked";
    }

    if (isSelectedDate(date)) className += " selected";
    if (isInRangeDate(date)) className += " in-range";

    if (date < now || blockedDates.includes(dateString)) {
      html += `<div class="${className}">${day}</div>`;
      continue;
    }

    html += `<div class="${className}" onclick="selectDate('${dateString}')">${day}</div>`;
  }

  calendar.innerHTML = html + "</div>";
}

function changeMonth(year, month, delta) {
  const maxYear = 2026;
  const maxMonth = 11;
  const newDate = new Date(year, month + delta, 1);

  if (
    newDate.getFullYear() > maxYear ||
    (newDate.getFullYear() === maxYear && newDate.getMonth() > maxMonth)
  ) {
    return;
  }

  renderCalendar(newDate.getFullYear(), newDate.getMonth());
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function parseDate(dateString) {
  const parts = dateString.split(".");
  return new Date(parts[2], parts[1] - 1, parts[0]);
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

function isTodayDate(date) {
  return date.toDateString() === new Date().toDateString();
}

function checkBlockedDatesBetween(startStr, endStr) {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  let current = new Date(start);

  while (current < end) {
    if (blockedDates.includes(formatDate(current))) {
      return true;
    }
    current = new Date(current.getTime() + 86400000);
  }
  return false;
}

function selectDate(dateString) {
  const date = parseDate(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now) return;
  if (blockedDates.includes(dateString)) return;

  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");

  if (bookingType === "hourly") {
    state.checkIn = dateString;
    state.checkOut = null;
    checkIn.value = dateString;
    checkOut.value = "";
  } else if (!state.checkIn || (state.checkIn && state.checkOut)) {
    state.checkIn = dateString;
    state.checkOut = null;
    checkIn.value = dateString;
    checkOut.value = "";
  } else if (state.checkIn && !state.checkOut) {
    const checkInDate = parseDate(state.checkIn);
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

  if (state.checkIn) {
    const parts = state.checkIn.split(".");
    renderCalendar(parseInt(parts[2]), parseInt(parts[1]) - 1);
  } else {
    const currentDate = new Date();
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
  }
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
        • Одно парковочное место на територии <br>
        • Два парковочных места за територией <br>    
        • Мангальная зона с навесом <br>
        • Скамейка-качеля на 5 мест <br>
        • Уютный, теплый, двухэтажный просторный дом-баня: <br>
          - праздничный стол на 10 человек; <br>
          - музыка с bluetooth; <br>
          - телевизор (триколор); <br>
          - три спальные комнаты (2 этаж); <br>
          - раскладной диван 160х200см (1 этаж); <br>
          - постельное белье; <br>
          - полотенца; <br>
          - две туалетные комнаты; <br>
          - две душевые комнаты. <br>
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
        • Одно парковочное место на територии; <br>
        • Два парковочных места за територией; <br>
        • Мангальная зона с навесом; <br>
        • Скамейка-качеля на 5 мест; <br>
        • Уютный, теплый дом-баня (2 этаж не доступен!): <br>
        - праздничный стол на 10 человек; <br>
        - музыка с bluetooth; <br>
        - телевизор (триколор); <br>
        - полотенца; <br>
        - туалетная и душевая комнаты. <br>
      `;
    }

    initCalendar();
    wrapper.scrollIntoView({ behavior: "smooth", block: "end" });
  }, 300);
}

function calculatePrice() {
  const guests = parseInt(document.getElementById("guestsCount").value);
  const children = parseInt(document.getElementById("childrenCount").value);

  let totalPrice = 0;
  let periodText = "";

  if (bookingType === "daily") {
    if (!state.checkIn || !state.checkOut)
      return alert("Пожалуйста, выберите даты заезда и выезда");

    const days = Math.ceil(
      (parseDate(state.checkOut) - parseDate(state.checkIn)) / 86400000,
    );
    if (days <= 0) return alert("Дата выезда должна быть позже даты заезда");

    let dailyPrice = 18100;
    if (guests > 2) dailyPrice += (guests - 2) * 1650;
    totalPrice = dailyPrice * days;
    periodText = `${state.checkIn} — ${state.checkOut} (${days} дн.)`;
  } else if (bookingType === "hourly") {
    if (!state.checkIn) return alert("Пожалуйста, выберите дату");

    const hours = parseInt(document.getElementById("hoursCount").value);
    let hourlyPrice = 3000;
    if (guests > 2) hourlyPrice += (guests - 2) * 300;
    totalPrice = hourlyPrice * hours;
    periodText = `${state.checkIn} (${hours} ч.)`;
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
    <p><strong>Базовая стоимость:</strong> ${bookingType === "daily" ? "от 18100₽/сутки" : "от 3000₽/час"}</p>
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

  setTimeout(() => {
    const payBtn = resultDiv.querySelector(".btn-payment");
    if (payBtn) payBtn.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}

// ===== Плавный скролл =====
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

// ===== Шапка =====
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

// ===== Счётчик услуг =====
function changeServiceCount(btn, delta) {
  const card = btn.closest(".service-card");
  const valueEl = card.querySelector(".counter-value");
  let count = Math.max(0, Math.min(5, parseInt(valueEl.textContent) + delta));
  valueEl.textContent = count;
  card.style.border = count > 0 ? "2px solid var(--primary)" : "none";
}

// ===== Назад =====
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

// ===== Автоподстановка даты (исправленная) =====
function autoFormatDate(input) {
  // Сохраняем позицию курсора
  const cursorPos = input.selectionStart;

  // Убираем все нецифровые символы
  let digits = input.value.replace(/\D/g, "");

  // Ограничиваем 8 цифрами
  if (digits.length > 8) digits = digits.slice(0, 8);

  // Форматируем только если есть цифры
  let formatted = "";
  if (digits.length > 0) {
    formatted = digits.slice(0, 2);
  }
  if (digits.length > 2) {
    formatted += "." + digits.slice(2, 4);
  }
  if (digits.length > 4) {
    formatted += "." + digits.slice(4, 8);
  }

  // Просто ставим значение
  input.value = formatted;
}

// ===== Ручной ввод даты (исправленный) =====
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

  if (year > 2026) {
    alert("Бронирование доступно только до конца 2026 года");
    input.value = "";
    return;
  }

  if (month < 1 || month > 12) {
    alert("Неверный месяц");
    input.value = "";
    return;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    alert("Неверный день");
    input.value = "";
    return;
  }

  const date = new Date(year, month - 1, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now) {
    alert("Нельзя выбрать прошедшую дату");
    input.value = "";
    return;
  }

  if (date > new Date(2026, 11, 31)) {
    alert("Бронирование доступно только до конца 2026 года");
    input.value = "";
    return;
  }

  const dateString = formatDate(date);

  if (blockedDates.includes(dateString)) {
    alert("Эта дата заблокирована");
    input.value = "";
    return;
  }

  if (input.id === "checkIn") {
    state.checkIn = dateString;
  } else if (input.id === "checkOut") {
    if (bookingType === "hourly") {
      alert("При почасовой аренде дата выезда не нужна");
      input.value = "";
      return;
    }
    if (state.checkIn && dateString <= state.checkIn) {
      alert("Дата выезда должна быть позже даты заезда");
      input.value = "";
      return;
    }
    if (state.checkIn && checkBlockedDatesBetween(state.checkIn, dateString)) {
      alert("В выбранном диапазоне есть заблокированная дата");
      input.value = "";
      return;
    }
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

  if (!name) {
    alert("Введите ваше имя");
    return;
  }

  if (!phone) {
    alert("Введите ваш телефон");
    return;
  }

  btn.classList.add("loading");
  btn.disabled = true;

  const totalPrice =
    document.querySelector(".payment-order-summary strong")?.textContent ||
    "Не указана";

  const formData = {
    name: name,
    phone: phone,
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
      if (response.ok) {
        showPaymentSuccess();
      } else {
        alert("Ошибка отправки. Попробуйте ещё раз.");
      }
    })
    .catch((error) => {
      console.error("Ошибка:", error);
      alert("Ошибка отправки. Попробуйте ещё раз.");
    })
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

// ===== Модалка оплаты =====
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

// ===== Видео модалка =====
function openVideoModal() {
  const modal = document.getElementById("videoModal");
  if (!modal) return;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
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

// ===== FAQ =====
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

  const loginScreen = document.getElementById("adminLogin");
  const panelScreen = document.getElementById("adminPanel");

  loginScreen.style.display = "flex";
  panelScreen.style.display = "none";
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
      snapshot.forEach((doc) => {
        blockedDates.push(doc.data().date);
      });

      // Сортировка как даты
      blockedDates.sort((a, b) => {
        const parse = (s) => {
          const parts = s.split(".");
          return new Date(parts[2], parts[1] - 1, parts[0]);
        };
        return parse(a) - parse(b);
      });

      renderBlockedDates();
      const today = new Date();
      renderCalendar(today.getFullYear(), today.getMonth());
    })
    .catch((err) => {
      console.error("Ошибка загрузки дат:", err);
    });
}

// Проверка валидности даты для админки
function isValidAdminDate(dateString) {
  const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  if (year > 2026 || year < new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  const date = new Date(year, month - 1, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now) return false;
  if (date > new Date(2026, 11, 31)) return false;

  return true;
}

function addBlockedDate() {
  const input = document.getElementById("adminDateInput");
  const date = input.value.trim();

  if (!date) {
    alert("Введите дату");
    return;
  }

  if (!isValidAdminDate(date)) {
    alert("Неверная дата. Используйте формат ДД.ММ.ГГГГ");
    input.value = "";
    return;
  }

  if (blockedDates.includes(date)) {
    alert("Эта дата уже заблокирована");
    return;
  }

  db.collection("blockedDates")
    .add({
      date: date,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
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

  if (!start || !end) {
    alert("Введите обе даты");
    return;
  }

  if (!isValidAdminDate(start) || !isValidAdminDate(end)) {
    alert("Неверные даты. Используйте формат ДД.ММ.ГГГГ");
    return;
  }

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (startDate > endDate) {
    alert("Дата начала должна быть раньше даты окончания");
    return;
  }

  const datesToBlock = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    datesToBlock.push(formatDate(current));
    current = new Date(current.getTime() + 86400000);
  }

  const newDates = datesToBlock.filter((d) => !blockedDates.includes(d));

  if (newDates.length === 0) {
    alert("Все эти даты уже заблокированы");
    return;
  }

  const batch = db.batch();
  newDates.forEach((date) => {
    const docRef = db.collection("blockedDates").doc();
    batch.set(docRef, {
      date: date,
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
      snapshot.forEach((doc) => {
        doc.ref.delete();
      });
    })
    .then(() => {
      loadBlockedDates();
    })
    .catch((err) => {
      console.error("Ошибка удаления:", err);
    });
}

function deleteAllBlockedDates() {
  if (blockedDates.length === 0) {
    alert("Нет заблокированных дат");
    return;
  }

  if (!confirm("Удалить все заблокированные даты?")) {
    return;
  }

  db.collection("blockedDates")
    .get()
    .then((snapshot) => {
      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
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

// ===== Tooltip для мобильных =====
document.addEventListener("click", function (e) {
  const link = e.target.closest(".what-you-get-link");
  if (link) {
    link.classList.toggle("active");
    e.stopPropagation();
  } else {
    document
      .querySelectorAll(".what-you-get-link.active")
      .forEach((el) => el.classList.remove("active"));
  }
});

// ===== Закрытие по фону и Escape =====
document.addEventListener("click", function (e) {
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

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closePhotoModal();
    closePaymentModal();
    closeVideoModal();
    closeAdminModal();
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
    .getElementById("guestsCount")
    ?.addEventListener(
      "change",
      (e) => (state.guests = parseInt(e.target.value)),
    );
  document
    .getElementById("childrenCount")
    ?.addEventListener(
      "change",
      (e) => (state.children = parseInt(e.target.value)),
    );

  document.getElementById("logo")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  console.log("Сайт инициализирован");
});

// Скролл наверх при загрузке
window.addEventListener("load", function () {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
});
