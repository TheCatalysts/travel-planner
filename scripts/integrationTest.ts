// import fetch from 'node-fetch';
// import { startServer, stopServer } from '../src/app';

// async function run() {
//   const port = 4000;
//   await startServer(port);

//   const endpoint = `http://localhost:${port}/graphql`;

//   // Test suggestCities
//   const suggestQuery = {
//     query: `query { suggestCities(query: "Leip") { id name country stationId latitude longitude } }`
//   };

//   const suggestRes = await fetch(endpoint, { method: 'POST', body: JSON.stringify(suggestQuery), headers: { 'Content-Type': 'application/json' } });
//   const suggestJson = await suggestRes.json();
//   console.log('suggestCities response:');
//   console.log(JSON.stringify(suggestJson, null, 2));

//   // Choose a stationId from data/stations.json (first entry)
//   const stationId = '1004';
//   const weatherQuery = {
//     query: `query { getWeather(stationId: "${stationId}") { stationId name temperature humidity windSpeed rainRate } }`
//   };

//   const weatherRes = await fetch(endpoint, { method: 'POST', body: JSON.stringify(weatherQuery), headers: { 'Content-Type': 'application/json' } });
//   const weatherJson = await weatherRes.json();
//   console.log('getWeather response:');
//   console.log(JSON.stringify(weatherJson, null, 2));

//   await stopServer();
// }

// run().catch((e) => { console.error(e); process.exit(1); });
