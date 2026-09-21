export interface WorldCountryGeo {
  id: string;
  name: string;
  arrivals: string;
  level: number; // 0 to 4 (0: <1M, 1: 1M-10M, 2: 10M-50M, 3: 50M-100M, 4: 100M+)
  path: string;
}

// World Map SVG Paths (ViewBox 0 0 1000 500 - Equirectangular / Robinson projection simplified)
export const WORLD_GEO_DATA: WorldCountryGeo[] = [
  // North America
  {
    id: 'usa',
    name: 'United States',
    arrivals: '79.3M',
    level: 3,
    path: 'M 140 135 L 180 130 L 260 132 L 285 165 L 280 200 L 235 220 L 175 220 L 135 180 Z M 60 75 L 120 70 L 105 110 L 65 110 Z',
  },
  {
    id: 'canada',
    name: 'Canada',
    arrivals: '22.1M',
    level: 2,
    path: 'M 115 65 L 275 60 L 305 105 L 260 132 L 180 130 L 140 135 L 115 110 Z',
  },
  {
    id: 'greenland',
    name: 'Greenland',
    arrivals: '0.1M',
    level: 0,
    path: 'M 330 35 L 390 40 L 360 90 L 315 70 Z',
  },
  {
    id: 'mexico',
    name: 'Mexico',
    arrivals: '42.2M',
    level: 2,
    path: 'M 145 205 L 210 220 L 235 260 L 205 275 L 160 230 Z',
  },
  {
    id: 'central_america',
    name: 'Central America & Caribbean',
    arrivals: '8.4M',
    level: 1,
    path: 'M 235 260 L 270 280 L 260 300 L 230 280 Z M 275 240 L 305 245 L 295 260 L 270 255 Z',
  },

  // South America
  {
    id: 'brazil',
    name: 'Brazil',
    arrivals: '6.4M',
    level: 1,
    path: 'M 300 310 L 375 320 L 395 375 L 345 425 L 310 380 L 285 340 Z',
  },
  {
    id: 'argentina_chile',
    name: 'Argentina & Chile',
    arrivals: '7.8M',
    level: 1,
    path: 'M 285 380 L 320 380 L 305 480 L 280 470 Z',
  },
  {
    id: 'colombia_peru',
    name: 'Northern South America',
    arrivals: '5.2M',
    level: 1,
    path: 'M 255 295 L 305 305 L 290 375 L 260 340 Z',
  },

  // Europe
  {
    id: 'france',
    name: 'France',
    arrivals: '89.4M',
    level: 3,
    path: 'M 470 145 L 495 142 L 505 168 L 475 178 L 460 160 Z',
  },
  {
    id: 'spain',
    name: 'Spain & Portugal',
    arrivals: '83.7M',
    level: 3,
    path: 'M 445 175 L 475 178 L 470 210 L 440 205 Z',
  },
  {
    id: 'uk_ireland',
    name: 'United Kingdom & Ireland',
    arrivals: '37.5M',
    level: 2,
    path: 'M 455 110 L 478 112 L 470 140 L 445 130 Z',
  },
  {
    id: 'germany',
    name: 'Germany & Central Europe',
    arrivals: '38.9M',
    level: 2,
    path: 'M 495 135 L 535 130 L 530 165 L 495 165 Z',
  },
  {
    id: 'italy',
    name: 'Italy',
    arrivals: '64.5M',
    level: 3,
    path: 'M 505 165 L 525 168 L 535 205 L 515 210 Z',
  },
  {
    id: 'nordics',
    name: 'Nordic Countries',
    arrivals: '14.2M',
    level: 2,
    path: 'M 490 65 L 545 60 L 540 120 L 495 115 Z',
  },
  {
    id: 'turkiye_greece',
    name: 'Türkiye & SE Europe',
    arrivals: '51.2M',
    level: 3,
    path: 'M 535 165 L 610 170 L 595 200 L 535 195 Z',
  },

  // Russia & Northern Asia
  {
    id: 'russia',
    name: 'Russia',
    arrivals: '12.8M',
    level: 2,
    path: 'M 545 60 L 880 50 L 895 110 L 760 140 L 610 135 L 545 115 Z',
  },

  // Middle East & North Africa
  {
    id: 'middle_east',
    name: 'Middle East',
    arrivals: '28.6M',
    level: 2,
    path: 'M 590 195 L 660 205 L 640 260 L 585 240 Z',
  },
  {
    id: 'north_africa',
    name: 'North Africa',
    arrivals: '21.5M',
    level: 2,
    path: 'M 440 215 L 585 220 L 565 270 L 435 260 Z',
  },
  {
    id: 'sub_saharan_africa',
    name: 'Sub-Saharan Africa',
    arrivals: '18.4M',
    level: 2,
    path: 'M 440 265 L 580 270 L 585 390 L 535 440 L 480 390 L 450 310 Z',
  },

  // Asia
  {
    id: 'china',
    name: 'China',
    arrivals: '65.7M',
    level: 3,
    path: 'M 670 140 L 820 145 L 825 235 L 755 250 L 670 215 Z',
  },
  {
    id: 'india',
    name: 'India & South Asia',
    arrivals: '17.9M',
    level: 2,
    path: 'M 660 210 L 730 215 L 710 295 L 675 290 Z',
  },
  {
    id: 'japan_korea',
    name: 'Japan & South Korea',
    arrivals: '35.4M',
    level: 2,
    path: 'M 835 155 L 880 165 L 860 215 L 825 195 Z',
  },
  {
    id: 'southeast_asia',
    name: 'Southeast Asia (ASEAN)',
    arrivals: '48.9M',
    level: 2,
    path: 'M 740 245 L 815 255 L 830 330 L 745 320 Z',
  },

  // Oceania
  {
    id: 'australia',
    name: 'Australia',
    arrivals: '9.5M',
    level: 1,
    path: 'M 770 345 L 880 340 L 890 425 L 785 430 Z',
  },
  {
    id: 'new_zealand',
    name: 'New Zealand',
    arrivals: '3.9M',
    level: 1,
    path: 'M 915 425 L 945 420 L 935 465 L 910 455 Z',
  },
];
