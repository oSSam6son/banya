// ===== Состояние =====
let state = { checkIn: null, checkOut: null, guests: 1, children: 0 };
let bookingType = null;

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

// ===== Модальное окно фото =====
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
    if (date < now) className += " disabled";
    if (isSelectedDate(date)) className += " selected";
    if (isInRangeDate(date)) className += " in-range";

    if (date < now) {
      html += `<div class="${className}">${day}</div>`;
      continue;
    }

    html += `<div class="${className}" onclick="selectDate('${dateString}')">${day}</div>`;
  }

  calendar.innerHTML = html + "</div>";
}

function changeMonth(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  renderCalendar(d.getFullYear(), d.getMonth());
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

function selectDate(dateString) {
  const date = parseDate(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now) return;

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
        • Одно парковочное место на територии, т.е. ваша машина будет внутри периметра <br>
        • Два парковочных места за територией, т.е. за забором <br>    
        • Мангальная зона с навесом <br>
        • Скамейка-качеля на 5 мест <br>
        • Уютный, теплый, двухэтажный просторный дом-баня, где для проведения вечеринок есть следующее: <br>
          - праздничный стол на 10 человек, а также необходимый столовый набор; <br>
          - музыка для релакса, c возможностю подключения вашего смартфона по bluetooth; <br>
          - телевизор с тв программами на 1 этаже (триколор);
          - три спальные комнаты, каждая комнтата расчитана на 2 персоны и имеет ночной замок (2 этаж); <br>
          - дополнительно спальные мета на 1 таже (раскладной диван 160х200см) <br>
          - Чистый набор постельного белья для каждого проживающего; <br>
          - Чистые полотенца (100х50см) для каждого гостя; <br>
          - две талетные комнаты (по одной на этаже); <br>
          - две душевые комнаты (по одной на этаже). <br>
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
        • Одно парковочное место на територии, т.е. ваша машина будет внутри периметра; <br>
        • Два парковочных места за територией, т.е. за забором; <br>
        • Мангальная зона с навесом; <br>
        • Скамейка-качеля на 5 мест; <br>
        • Уютный, теплый просторный дом-баня (Внимание: второй этаж не доступен при посуточной аренде!), где для проведения вечеринок есть следующее: <br>
        - праздничный стол на 10 человек, а также необходимый столовый набор; <br>
        - музыка для релакса, c возможностю подключения вашего смартфона по bluetooth; <br>
        - телевизор с тв программами на 1 этаже (триколор); <br>
        - Чистые полотенца (100х50см) для каждого гостя; <br>
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

  let basePrice = 18100;
  let totalPrice = 0;
  let periodText = "";

  if (bookingType === "daily") {
    if (!state.checkIn || !state.checkOut)
      return alert("Пожалуйста, выберите даты заезда и выезда");

    const days = Math.ceil(
      (parseDate(state.checkOut) - parseDate(state.checkIn)) / 86400000,
    );
    if (days <= 0) return alert("Дата выезда должна быть позже даты заезда");

    if (guests > 2) basePrice += (guests - 2) * 1650;
    totalPrice = basePrice * days;
    periodText = `${state.checkIn} — ${state.checkOut} (${days} дн.)`;
  } else if (bookingType === "hourly") {
    if (!state.checkIn) return alert("Пожалуйста, выберите дату");

    const hours = parseInt(document.getElementById("hoursCount").value);
    if (guests > 2) basePrice += (guests - 2) * 1650;
    totalPrice = basePrice * hours;
    periodText = `${state.checkIn} (${hours} ч.)`;
  } else {
    return alert("Выберите тип аренды");
  }

  let extraPrice = 0;
  const extraList = [];

  document.querySelectorAll(".extra-service:checked").forEach((service) => {
    const price = parseInt(service.value);
    extraPrice += price;
    extraList.push(
      `${service.closest(".checkbox-item").textContent.trim()} (${price}₽)`,
    );
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
    <p><strong>Базовая стоимость:</strong> ${basePrice}₽/сутки</p>
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

// ===== Обработчики =====
document.addEventListener("click", (e) => {
  const modal = document.getElementById("photoModal");
  if (modal && e.target === modal) closePhotoModal();
});

document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("photoModal");
  const paymentModal = document.getElementById("paymentModal");

  if (e.key === "Escape") {
    closePhotoModal();
    closePaymentModal();
  }

  if (modal?.classList.contains("active")) {
    if (e.key === "ArrowLeft") changePhoto(-1);
    if (e.key === "ArrowRight") changePhoto(1);
  } else if (!paymentModal?.classList.contains("active")) {
    if (e.key === "ArrowLeft") changePhotoInCollage(-1);
    if (e.key === "ArrowRight") changePhotoInCollage(1);
  }
});

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

// ===== Ручной ввод даты =====
function validateDateInput(input) {
  const value = input.value.trim();
  if (!value) return;

  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match)
    return (alert("Введите дату в формате ДД.ММ.ГГГГ"), (input.value = ""));

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

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

  const dateString = formatDate(date);

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
    state.checkOut = dateString;
  }

  const currentDate = new Date();
  renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// ===== Автоподстановка =====
function autoFormatDate(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 8) value = value.slice(0, 8);
  if (value.length >= 2) value = value.slice(0, 2) + "." + value.slice(2);
  if (value.length >= 5) value = value.slice(0, 5) + "." + value.slice(5);
  if (value.length === 8) {
    const parts = value.split(".");
    if (parts[2] && parts[2].length === 2) {
      parts[2] = "20" + parts[2];
      value = parts.join(".");
    }
  }
  input.value = value;
}

// ===== Telegram =====
const TELEGRAM_BOT_TOKEN = "8880832531:AAGuwmwR8nCyo7LGo0YAop-nznDTRPp1Nnc";
const TELEGRAM_CHAT_ID = "6507123485";

function sendTelegramMessage(message) {
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        console.log("Сообщение отправлено");
        showPaymentSuccess();
      } else {
        alert("Ошибка отправки. Попробуйте ещё раз.");
      }
    })
    .catch(() => alert("Ошибка отправки. Попробуйте ещё раз."));
}

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

  // Включаем спиннер
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
    headers: {
      "Content-Type": "application/json",
    },
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
  ["photoModal", "paymentModal", "videoModal"].forEach((id) => {
    const modal = document.getElementById(id);
    if (modal && e.target === modal) {
      if (id === "photoModal") closePhotoModal();
      if (id === "paymentModal") closePaymentModal();
      if (id === "videoModal") closeVideoModal();
    }
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closePhotoModal();
    closePaymentModal();
    closeVideoModal();
  }
});

// ===== Инициализация =====
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
  initCalendar();
  initSmoothScroll();
  initHeaderScroll();
  initYandexMap();

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
