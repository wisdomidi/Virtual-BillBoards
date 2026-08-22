export interface RoadTrafficItem {
  roadName: string;
  status: 'Smooth' | 'Moderate' | 'Heavy';
  congestionPercent: number; // 0-100%
  avgSpeedKmH: number;
  color: string;
}

export interface CityLiveUpdate {
  cityCode: string;
  weather: {
    tempC: number;
    condition: string;
    humidity: string;
    icon: string;
  };
  traffic: {
    status: 'Smooth' | 'Moderate' | 'Heavy';
    avgSpeedKmH: number;
    mainCorridor: string;
    color: string;
    roads: RoadTrafficItem[];
  };
  newsHeadline: string;
  newsCategory: string;
}

export const CITY_LIVE_UPDATES: Record<string, CityLiveUpdate> = {
  KUL: {
    cityCode: 'KUL',
    weather: { tempC: 31, condition: 'Tropical Sunshine & Light Clouds', humidity: '78%', icon: '☀️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 34,
      mainCorridor: 'KLCC Jalan Ampang & AKLEH Highway',
      color: '#f59e0b',
      roads: [
        { roadName: 'Jalan Ampang / KLCC Loop', status: 'Moderate', congestionPercent: 62, avgSpeedKmH: 28, color: '#f59e0b' },
        { roadName: 'AKLEH Elevated Expressway', status: 'Smooth', congestionPercent: 20, avgSpeedKmH: 75, color: '#10b981' },
        { roadName: 'Jalan Sultan Ismail Triangle', status: 'Heavy', congestionPercent: 86, avgSpeedKmH: 14, color: '#ef4444' },
        { roadName: 'Federal Highway Corridor', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 45, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Kuala Lumpur Tech Corridor Expands 24/7 Smart City Virtual Billboard Network',
    newsCategory: 'SMART CITY TECH'
  },
  TYO: {
    cityCode: 'TYO',
    weather: { tempC: 22, condition: 'Clear Sky & Cool Breeze', humidity: '52%', icon: '🌤️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 32,
      mainCorridor: 'Shibuya Crossing & Shinjuku Expressway 4',
      color: '#f59e0b',
      roads: [
        { roadName: 'Shibuya Scramble Crossing', status: 'Heavy', congestionPercent: 84, avgSpeedKmH: 12, color: '#ef4444' },
        { roadName: 'Shinjuku Expressway Route 4', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 32, color: '#f59e0b' },
        { roadName: 'Roppongi Hills Main Boulevard', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 58, color: '#10b981' },
        { roadName: 'Harajuku Meiji-dori Avenue', status: 'Moderate', congestionPercent: 55, avgSpeedKmH: 28, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Tokyo Shibuya District Unveils Next-Gen Zero-Emission Neon Billboard Display',
    newsCategory: 'INNOVATION'
  },
  NYC: {
    cityCode: 'NYC',
    weather: { tempC: 24, condition: 'Partly Cloudy', humidity: '58%', icon: '⛅' },
    traffic: {
      status: 'Heavy',
      avgSpeedKmH: 14,
      mainCorridor: 'Times Square 7th Ave & Midtown Tunnel',
      color: '#ef4444',
      roads: [
        { roadName: 'Times Square 7th Avenue', status: 'Heavy', congestionPercent: 92, avgSpeedKmH: 8, color: '#ef4444' },
        { roadName: 'FDR Drive Northbound', status: 'Moderate', congestionPercent: 42, avgSpeedKmH: 45, color: '#f59e0b' },
        { roadName: 'Lincoln Tunnel Approach', status: 'Heavy', congestionPercent: 86, avgSpeedKmH: 10, color: '#ef4444' },
        { roadName: 'Brooklyn Bridge Access', status: 'Smooth', congestionPercent: 24, avgSpeedKmH: 55, color: '#10b981' }
      ]
    },
    newsHeadline: 'Broadway Tech Summit Highlights Record Global Ad Engagement in NYC',
    newsCategory: 'BUSINESS & MEDIA'
  },
  LON: {
    cityCode: 'LON',
    weather: { tempC: 19, condition: 'Mild Breeze & Scattered Sun', humidity: '65%', icon: '🌥️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 26,
      mainCorridor: 'Piccadilly Circus & Tower Bridge Road',
      color: '#f59e0b',
      roads: [
        { roadName: 'Piccadilly Circus Corridor', status: 'Heavy', congestionPercent: 78, avgSpeedKmH: 14, color: '#ef4444' },
        { roadName: 'M25 Orbital Motorway', status: 'Smooth', congestionPercent: 28, avgSpeedKmH: 68, color: '#10b981' },
        { roadName: 'Tower Bridge Approach', status: 'Moderate', congestionPercent: 58, avgSpeedKmH: 24, color: '#f59e0b' },
        { roadName: 'Regent Street Mile', status: 'Heavy', congestionPercent: 82, avgSpeedKmH: 11, color: '#ef4444' }
      ]
    },
    newsHeadline: 'London Financial District Integrates Real-Time RTB Virtual Billboards',
    newsCategory: 'FINTECH'
  },
  PAR: {
    cityCode: 'PAR',
    weather: { tempC: 21, condition: 'Pleasant & Sunny', humidity: '55%', icon: '☀️' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 38,
      mainCorridor: 'Champs-Élysées & Périphérique North',
      color: '#10b981',
      roads: [
        { roadName: 'Avenue des Champs-Élysées', status: 'Smooth', congestionPercent: 22, avgSpeedKmH: 42, color: '#10b981' },
        { roadName: 'Boulevard Périphérique Ring', status: 'Heavy', congestionPercent: 80, avgSpeedKmH: 18, color: '#ef4444' },
        { roadName: 'Rue de Rivoli Corridor', status: 'Moderate', congestionPercent: 52, avgSpeedKmH: 26, color: '#f59e0b' },
        { roadName: 'Pont Neuf Seine Expressway', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 54, color: '#10b981' }
      ]
    },
    newsHeadline: 'Paris Fashion Week Features Live Streamed Billboard Runway Showcase',
    newsCategory: 'LUXURY & DESIGN'
  },
  SIN: {
    cityCode: 'SIN',
    weather: { tempC: 32, condition: 'Warm & Tropical Breeze', humidity: '82%', icon: '🌤️' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 52,
      mainCorridor: 'Marina Coastal Expressway (MCE)',
      color: '#10b981',
      roads: [
        { roadName: 'Marina Coastal Expressway (MCE)', status: 'Smooth', congestionPercent: 15, avgSpeedKmH: 65, color: '#10b981' },
        { roadName: 'Orchard Road Retail Belt', status: 'Moderate', congestionPercent: 45, avgSpeedKmH: 32, color: '#f59e0b' },
        { roadName: 'East Coast Parkway (ECP)', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 70, color: '#10b981' },
        { roadName: 'Central Expressway (CTE) Tunnel', status: 'Moderate', congestionPercent: 58, avgSpeedKmH: 28, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Singapore Fintech Hub Records Highest RTB Ad Bidding Yield in SEA',
    newsCategory: 'ECONOMY'
  },
  DXB: {
    cityCode: 'DXB',
    weather: { tempC: 36, condition: 'Clear & Radiant Sunlight', humidity: '45%', icon: '☀️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 65,
      mainCorridor: 'Sheikh Zayed Road & Downtown Burj Corridor',
      color: '#f59e0b',
      roads: [
        { roadName: 'Sheikh Zayed 14-Lane Highway', status: 'Moderate', congestionPercent: 38, avgSpeedKmH: 72, color: '#f59e0b' },
        { roadName: 'Downtown Burj Khalifa Blvd', status: 'Heavy', congestionPercent: 75, avgSpeedKmH: 22, color: '#ef4444' },
        { roadName: 'Al Khail Road Bypass', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 88, color: '#10b981' },
        { roadName: 'Dubai Marina Promenade', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 35, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Dubai Future Foundation Launches 24-Hour Autonomous Digital Display Grid',
    newsCategory: 'FUTURE TECH'
  },
  SEL: {
    cityCode: 'SEL',
    weather: { tempC: 23, condition: 'Clear Sky', humidity: '50%', icon: '☀️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 28,
      mainCorridor: 'Gangnam-daero & Namsan Tunnel 1',
      color: '#f59e0b',
      roads: [
        { roadName: 'Gangnam-daero Main Avenue', status: 'Heavy', congestionPercent: 82, avgSpeedKmH: 16, color: '#ef4444' },
        { roadName: 'Olympic Expressway Riverside', status: 'Moderate', congestionPercent: 44, avgSpeedKmH: 48, color: '#f59e0b' },
        { roadName: 'Namsan Tunnel 1 Approach', status: 'Heavy', congestionPercent: 78, avgSpeedKmH: 20, color: '#ef4444' },
        { roadName: 'Teheran-ro Tech Corridor', status: 'Moderate', congestionPercent: 50, avgSpeedKmH: 30, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Seoul Gangnam High-Tech District Rolls Out Interactive Viewer Rewards',
    newsCategory: 'K-TECH'
  },
  SYD: {
    cityCode: 'SYD',
    weather: { tempC: 20, condition: 'Coastal Breeze & Sunny', humidity: '60%', icon: '🌤️' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 45,
      mainCorridor: 'Sydney Harbour Bridge & Cahill Expressway',
      color: '#10b981',
      roads: [
        { roadName: 'Sydney Harbour Bridge Fwy', status: 'Smooth', congestionPercent: 24, avgSpeedKmH: 52, color: '#10b981' },
        { roadName: 'Cahill Expressway Promenade', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 60, color: '#10b981' },
        { roadName: 'George Street Light Rail Belt', status: 'Moderate', congestionPercent: 46, avgSpeedKmH: 25, color: '#f59e0b' },
        { roadName: 'Anzac Bridge Westward', status: 'Smooth', congestionPercent: 22, avgSpeedKmH: 65, color: '#10b981' }
      ]
    },
    newsHeadline: 'Sydney Harbour Waterfront Upgrades Solar-Powered Digital Displays',
    newsCategory: 'GREEN ENERGY'
  },
  YTO: {
    cityCode: 'YTO',
    weather: { tempC: 22, condition: 'Crisp & Clear', humidity: '54%', icon: '☀️' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 50,
      mainCorridor: 'Gardiner Expressway & Yonge Street',
      color: '#10b981',
      roads: [
        { roadName: 'Gardiner Expressway Westbound', status: 'Heavy', congestionPercent: 76, avgSpeedKmH: 22, color: '#ef4444' },
        { roadName: 'Yonge-Dundas Square Corridor', status: 'Heavy', congestionPercent: 84, avgSpeedKmH: 14, color: '#ef4444' },
        { roadName: 'Don Valley Parkway (DVP)', status: 'Moderate', congestionPercent: 52, avgSpeedKmH: 42, color: '#f59e0b' },
        { roadName: 'Bay Street Financial District', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 28, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Toronto Waterfront District Expands Virtual Billboard Infrastructure',
    newsCategory: 'INFRASTRUCTURE'
  },
  HKG: {
    cityCode: 'HKG',
    weather: { tempC: 28, condition: 'Humid & Partly Sunny', humidity: '80%', icon: '🌤️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 24,
      mainCorridor: 'Cross-Harbour Tunnel & Central Elevated',
      color: '#f59e0b',
      roads: [
        { roadName: 'Cross-Harbour Tunnel Approach', status: 'Heavy', congestionPercent: 90, avgSpeedKmH: 9, color: '#ef4444' },
        { roadName: 'Central Elevated Highway', status: 'Moderate', congestionPercent: 54, avgSpeedKmH: 32, color: '#f59e0b' },
        { roadName: 'Nathan Road Kowloon Belt', status: 'Heavy', congestionPercent: 82, avgSpeedKmH: 12, color: '#ef4444' },
        { roadName: 'Island Eastern Corridor', status: 'Smooth', congestionPercent: 22, avgSpeedKmH: 58, color: '#10b981' }
      ]
    },
    newsHeadline: 'Hong Kong Victoria Harbour Neon Skyline Adopts AI Content Verification',
    newsCategory: 'AI & SAFETY'
  },
  LAX: {
    cityCode: 'LAX',
    weather: { tempC: 26, condition: 'Golden Sunset & Light Mist', humidity: '58%', icon: '🌅' },
    traffic: {
      status: 'Heavy',
      avgSpeedKmH: 18,
      mainCorridor: 'I-405 San Diego Fwy & Sunset Boulevard',
      color: '#ef4444',
      roads: [
        { roadName: 'I-405 San Diego Freeway', status: 'Heavy', congestionPercent: 94, avgSpeedKmH: 12, color: '#ef4444' },
        { roadName: 'Sunset Boulevard Strip', status: 'Heavy', congestionPercent: 80, avgSpeedKmH: 18, color: '#ef4444' },
        { roadName: 'US-101 Hollywood Freeway', status: 'Heavy', congestionPercent: 88, avgSpeedKmH: 14, color: '#ef4444' },
        { roadName: 'Pacific Coast Highway (PCH)', status: 'Smooth', congestionPercent: 28, avgSpeedKmH: 55, color: '#10b981' }
      ]
    },
    newsHeadline: 'Hollywood Entertainment Agencies Shift 40% Ad Budget to Virtual Billboards',
    newsCategory: 'ENTERTAINMENT'
  },
  SHA: {
    cityCode: 'SHA',
    weather: { tempC: 25, condition: 'Mild & Clear', humidity: '62%', icon: '🌤️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 30,
      mainCorridor: 'Yan\'an Elevated Road & The Bund Expressway',
      color: '#f59e0b',
      roads: [
        { roadName: 'Yan\'an Elevated Road Matrix', status: 'Heavy', congestionPercent: 78, avgSpeedKmH: 20, color: '#ef4444' },
        { roadName: 'The Bund Waterfront Avenue', status: 'Moderate', congestionPercent: 52, avgSpeedKmH: 30, color: '#f59e0b' },
        { roadName: 'Pudong Century Avenue', status: 'Smooth', congestionPercent: 22, avgSpeedKmH: 52, color: '#10b981' },
        { roadName: 'Nanpu Bridge Outer Ring', status: 'Moderate', congestionPercent: 46, avgSpeedKmH: 42, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Shanghai Pudong Financial Center Sets New Record in Programmatic Ads',
    newsCategory: 'GLOBAL TRADE'
  },
  BER: {
    cityCode: 'BER',
    weather: { tempC: 20, condition: 'Mild & Sunny', humidity: '53%', icon: '☀️' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 42,
      mainCorridor: 'Alexanderplatz & Stadtring A100',
      color: '#10b981',
      roads: [
        { roadName: 'Alexanderplatz City Ring', status: 'Smooth', congestionPercent: 26, avgSpeedKmH: 42, color: '#10b981' },
        { roadName: 'Stadtring A100 Highway', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 62, color: '#f59e0b' },
        { roadName: 'Friedrichstraße Corridor', status: 'Moderate', congestionPercent: 42, avgSpeedKmH: 28, color: '#f59e0b' },
        { roadName: 'Unter den Linden Boulevard', status: 'Smooth', congestionPercent: 20, avgSpeedKmH: 38, color: '#10b981' }
      ]
    },
    newsHeadline: 'Berlin Tech Incubator Launches Open-Source Billboard Streaming Standard',
    newsCategory: 'OPEN SOURCE'
  },
  SAO: {
    cityCode: 'SAO',
    weather: { tempC: 24, condition: 'Scattered Clouds', humidity: '68%', icon: '⛅' },
    traffic: {
      status: 'Heavy',
      avgSpeedKmH: 16,
      mainCorridor: 'Avenida Paulista & Marginal Pinheiros',
      color: '#ef4444',
      roads: [
        { roadName: 'Avenida Paulista Strip', status: 'Heavy', congestionPercent: 88, avgSpeedKmH: 12, color: '#ef4444' },
        { roadName: 'Marginal Pinheiros Fwy', status: 'Heavy', congestionPercent: 92, avgSpeedKmH: 10, color: '#ef4444' },
        { roadName: 'Avenida Faria Lima Belt', status: 'Heavy', congestionPercent: 80, avgSpeedKmH: 16, color: '#ef4444' },
        { roadName: 'Radial Leste Highway', status: 'Moderate', congestionPercent: 58, avgSpeedKmH: 28, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'São Paulo Digital Media Alliance Expands Programmatic Outdoor Reach',
    newsCategory: 'LATAM MEDIA'
  },
  BKK: {
    cityCode: 'BKK',
    weather: { tempC: 33, condition: 'Tropical Warmth & Golden Sunshine', humidity: '76%', icon: '☀️' },
    traffic: {
      status: 'Heavy',
      avgSpeedKmH: 12,
      mainCorridor: 'Sukhumvit Road & Sirat Expressway',
      color: '#ef4444',
      roads: [
        { roadName: 'Sukhumvit Road Commercial Spine', status: 'Heavy', congestionPercent: 95, avgSpeedKmH: 5, color: '#ef4444' },
        { roadName: 'Sirat Expressway Tollway', status: 'Moderate', congestionPercent: 42, avgSpeedKmH: 55, color: '#f59e0b' },
        { roadName: 'Rama IV Sathorn Interchange', status: 'Heavy', congestionPercent: 88, avgSpeedKmH: 9, color: '#ef4444' },
        { roadName: 'Silom Business Avenue', status: 'Heavy', congestionPercent: 82, avgSpeedKmH: 12, color: '#ef4444' }
      ]
    },
    newsHeadline: 'Bangkok Sukhumvit Skywalk Launches High-Density Vibrant Neon Matrices',
    newsCategory: 'URBAN TECH'
  },
  AMS: {
    cityCode: 'AMS',
    weather: { tempC: 18, condition: 'Fresh Canal Breeze & Mild Sun', humidity: '64%', icon: '🌤️' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 42,
      mainCorridor: 'A10 Ring Road & Herengracht Canal',
      color: '#10b981',
      roads: [
        { roadName: 'Herengracht Canal Ring', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 25, color: '#10b981' },
        { roadName: 'A10 Ring Road Ringbaan', status: 'Moderate', congestionPercent: 38, avgSpeedKmH: 70, color: '#f59e0b' },
        { roadName: 'Damrak Station Square', status: 'Moderate', congestionPercent: 52, avgSpeedKmH: 18, color: '#f59e0b' },
        { roadName: 'Museumplein Art Corridor', status: 'Smooth', congestionPercent: 20, avgSpeedKmH: 32, color: '#10b981' }
      ]
    },
    newsHeadline: 'Amsterdam Canal District Deploys Zero-Emission Solar Digital Screens',
    newsCategory: 'CLEAN ENERGY'
  },
  MEX: {
    cityCode: 'MEX',
    weather: { tempC: 22, condition: 'Pleasant Highland Sunlight', humidity: '50%', icon: '☀️' },
    traffic: {
      status: 'Heavy',
      avgSpeedKmH: 15,
      mainCorridor: 'Paseo de la Reforma & Periférico Sur',
      color: '#ef4444',
      roads: [
        { roadName: 'Paseo de la Reforma Boulevard', status: 'Heavy', congestionPercent: 88, avgSpeedKmH: 11, color: '#ef4444' },
        { roadName: 'Periférico Sur Highway', status: 'Heavy', congestionPercent: 92, avgSpeedKmH: 8, color: '#ef4444' },
        { roadName: 'Avenida Insurgentes Sur', status: 'Heavy', congestionPercent: 82, avgSpeedKmH: 14, color: '#ef4444' },
        { roadName: 'Polanco Masaryk Avenue', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 26, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Mexico City Reforma Avenue Deploys High-Bright Smart City Display Hub',
    newsCategory: 'SMART CITY'
  },
  TPE: {
    cityCode: 'TPE',
    weather: { tempC: 27, condition: 'Mild Subtropical Sun', humidity: '72%', icon: '🌤️' },
    traffic: {
      status: 'Moderate',
      avgSpeedKmH: 30,
      mainCorridor: 'Civic Boulevard & Ximending District',
      color: '#f59e0b',
      roads: [
        { roadName: 'Ximending Pedestrian District', status: 'Moderate', congestionPercent: 42, avgSpeedKmH: 22, color: '#f59e0b' },
        { roadName: 'Civic Boulevard Expressway', status: 'Smooth', congestionPercent: 25, avgSpeedKmH: 60, color: '#10b981' },
        { roadName: 'Keelung Road Elevated', status: 'Heavy', congestionPercent: 76, avgSpeedKmH: 18, color: '#ef4444' },
        { roadName: 'Xinyi Commercial Plaza', status: 'Moderate', congestionPercent: 50, avgSpeedKmH: 28, color: '#f59e0b' }
      ]
    },
    newsHeadline: 'Taipei Ximending Pedestrian District Upgrades 8K Curved Anamorphic Display',
    newsCategory: 'ANAMORPHIC'
  },
  MUM: {
    cityCode: 'MUM',
    weather: { tempC: 30, condition: 'Warm Coastal Breeze & Clear Sky', humidity: '80%', icon: '☀️' },
    traffic: {
      status: 'Heavy',
      avgSpeedKmH: 14,
      mainCorridor: 'Western Express Hwy & Marine Drive',
      color: '#ef4444',
      roads: [
        { roadName: 'Western Express Highway (WEH)', status: 'Heavy', congestionPercent: 94, avgSpeedKmH: 8, color: '#ef4444' },
        { roadName: 'Bandra-Worli Sea Link', status: 'Smooth', congestionPercent: 18, avgSpeedKmH: 68, color: '#10b981' },
        { roadName: 'Marine Drive Promenade', status: 'Moderate', congestionPercent: 48, avgSpeedKmH: 32, color: '#f59e0b' },
        { roadName: 'LBS Marg Kurla Corridor', status: 'Heavy', congestionPercent: 88, avgSpeedKmH: 10, color: '#ef4444' }
      ]
    },
    newsHeadline: 'Mumbai Marine Drive Promenade Installs High-Definition Coastal Displays',
    newsCategory: 'COASTAL MEDIA'
  },
  GLOBAL: {
    cityCode: 'GLOBAL',
    weather: { tempC: 22, condition: 'Global Satellite Orbit Average', humidity: '55%', icon: '🌐' },
    traffic: {
      status: 'Smooth',
      avgSpeedKmH: 28000,
      mainCorridor: 'International Satellite Relay Ring 24/7 Stream',
      color: '#38bdf8',
      roads: [
        { roadName: 'Earth Geostationary Orbit Belt', status: 'Smooth', congestionPercent: 2, avgSpeedKmH: 28000, color: '#38bdf8' },
        { roadName: 'Transatlantic Fiber Backbone', status: 'Smooth', congestionPercent: 5, avgSpeedKmH: 300000, color: '#10b981' },
        { roadName: 'Transpacific Optical Subsea Trunk', status: 'Smooth', congestionPercent: 4, avgSpeedKmH: 300000, color: '#10b981' }
      ]
    },
    newsHeadline: 'World First 24/7 Virtual Billboard Space Reaches 150+ Countries Simultaneously',
    newsCategory: 'GLOBAL BROADCAST'
  }
};

