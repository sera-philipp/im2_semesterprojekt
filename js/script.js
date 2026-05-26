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
    { name: "Balsthal", lat: 47.32, lng: 7.72 },
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
