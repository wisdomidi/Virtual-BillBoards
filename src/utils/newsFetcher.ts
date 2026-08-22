import { CITY_LIVE_UPDATES, CityLiveUpdate } from '../data/cityLiveUpdates';

// Dynamic news headline rotation generator per city
const HEADLINE_ROTATION_VAULT: Record<string, Array<{ headline: string; category: string }>> = {
  KUL: [
    { headline: 'Kuala Lumpur Tech Corridor Expands 24/7 Smart City Virtual Billboard Network', category: 'SMART CITY TECH' },
    { headline: 'Merdeka 118 Towers Launch Interactive High-Definition Programmatic Screens', category: 'URBAN DEV' },
    { headline: 'Petronas Digital Announces Dynamic RTB Autonomous Ad Bidding Hub in KL', category: 'INNOVATION' },
    { headline: 'Bukit Bintang Pedestrian Arcade Upgrades to Solar-Powered Outdoor Displays', category: 'SUSTAINABILITY' }
  ],
  TYO: [
    { headline: 'Tokyo Shibuya District Unveils Next-Gen Zero-Emission Neon Billboard Display', category: 'INNOVATION' },
    { headline: 'Sony Quantum Display Lab Achieves Sub-5ms Real-Time Ad Refresh Rates', category: 'QUANTUM TECH' },
    { headline: 'Ginza Retail Hub Integrates Dynamic Viewership Eye-Tracking Analytics', category: 'SMART MEDIA' },
    { headline: 'Shinjuku 3D Anamorphic Display Breaks Regional Viewership Engagement Records', category: 'DIGITAL ART' }
  ],
  NYC: [
    { headline: 'Broadway Tech Summit Highlights Record Global Ad Engagement in NYC Times Sq', category: 'BUSINESS & MEDIA' },
    { headline: 'Midtown High-Speed Optical Ad Fiber Upgrade Cuts Latency Below 3ms', category: 'INFRASTRUCTURE' },
    { headline: 'JPMorgan FinTech Hub Sponsors Real-Time Programmatic Ad Auctions', category: 'FINTECH' },
    { headline: 'Central Park South Eco-Screens Transition Entirely to Wind Energy Grid', category: 'CLEAN ENERGY' }
  ],
  LON: [
    { headline: 'London Financial District Integrates Real-Time RTB Virtual Billboards', category: 'FINTECH' },
    { headline: 'Piccadilly Circus Iconic Display Integrates Instant API Settlement', category: 'PROGRAMMATIC' },
    { headline: 'Tower Bridge Urban Corridor Installs Environmental Air Quality Sensors on Screens', category: 'SMART CITY' }
  ],
  PAR: [
    { headline: 'Paris Fashion Week Features Live Streamed Billboard Runway Showcase', category: 'LUXURY & DESIGN' },
    { headline: 'Champs-Élysées Digital Canopy Boosts Viewership Engagement by 34%', category: 'RETAIL MEDIA' }
  ],
  SIN: [
    { headline: 'Singapore Marina Bay Sands Deploys Ultra-Fast 5G Programmatic Displays', category: '5G MEDIA' },
    { headline: 'Changi Jewel Hub Integrates Interactive AR Viewer Billboard Triggers', category: 'AR TECH' }
  ],
  DXB: [
    { headline: 'Dubai Museum of Future Records Peak Viewers for Autonomous Ad Bids', category: 'FUTURE TECH' },
    { headline: 'Burj Khalifa Corridor Activates 100% Clean Solar Digital Screens', category: 'CLEAN ENERGY' }
  ],
  SEL: [
    { headline: 'Seoul Gangnam Smart Street Launches 3D K-Pop Live Billboard Stream', category: 'K-TECH' },
    { headline: 'Digital Media City Seoul Achieves Zero Latency RTB Ad Transactions', category: 'MEDIA TECH' }
  ],
  SYD: [
    { headline: 'Sydney Harbour Foreshore Installs Solar-Powered Waterfront Billboards', category: 'GREEN TECH' },
    { headline: 'Opera House Precinct Welcomes Live Global Interactive Stream Slots', category: 'GLOBAL MEDIA' }
  ],
  YTO: [
    { headline: 'Toronto Yonge-Dundas Square Upgrades High-Bright 8K Screen Matrices', category: 'SMART DISPLAY' },
    { headline: 'Financial District Toronto Adopts Instant Automated Slot Purchasing', category: 'FINTECH' }
  ],
  HKG: [
    { headline: 'Hong Kong Victoria Harbour Skyline Activates Real-Time Billboard Bidding', category: 'ASIA MEDIA' },
    { headline: 'Central Pedestrian Skywalk Integrates Smart Geofenced Audience Delivery', category: 'SMART CITY' }
  ],
  LAX: [
    { headline: 'Los Angeles Sunset Strip Launches Instant 60-Second Self-Serve Ad Slots', category: 'ENTERTAINMENT' },
    { headline: 'Hollywood High-Bright Matrix Displays Achieve 99.9% Up-Time Reliability', category: 'MEDIA TECH' }
  ],
  SHA: [
    { headline: 'Shanghai The Bund Financial Center Unveils Ultra-Resolution Curved Matrix', category: 'DISPLAY TECH' },
    { headline: 'Pudong Smart Media District Deploys Automated Geofenced Ad Routing', category: 'PROGRAMMATIC' }
  ],
  BER: [
    { headline: 'Berlin Alexanderplatz Creative Hub Launches Eco-Friendly Digital Billboards', category: 'SUSTAINABILITY' },
    { headline: 'Kreuzberg Tech Corridor Hosts Open-Source Programmatic Ad Summit', category: 'TECH SUMMIT' }
  ],
  SAO: [
    { headline: 'São Paulo Avenida Paulista Celebrates 24/7 Live Digital Media Corridor', category: 'LATAM MEDIA' },
    { headline: 'Faria Lima Financial Avenue Rolls Out Direct $1 Micro-Slot Bidding', category: 'FINTECH' }
  ],
  BKK: [
    { headline: 'Bangkok Sukhumvit Skywalk Launches High-Density Vibrant Neon Matrices', category: 'URBAN TECH' },
    { headline: 'Chao Phraya Riverfront Displays Record High Tourist Engagement', category: 'TOURISM' }
  ],
  AMS: [
    { headline: 'Amsterdam Canal District Deploys Zero-Emission Solar Digital Screens', category: 'CLEAN ENERGY' },
    { headline: 'Museumplein Digital Hub Welcomes Interactive Live Art Showcases', category: 'DIGITAL ART' }
  ],
  MEX: [
    { headline: 'Mexico City Reforma Avenue Deploys High-Bright Smart City Display Hub', category: 'SMART CITY' },
    { headline: 'Polanco Retail District Welcomes Instant Self-Serve Local Business Ads', category: 'LOCAL BIZ' }
  ],
  TPE: [
    { headline: 'Taipei Ximending Pedestrian District Upgrades 8K Curved Anamorphic Display', category: 'ANAMORPHIC' },
    { headline: 'Taipei 101 Mall Corridor Activates Ultra-Fast Sub-10ms Ad Auctions', category: 'HARDWARE TECH' }
  ],
  MUM: [
    { headline: 'Mumbai Marine Drive Promenade Installs High-Definition Coastal Displays', category: 'COASTAL MEDIA' },
    { headline: 'Bandra-Kurla Complex Tech Hub Launches Instant Micro-Slot Bidding', category: 'FINTECH' }
  ]
};

export function getCityHeadlines(cityCode: string): Array<{ headline: string; category: string }> {
  const code = cityCode.toUpperCase();
  if (HEADLINE_ROTATION_VAULT[code] && HEADLINE_ROTATION_VAULT[code].length > 0) {
    return HEADLINE_ROTATION_VAULT[code];
  }
  return [
    { headline: `${code} Smart City Corridor Activates 24/7 Virtual Billboard Broadcast Stream`, category: 'SMART CITY' },
    { headline: `${code} Local Storefronts Gain Instant 60-Second Self-Serve Billboard Access`, category: 'LOCAL BIZ' },
    { headline: `${code} High-Definition Digital Screen Matrix Records Peak Viewer Engagement`, category: 'MEDIA TECH' }
  ];
}

export function getDynamicCityUpdate(cityCode: string): CityLiveUpdate {
  const code = cityCode.toUpperCase();
  const baseUpdate = CITY_LIVE_UPDATES[code] || CITY_LIVE_UPDATES['GLOBAL'];

  // Check if rotation headlines exist
  const headlines = getCityHeadlines(code);
  if (headlines && headlines.length > 0) {
    // Pick headline based on current minute
    const minuteIndex = Math.floor(Date.now() / 30000) % headlines.length;
    const selected = headlines[minuteIndex];
    return {
      ...baseUpdate,
      newsHeadline: selected.headline,
      newsCategory: selected.category
    };
  }

  return baseUpdate;
}
