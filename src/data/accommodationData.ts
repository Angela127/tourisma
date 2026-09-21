export interface AccommodationStateData {
  id: string;
  name: string;
  code: string;
  rooms: number;
  visitors: number; // in millions
  aor: number;
}

export const ACCOMMODATION_DATA: AccommodationStateData[] = [
  { id: 'JHR', name: 'Johor', code: 'JHR', rooms: 35799, visitors: 18.197, aor: 54.2 },
  { id: 'KDH', name: 'Kedah', code: 'KDH', rooms: 18679, visitors: 15.608, aor: 46.4 },
  { id: 'KTN', name: 'Kelantan', code: 'KTN', rooms: 6392, visitors: 12.062, aor: 41.0 },
  { id: 'MLK', name: 'Melaka', code: 'MLK', rooms: 20655, visitors: 20.832, aor: 44.2 },
  { id: 'NSN', name: 'Negeri Sembilan', code: 'NSN', rooms: 11527, visitors: 19.357, aor: 46.1 },
  { id: 'PHG', name: 'Pahang', code: 'PHG', rooms: 34401, visitors: 23.161, aor: 76.3 },
  { id: 'PRK', name: 'Perak', code: 'PRK', rooms: 19572, visitors: 23.642, aor: 45.6 },
  { id: 'PLS', name: 'Perlis', code: 'PLS', rooms: 1553, visitors: 3.756, aor: 41.7 },
  { id: 'PNG', name: 'Pulau Pinang', code: 'PNG', rooms: 28045, visitors: 17.718, aor: 50.9 },
  { id: 'SBH', name: 'Sabah', code: 'SBH', rooms: 27254, visitors: 22.361, aor: 54.1 },
  { id: 'SWK', name: 'Sarawak', code: 'SWK', rooms: 28236, visitors: 22.722, aor: 47.3 },
  { id: 'SGR', name: 'Selangor', code: 'SGR', rooms: 35066, visitors: 36.376, aor: 54.8 },
  { id: 'TRG', name: 'Terengganu', code: 'TRG', rooms: 11314, visitors: 15.462, aor: 45.4 },
  { id: 'KUL', name: 'W.P. Kuala Lumpur', code: 'KUL', rooms: 66133, visitors: 35.060, aor: 66.9 },
  { id: 'LBN', name: 'W.P. Labuan', code: 'LBN', rooms: 2298, visitors: 0.604, aor: 46.9 },
  { id: 'PJY', name: 'W.P. Putrajaya', code: 'PJY', rooms: 2656, visitors: 3.146, aor: 62.6 }
];
