import { searchConnectors } from "./search.ts";

const connectors = (weather, billing) => [
  { name: "weather", descriptors: { getForecast: { description: weather } } },
  { name: "billing", descriptors: { refundInvoice: { description: billing } } }
];

const cases = [
  ["punctuation fragment", "Return a city's forecast.", "Refund a re-billed invoice.", ["send slack message", "read repository readme"]],
  ["one-letter word", "Return the forecast for a city.", "Refund an invoice billed twice.", ["add alarm", "archive all tasks"]],
  ["control: no 1-2 char tokens", "Return the city forecast.", "Refund duplicate invoice.", ["send slack message", "read repository readme", "add alarm", "archive all tasks"]],
  ["sanity: intended queries", "Return a city's forecast.", "Refund a re-billed invoice.", ["city forecast", "refund invoice"]]
];

for (const [label, weather, billing, queries] of cases) {
  for (const query of queries) {
    const { results } = searchConnectors(query, connectors(weather, billing));
    console.log(`${label} | ${JSON.stringify(query)} ->`, JSON.stringify(results.map((r) => [r.path, r.score])));
  }
}