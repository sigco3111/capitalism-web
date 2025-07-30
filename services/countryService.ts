import type { Country } from '../types';

// We fetch a minimal set of fields to keep the initial load fast, now including ccn3 for reliable matching.
const API_URL = 'https://restcountries.com/v3.1/all?fields=name,cca3,ccn3,capital,region,subregion,population,flags';

export const fetchAllCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error('Failed to fetch country data');
    }
    const data: Country[] = await response.json();
    // Filter out countries that don't have a ccn3 code to prevent matching issues with map data.
    return data.filter(c => c.ccn3);
  } catch (error) {
    console.error("Error fetching countries:", error);
    // Return an empty array on error to prevent the app from crashing.
    return [];
  }
};