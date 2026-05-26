// Auswahl auf Karte
const mapMarkers = document.querySelectorAll(".map-marker");
const flightSections = document.querySelectorAll(".flight-section");
const spotLinks = document.querySelectorAll(".spot-link");
const detailSection = document.querySelector("#spot-detail");
const detailTitle = document.querySelector("#detail-title");
const detailRegion = document.querySelector("#detail-region");
const detailWind = document.querySelector("#detail-wind");
const detailLift = document.querySelector("#detail-lift");
const detailWebcam = document.querySelector("#detail-webcam");
let windData = [];
let spotDetails = [];

function hideSpotDetail() {
  if (!detailSection) return;

  detailSection.hidden = true;
  detailSection.classList.remove("green", "blue", "orange");
}

mapMarkers.forEach((marker) => {
  marker.addEventListener("click", (event) => {
    event.preventDefault();

    const targetId = marker.dataset.target;
    const targetSection = document.querySelector(`#${targetId}`);
    if (!targetSection) return;

    flightSections.forEach((section) => {
      section.hidden = true;
    });

    targetSection.hidden = false;
    hideSpotDetail();

    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

// Details anzeigen
spotLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (!detailSection) return;

    const spot = link.dataset.spot;
    const region = link.dataset.region;
    const color = link.dataset.color;
    const apiIndex = Number(link.dataset.apiIndex);
    const location = windData[apiIndex];

    detailTitle.innerText = spot;
    detailRegion.innerText = `(${region})`;
    detailWind.innerHTML = getWindText(location);
    setAdditionalDetails(spot);

    detailSection.classList.remove("green", "blue", "orange");
    detailSection.classList.add(color);

    detailSection.hidden = false;

    detailSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

// Windwerte laden
async function loadData() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=46.9522,46.9032,46.9078,46.7117,46.6839,47.2527,47.3161,47.3978,47.3037&longitude=8.4494,8.3942,8.3743,7.7768,7.8664,7.5069,7.6932,7.6522,7.6282&hourly=wind_speed_10m,wind_direction_10m&minutely_15=wind_speed_10m,wind_direction_10m&timezone=Europe%2FBerlin&forecast_days=1&ref=freepublicapis.com";
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error);
    return false;
  }
}

const data = await loadData();
console.log(data); // gibt die Daten der API oder false in der Konsole aus

if (Array.isArray(data)) {
  windData = data;
} else if (detailWind) {
  detailWind.innerText = "Winddaten nicht verfügbar";
}

const additionalData = await loadSpotDetails();

if (additionalData?.spots) {
  spotDetails = additionalData.spots;
}

function getWindText(location) {
  if (!location?.minutely_15) {
    return "Winddaten nicht verfügbar";
  }

  const speed = location.minutely_15.wind_speed_10m?.[0];
  const direction = location.minutely_15.wind_direction_10m?.[0];

  if (speed === undefined || direction === undefined) {
    return "Winddaten nicht verfügbar";
  }

  return `${speed} km/h · ${direction}° <span class="wind-arrow" style="--wind-direction: ${direction}deg">&uarr;</span>`;
}

async function loadSpotDetails() {
  try {
    const response = await fetch("assets/data/spot-details.json");
    return await response.json();
  } catch (error) {
    console.error(error);
    return false;
  }
}

function setAdditionalDetails(spotName) {
  const spot = spotDetails.find((item) => item.name === spotName);

  if (!spot) {
    detailLift.innerText = "keine Daten vorhanden";
    detailWebcam.innerText = "keine Daten vorhanden";
    return;
  }

  detailLift.innerHTML = getGondolaText(spot.gondola);

  if (spot.webcam.available && spot.webcam.url) {
    detailWebcam.innerHTML = `<a href="${spot.webcam.url}" target="_blank" rel="noopener">${spot.webcam.label}</a>`;
  } else {
    detailWebcam.innerText = "keine Daten vorhanden";
  }
}

function getGondolaText(gondola) {
  const status = isGondolaOpen(gondola) ? "geöffnet" : "geschlossen";

  if (!gondola?.remarks) {
    return status;
  }

  return `${status}<br><span class="gondola-remarks">${gondola.remarks}</span>`;
}

function isGondolaOpen(gondola) {
  if (!gondola || gondola.type === "none") {
    return false;
  }

  if (gondola.type === "always_open") {
    return true;
  }

  const now = new Date();

  if (isInClosedPeriod(gondola.closedPeriods, now)) {
    return false;
  }

  const specialOpening = gondola.specialOpenings?.find((item) => item.date === getDateValue(now));

  if (specialOpening) {
    return isInTimeInterval(specialOpening.intervals, now);
  }

  return gondola.openingHours?.some((rule) => {
    return isRuleActive(rule, now) && isInTimeInterval(rule.intervals, now);
  });
}

function isInClosedPeriod(periods = [], now) {
  return periods.some((period) => isDateInRange(now, period.from, period.to));
}

function isRuleActive(rule, now) {
  if (rule.days && !rule.days.includes(now.getDay())) {
    return false;
  }

  if (rule.from && rule.to && !isDateInRange(now, rule.from, rule.to)) {
    return false;
  }

  return true;
}

function isDateInRange(now, from, to) {
  const current = from.length === 5 ? getMonthDayValue(now) : getDateValue(now);

  if (from <= to) {
    return current >= from && current <= to;
  }

  return current >= from || current <= to;
}

function isInTimeInterval(intervals = [], now) {
  const current = getTimeValue(now);

  return intervals.some((interval) => {
    if (interval.open <= interval.close) {
      return current >= interval.open && current <= interval.close;
    }

    return current >= interval.open || current <= interval.close;
  });
}

function getDateValue(date) {
  return `${date.getFullYear()}-${padDateValue(date.getMonth() + 1)}-${padDateValue(date.getDate())}`;
}

function getMonthDayValue(date) {
  return `${padDateValue(date.getMonth() + 1)}-${padDateValue(date.getDate())}`;
}

function getTimeValue(date) {
  return `${padDateValue(date.getHours())}:${padDateValue(date.getMinutes())}`;
}

function padDateValue(value) {
  return String(value).padStart(2, "0");
}
