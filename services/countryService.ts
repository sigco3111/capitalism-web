import type { Country } from '../types';

// restcountries v3.1/v5 API가 2026-08에 deprecated되어 게임 진행 불가.
// 외부 API 의존을 제거하고 빌드에 박힌 정적 데이터 사용.
// world-atlas@2/countries-110m.json feature 'id'는 numeric ccn3 (예: '840' = USA).
// 매핑은 ccn3으로만 작동 (cca3로는 절대 안 됨).

const FALLBACK_COUNTRIES: Country[] = [
  { name: { common: "United States", official: "United States of America" }, cca3: "USA", ccn3: "840", capital: ["Washington, D.C."], region: "Americas", subregion: "Northern America", population: 331002651, flags: { png: "", svg: "", alt: "United States flag" } },
  { name: { common: "China", official: "People's Republic of China" }, cca3: "CHN", ccn3: "156", capital: ["Beijing"], region: "Asia", subregion: "Eastern Asia", population: 1412175000, flags: { png: "", svg: "", alt: "China flag" } },
  { name: { common: "Japan", official: "Japan" }, cca3: "JPN", ccn3: "392", capital: ["Tokyo"], region: "Asia", subregion: "Eastern Asia", population: 125960000, flags: { png: "", svg: "", alt: "Japan flag" } },
  { name: { common: "Germany", official: "Federal Republic of Germany" }, cca3: "DEU", ccn3: "276", capital: ["Berlin"], region: "Europe", subregion: "Western Europe", population: 83783985, flags: { png: "", svg: "", alt: "Germany flag" } },
  { name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" }, cca3: "GBR", ccn3: "826", capital: ["London"], region: "Europe", subregion: "Northern Europe", population: 67886011, flags: { png: "", svg: "", alt: "United Kingdom flag" } },
  { name: { common: "France", official: "French Republic" }, cca3: "FRA", ccn3: "250", capital: ["Paris"], region: "Europe", subregion: "Western Europe", population: 65273511, flags: { png: "", svg: "", alt: "France flag" } },
  { name: { common: "India", official: "Republic of India" }, cca3: "IND", ccn3: "356", capital: ["New Delhi"], region: "Asia", subregion: "Southern Asia", population: 1380004385, flags: { png: "", svg: "", alt: "India flag" } },
  { name: { common: "Italy", official: "Italian Republic" }, cca3: "ITA", ccn3: "380", capital: ["Rome"], region: "Europe", subregion: "Southern Europe", population: 60461826, flags: { png: "", svg: "", alt: "Italy flag" } },
  { name: { common: "Brazil", official: "Federative Republic of Brazil" }, cca3: "BRA", ccn3: "076", capital: ["Brasília"], region: "Americas", subregion: "South America", population: 212559409, flags: { png: "", svg: "", alt: "Brazil flag" } },
  { name: { common: "Canada", official: "Canada" }, cca3: "CAN", ccn3: "124", capital: ["Ottawa"], region: "Americas", subregion: "Northern America", population: 37742154, flags: { png: "", svg: "", alt: "Canada flag" } },
  { name: { common: "South Korea", official: "Republic of Korea" }, cca3: "KOR", ccn3: "410", capital: ["Seoul"], region: "Asia", subregion: "Eastern Asia", population: 51269185, flags: { png: "", svg: "", alt: "South Korea flag" } },
  { name: { common: "Russia", official: "Russian Federation" }, cca3: "RUS", ccn3: "643", capital: ["Moscow"], region: "Europe", subregion: "Eastern Europe", population: 144373535, flags: { png: "", svg: "", alt: "Russia flag" } },
  { name: { common: "Australia", official: "Commonwealth of Australia" }, cca3: "AUS", ccn3: "036", capital: ["Canberra"], region: "Oceania", subregion: "Australia and New Zealand", population: 25499884, flags: { png: "", svg: "", alt: "Australia flag" } },
  { name: { common: "Spain", official: "Kingdom of Spain" }, cca3: "ESP", ccn3: "724", capital: ["Madrid"], region: "Europe", subregion: "Southern Europe", population: 47351567, flags: { png: "", svg: "", alt: "Spain flag" } },
  { name: { common: "Mexico", official: "United Mexican States" }, cca3: "MEX", ccn3: "484", capital: ["Mexico City"], region: "Americas", subregion: "Central America", population: 128932753, flags: { png: "", svg: "", alt: "Mexico flag" } },
  { name: { common: "Indonesia", official: "Republic of Indonesia" }, cca3: "IDN", ccn3: "360", capital: ["Jakarta"], region: "Asia", subregion: "South-Eastern Asia", population: 273523615, flags: { png: "", svg: "", alt: "Indonesia flag" } },
  { name: { common: "Netherlands", official: "Kingdom of the Netherlands" }, cca3: "NLD", ccn3: "528", capital: ["Amsterdam"], region: "Europe", subregion: "Western Europe", population: 17441139, flags: { png: "", svg: "", alt: "Netherlands flag" } },
  { name: { common: "Saudi Arabia", official: "Kingdom of Saudi Arabia" }, cca3: "SAU", ccn3: "682", capital: ["Riyadh"], region: "Asia", subregion: "Western Asia", population: 34813871, flags: { png: "", svg: "", alt: "Saudi Arabia flag" } },
  { name: { common: "Turkey", official: "Republic of Turkey" }, cca3: "TUR", ccn3: "792", capital: ["Ankara"], region: "Asia", subregion: "Western Asia", population: 85341241, flags: { png: "", svg: "", alt: "Turkey flag" } },
  { name: { common: "Switzerland", official: "Swiss Confederation" }, cca3: "CHE", ccn3: "756", capital: ["Bern"], region: "Europe", subregion: "Western Europe", population: 8654622, flags: { png: "", svg: "", alt: "Switzerland flag" } },
  { name: { common: "Argentina", official: "Argentine Republic" }, cca3: "ARG", ccn3: "032", capital: ["Buenos Aires"], region: "Americas", subregion: "South America", population: 45195777, flags: { png: "", svg: "", alt: "Argentina flag" } },
  { name: { common: "Sweden", official: "Kingdom of Sweden" }, cca3: "SWE", ccn3: "752", capital: ["Stockholm"], region: "Europe", subregion: "Northern Europe", population: 10549347, flags: { png: "", svg: "", alt: "Sweden flag" } },
  { name: { common: "Poland", official: "Republic of Poland" }, cca3: "POL", ccn3: "616", capital: ["Warsaw"], region: "Europe", subregion: "Central Europe", population: 37846611, flags: { png: "", svg: "", alt: "Poland flag" } },
  { name: { common: "Belgium", official: "Kingdom of Belgium" }, cca3: "BEL", ccn3: "056", capital: ["Brussels"], region: "Europe", subregion: "Western Europe", population: 11589623, flags: { png: "", svg: "", alt: "Belgium flag" } },
  { name: { common: "Thailand", official: "Kingdom of Thailand" }, cca3: "THA", ccn3: "764", capital: ["Bangkok"], region: "Asia", subregion: "South-Eastern Asia", population: 69799978, flags: { png: "", svg: "", alt: "Thailand flag" } },
  { name: { common: "Ireland", official: "Republic of Ireland" }, cca3: "IRL", ccn3: "372", capital: ["Dublin"], region: "Europe", subregion: "Northern Europe", population: 4937786, flags: { png: "", svg: "", alt: "Ireland flag" } },
  { name: { common: "Israel", official: "State of Israel" }, cca3: "ISR", ccn3: "376", capital: ["Jerusalem"], region: "Asia", subregion: "Western Asia", population: 9216900, flags: { png: "", svg: "", alt: "Israel flag" } },
  { name: { common: "Norway", official: "Kingdom of Norway" }, cca3: "NOR", ccn3: "578", capital: ["Oslo"], region: "Europe", subregion: "Northern Europe", population: 5421241, flags: { png: "", svg: "", alt: "Norway flag" } },
  { name: { common: "United Arab Emirates", official: "United Arab Emirates" }, cca3: "ARE", ccn3: "784", capital: ["Abu Dhabi"], region: "Asia", subregion: "Western Asia", population: 9890400, flags: { png: "", svg: "", alt: "United Arab Emirates flag" } },
  { name: { common: "Singapore", official: "Republic of Singapore" }, cca3: "SGP", ccn3: "702", capital: ["Singapore"], region: "Asia", subregion: "South-Eastern Asia", population: 5685807, flags: { png: "", svg: "", alt: "Singapore flag" } },
  { name: { common: "Hong Kong", official: "Hong Kong Special Administrative Region of the People's Republic of China" }, cca3: "HKG", ccn3: "344", capital: ["City of Victoria"], region: "Asia", subregion: "Eastern Asia", population: 7482500, flags: { png: "", svg: "", alt: "Hong Kong flag" } },
  { name: { common: "Denmark", official: "Kingdom of Denmark" }, cca3: "DNK", ccn3: "208", capital: ["Copenhagen"], region: "Europe", subregion: "Northern Europe", population: 5792202, flags: { png: "", svg: "", alt: "Denmark flag" } },
  { name: { common: "Malaysia", official: "Malaysia" }, cca3: "MYS", ccn3: "458", capital: ["Kuala Lumpur"], region: "Asia", subregion: "South-Eastern Asia", population: 32365999, flags: { png: "", svg: "", alt: "Malaysia flag" } },
  { name: { common: "South Africa", official: "Republic of South Africa" }, cca3: "ZAF", ccn3: "710", capital: ["Pretoria", "Bloemfontein", "Cape Town"], region: "Africa", subregion: "Southern Africa", population: 59308690, flags: { png: "", svg: "", alt: "South Africa flag" } },
  { name: { common: "Philippines", official: "Republic of the Philippines" }, cca3: "PHL", ccn3: "608", capital: ["Manila"], region: "Asia", subregion: "South-Eastern Asia", population: 109581078, flags: { png: "", svg: "", alt: "Philippines flag" } },
  { name: { common: "Vietnam", official: "Socialist Republic of Vietnam" }, cca3: "VNM", ccn3: "704", capital: ["Hanoi"], region: "Asia", subregion: "South-Eastern Asia", population: 97338579, flags: { png: "", svg: "", alt: "Vietnam flag" } },
  { name: { common: "Egypt", official: "Arab Republic of Egypt" }, cca3: "EGY", ccn3: "818", capital: ["Cairo"], region: "Africa", subregion: "Northern Africa", population: 102334404, flags: { png: "", svg: "", alt: "Egypt flag" } },
  { name: { common: "Pakistan", official: "Islamic Republic of Pakistan" }, cca3: "PAK", ccn3: "586", capital: ["Islamabad"], region: "Asia", subregion: "Southern Asia", population: 220892331, flags: { png: "", svg: "", alt: "Pakistan flag" } },
  { name: { common: "Bangladesh", official: "People's Republic of Bangladesh" }, cca3: "BGD", ccn3: "050", capital: ["Dhaka"], region: "Asia", subregion: "Southern Asia", population: 164689383, flags: { png: "", svg: "", alt: "Bangladesh flag" } },
  { name: { common: "Nigeria", official: "Federal Republic of Nigeria" }, cca3: "NGA", ccn3: "566", capital: ["Abuja"], region: "Africa", subregion: "Western Africa", population: 206139587, flags: { png: "", svg: "", alt: "Nigeria flag" } },
  { name: { common: "Chile", official: "Republic of Chile" }, cca3: "CHL", ccn3: "152", capital: ["Santiago"], region: "Americas", subregion: "South America", population: 19116201, flags: { png: "", svg: "", alt: "Chile flag" } },
  { name: { common: "Colombia", official: "Republic of Colombia" }, cca3: "COL", ccn3: "170", capital: ["Bogotá"], region: "Americas", subregion: "South America", population: 50882891, flags: { png: "", svg: "", alt: "Colombia flag" } },
  { name: { common: "Peru", official: "Republic of Peru" }, cca3: "PER", ccn3: "604", capital: ["Lima"], region: "Americas", subregion: "South America", population: 32971854, flags: { png: "", svg: "", alt: "Peru flag" } },
  { name: { common: "New Zealand", official: "New Zealand" }, cca3: "NZL", ccn3: "554", capital: ["Wellington"], region: "Oceania", subregion: "Australia and New Zealand", population: 5084300, flags: { png: "", svg: "", alt: "New Zealand flag" } },
  { name: { common: "Portugal", official: "Portuguese Republic" }, cca3: "PRT", ccn3: "620", capital: ["Lisbon"], region: "Europe", subregion: "Southern Europe", population: 10347892, flags: { png: "", svg: "", alt: "Portugal flag" } },
  { name: { common: "Greece", official: "Hellenic Republic" }, cca3: "GRC", ccn3: "300", capital: ["Athens"], region: "Europe", subregion: "Southern Europe", population: 10718565, flags: { png: "", svg: "", alt: "Greece flag" } },
  { name: { common: "Czechia", official: "Czech Republic" }, cca3: "CZE", ccn3: "203", capital: ["Prague"], region: "Europe", subregion: "Central Europe", population: 10708981, flags: { png: "", svg: "", alt: "Czechia flag" } },
  { name: { common: "Austria", official: "Republic of Austria" }, cca3: "AUT", ccn3: "040", capital: ["Vienna"], region: "Europe", subregion: "Central Europe", population: 8917205, flags: { png: "", svg: "", alt: "Austria flag" } },
  { name: { common: "Hungary", official: "Hungary" }, cca3: "HUN", ccn3: "348", capital: ["Budapest"], region: "Europe", subregion: "Central Europe", population: 9643048, flags: { png: "", svg: "", alt: "Hungary flag" } },
  { name: { common: "Romania", official: "Romania" }, cca3: "ROU", ccn3: "642", capital: ["Bucharest"], region: "Europe", subregion: "Eastern Europe", population: 19286123, flags: { png: "", svg: "", alt: "Romania flag" } },
  { name: { common: "Ukraine", official: "Ukraine" }, cca3: "UKR", ccn3: "804", capital: ["Kyiv"], region: "Europe", subregion: "Eastern Europe", population: 44134693, flags: { png: "", svg: "", alt: "Ukraine flag" } },
  { name: { common: "Iran", official: "Islamic Republic of Iran" }, cca3: "IRN", ccn3: "364", capital: ["Tehran"], region: "Asia", subregion: "Southern Asia", population: 83992953, flags: { png: "", svg: "", alt: "Iran flag" } },
  { name: { common: "Iraq", official: "Republic of Iraq" }, cca3: "IRQ", ccn3: "368", capital: ["Baghdad"], region: "Asia", subregion: "Western Asia", population: 44496122, flags: { png: "", svg: "", alt: "Iraq flag" } },
  { name: { common: "Qatar", official: "State of Qatar" }, cca3: "QAT", ccn3: "634", capital: ["Doha"], region: "Asia", subregion: "Western Asia", population: 2881060, flags: { png: "", svg: "", alt: "Qatar flag" } },
  { name: { common: "Kuwait", official: "State of Kuwait" }, cca3: "KWT", ccn3: "414", capital: ["Kuwait City"], region: "Asia", subregion: "Western Asia", population: 4268873, flags: { png: "", svg: "", alt: "Kuwait flag" } },
  { name: { common: "New Zealand", official: "New Zealand" }, cca3: "NZL", ccn3: "554", capital: ["Wellington"], region: "Oceania", subregion: "Australia and New Zealand", population: 5084300, flags: { png: "", svg: "", alt: "New Zealand flag" } },
  { name: { common: "Morocco", official: "Kingdom of Morocco" }, cca3: "MAR", ccn3: "504", capital: ["Rabat"], region: "Africa", subregion: "Northern Africa", population: 36910558, flags: { png: "", svg: "", alt: "Morocco flag" } },
  { name: { common: "Kenya", official: "Republic of Kenya" }, cca3: "KEN", ccn3: "404", capital: ["Nairobi"], region: "Africa", subregion: "Eastern Africa", population: 53771296, flags: { png: "", svg: "", alt: "Kenya flag" } },
  { name: { common: "Ethiopia", official: "Federal Democratic Republic of Ethiopia" }, cca3: "ETH", ccn3: "231", capital: ["Addis Ababa"], region: "Africa", subregion: "Eastern Africa", population: 114963583, flags: { png: "", svg: "", alt: "Ethiopia flag" } },
  { name: { common: "Tanzania", official: "United Republic of Tanzania" }, cca3: "TZA", ccn3: "834", capital: ["Dodoma"], region: "Africa", subregion: "Eastern Africa", population: 59734213, flags: { png: "", svg: "", alt: "Tanzania flag" } },
];

// 일부 country는 ccn3 0-prefix (예: 076, 050, 040, 036, 032, 231, 504, 414, 634, 368, 642, 642, 642).
// world-atlas feature id는 numeric string이지만 0-prefix 없는 정수. 매핑은 양쪽 모두 0-prefix strip 후 비교.

export const fetchAllCountries = async (): Promise<Country[]> => {
  // 시그니처는 Promise 유지하되 실제 fetch 없음 (synchronous 반환을 Promise로 wrap)
  // 250+ ms 대기로 loading state 자연스럽게 보임
  return new Promise((resolve) => {
    setTimeout(() => resolve(FALLBACK_COUNTRIES), 0);
  });
};