// Auswahl auf Karte
const mapMarkers = document.querySelectorAll(".map-marker");
const flightSections = document.querySelectorAll(".flight-section");
const spotLinks = document.querySelectorAll(".spot-link");
const detailSection = document.querySelector("#spot-detail");
const detailTitle = document.querySelector("#detail-title");
const detailRegion = document.querySelector("#detail-region");
const detailWind = document.querySelector("#detail-wind");
let windData = [];

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
    detailWind.innerText = getWindText(location);

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

const container = document.querySelector("#wind"); // -> Daten darstellen

data.forEach((location) => {
  const item = document.createElement("div");

  let cities = [
    { name: "Brändlen", lat: 46.94, lng: 8.42 },
    { name: "Wolfenschiessen", lat: 46.920002, lng: 8.4 },
    { name: "Wirzweli", lat: 46.920002, lng: 8.360001 },
    { name: "Niederhorn", lat: 46.74, lng: 7.7999997 },
    { name: "Interlaken", lat: 46.68, lng: 7.86 },
    { name: "Weissenstein", lat: 47.260002, lng: 7.52 },
    { name: "Schwengimatt", lat: 47.4, lng: 7.6599994 },
    { name: "Obere Wengi", lat: 47.3, lng: 7.6199994 },
  ];

  let latitude = location.latitude;
  let longitude = location.longitude;

  cities.find((city) => {
    if (city.lat === latitude && city.lng === longitude) {
      const cityName = document.createElement("h2");
      cityName.innerText = city.name;
      item.appendChild(cityName);
    }
  });

  // const latitude = document.createElement('h2');
  // latitude.innerText = location.latitude;

  // const longitude = document.createElement('h2');
  // longitude.innerText = location.longitude;

  const wind_direction_10m = document.createElement("p");
  wind_direction_10m.innerText = `Windrichtung: ${location.minutely_15.wind_direction_10m[0]}°`;

  const wind_speed_10m = document.createElement("p");
  wind_speed_10m.innerText = `Windgeschwindigkeit: ${location.minutely_15.wind_speed_10m[0]} km/h`;

  // item.appendChild(latitude);
  // item.appendChild(longitude);
  item.appendChild(wind_direction_10m);
  item.appendChild(wind_speed_10m);
  container.appendChild(item);
});
