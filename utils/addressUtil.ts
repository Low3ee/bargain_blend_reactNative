// Fixed country value for the Philippines.
export const FIXED_COUNTRY = 'Philippines';

/**
 * A complete list of provinces in the Philippines.
 * Source: Official administrative divisions.
 */
export const PHILIPPINE_PROVINCES = [
  "Abra",
  "Agusan del Norte",
  "Agusan del Sur",
  "Aklan",
  "Albay",
  "Antique",
  "Apayao",
  "Aurora",
  "Basilan",
  "Bataan",
  "Batanes",
  "Batangas",
  "Benguet",
  "Biliran",
  "Bohol",
  "Bukidnon",
  "Bulacan",
  "Cagayan",
  "Camarines Norte",
  "Camarines Sur",
  "Camiguin",
  "Capiz",
  "Catanduanes",
  "Cavite",
  "Cebu",
  "Davao del Norte",
  "Davao del Sur",
  "Davao Occidental",
  "Davao Oriental",
  "Dinagat Islands",
  "Eastern Samar",
  "Guimaras",
  "Ifugao",
  "Ilocos Norte",
  "Ilocos Sur",
  "Iloilo",
  "Isabela",
  "Kalinga",
  "La Union",
  "Laguna",
  "Lanao del Norte",
  "Lanao del Sur",
  "Leyte",
  "Maguindanao",
  "Marinduque",
  "Masbate",
  "Misamis Occidental",
  "Misamis Oriental",
  "Mountain Province",
  "Negros Occidental",
  "Negros Oriental",
  "Northern Samar",
  "Nueva Ecija",
  "Nueva Vizcaya",
  "Occidental Mindoro",
  "Oriental Mindoro",
  "Palawan",
  "Pampanga",
  "Pangasinan",
  "Quezon",
  "Quirino",
  "Rizal",
  "Romblon",
  "Samar (Western Samar)",
  "Sarangani",
  "Siquijor",
  "Sorsogon",
  "South Cotabato",
  "Southern Leyte",
  "Sultan Kudarat",
  "Sulu",
  "Surigao del Norte",
  "Surigao del Sur",
  "Tarlac",
  "Tawi-Tawi",
  "Zambales",
  "Zamboanga del Norte",
  "Zamboanga del Sur",
  "Zamboanga Sibugay"
];

/**
 * A comprehensive list of cities in the Philippines.
 * This list includes Metro Manila cities, major urban centers in Luzon, Visayas, and Mindanao,
 * and additional cities. You can update or extend this list as needed.
 */
export const PHILIPPINE_CITIES = [
  // Metro Manila
  "Manila",
  "Quezon City",
  "Caloocan",
  "Las Piñas",
  "Makati",
  "Malabon",
  "Mandaluyong",
  "Marikina",
  "Muntinlupa",
  "Navotas",
  "Parañaque",
  "Pasay",
  "Pasig",
  "Pateros",
  "San Juan",
  // Luzon (Other Regions)
  "Angeles City",
  "San Fernando",       // Pampanga
  "Olongapo",
  "Lucena",
  "Batangas City",
  "Lipa",
  "Tanauan",
  "Dagupan",
  "Urdaneta",
  "Tarlac City",
  "Cabanatuan",
  "Ilagan",
  "San Jose del Monte",
  "Calamba",
  "Imus",
  "Dasmariñas",
  "Santa Rosa",
  "Meycauayan",
  // Visayas
  "Cebu City",
  "Lapu-Lapu City",
  "Mandaue",
  "Iloilo City",
  "Bacolod",
  "Dumaguete",
  "Roxas",
  "Kalibo",
  "San Carlos",        // Negros Occidental / Pangasinan area
  // Mindanao
  "Davao City",
  "General Santos",
  "Cagayan de Oro",
  "Butuan",
  "Zamboanga City",
  "Pagadian",
  "Cotabato City",
  "Malaybalay",
  "Tagum",
  "Surigao City",
  "Dipolog",
  // Additional Cities (including some repeated in different regions)
  "Antipolo",
  "San Pablo",
  "Baguio",
  "Vigan",
  "Legazpi City",
  "Iligan City",
  "Ozamiz",
  "Gingoog",
  "Marawi",
  "Sagay",
  "Escalante",
  "Bogo",
  "Guihulngan",
  "Ormoc",
  "Bayawan",
  "Tacloban",
  "Talisay",
  "Trece Martires",
  // Note: This list is comprehensive but may be updated to include any changes or additional cities.
];

/**
 * Helper function to format an address.
 * It accepts street, city, province, and zip code and always appends the fixed country.
 */
export function formatAddress({
  contact,
  street,
  city,
  province,
  zip,
}: {
  contact: string;
  street: string;
  city: string;
  province: string;
  zip: string;
}): string {
  return `Contact No: ${contact} \n ${street}, ${city}, ${province}, ${zip}, ${FIXED_COUNTRY}`;
}

/**
 * Validate that the given city and province exist in the Philippines.
 * Returns true only if both the city and province are found in their respective lists.
 */
export function isValidLocation(city: string, province: string): boolean {
  const validCity = PHILIPPINE_CITIES.includes(city);
  const validProvince = PHILIPPINE_PROVINCES.includes(province);
  return validCity && validProvince;
}
