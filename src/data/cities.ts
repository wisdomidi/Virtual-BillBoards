export interface GlobalCityItem {
  cityCode: string;
  countryCode: string;
  cityName: string;
  countryName: string;
  flagEmoji: string;
  landmark: string;
  reserveFloorDollars: number;
}

export const GLOBAL_FEED_OPTION: GlobalCityItem = {
  cityCode: 'GLOBAL',
  countryCode: 'GLOBAL',
  cityName: 'Global Distributed Feed (All Screens Everywhere)',
  countryName: 'Worldwide',
  flagEmoji: '🌐',
  landmark: 'Orbit & Distributed 24/7 Network',
  reserveFloorDollars: 1.00
};

export const GLOBAL_CITIES: GlobalCityItem[] = [
  GLOBAL_FEED_OPTION,
  { cityCode: 'NYC', countryCode: 'US', cityName: 'New York City', countryName: 'United States', flagEmoji: '🇺🇸', landmark: 'Times Square & Broadway', reserveFloorDollars: 2.50 },
  { cityCode: 'TYO', countryCode: 'JP', cityName: 'Tokyo', countryName: 'Japan', flagEmoji: '🇯🇵', landmark: 'Shibuya Crossing & Shinjuku', reserveFloorDollars: 2.50 },
  { cityCode: 'LON', countryCode: 'UK', cityName: 'London', countryName: 'United Kingdom', flagEmoji: '🇬🇧', landmark: 'Piccadilly Circus & Leicester Sq', reserveFloorDollars: 2.00 },
  { cityCode: 'PAR', countryCode: 'FR', cityName: 'Paris', countryName: 'France', flagEmoji: '🇫🇷', landmark: 'Champs-Élysées & Eiffel', reserveFloorDollars: 2.00 },
  { cityCode: 'KUL', countryCode: 'MY', cityName: 'Kuala Lumpur', countryName: 'Malaysia', flagEmoji: '🇲🇾', landmark: 'Petronas Towers & Bukit Bintang', reserveFloorDollars: 1.00 },
  { cityCode: 'SIN', countryCode: 'SG', cityName: 'Singapore', countryName: 'Singapore', flagEmoji: '🇸🇬', landmark: 'Marina Bay & Orchard Rd', reserveFloorDollars: 2.00 },
  { cityCode: 'DXB', countryCode: 'AE', cityName: 'Dubai', countryName: 'United Arab Emirates', flagEmoji: '🇦🇪', landmark: 'Downtown & Burj Khalifa', reserveFloorDollars: 2.50 },
  { cityCode: 'SEL', countryCode: 'KR', cityName: 'Seoul', countryName: 'South Korea', flagEmoji: '🇰🇷', landmark: 'Gangnam & Myeongdong', reserveFloorDollars: 2.00 },
  { cityCode: 'SYD', countryCode: 'AU', cityName: 'Sydney', countryName: 'Australia', flagEmoji: '🇦🇺', landmark: 'Sydney Harbour & Opera House', reserveFloorDollars: 1.50 },
  { cityCode: 'BER', countryCode: 'DE', cityName: 'Berlin', countryName: 'Germany', flagEmoji: '🇩🇪', landmark: 'Alexanderplatz & Potsdamer', reserveFloorDollars: 1.50 },
  { cityCode: 'AMS', countryCode: 'NL', cityName: 'Amsterdam', countryName: 'Netherlands', flagEmoji: '🇳🇱', landmark: 'Dam Square & Canal Ring', reserveFloorDollars: 1.50 },
  { cityCode: 'SAO', countryCode: 'BR', cityName: 'São Paulo', countryName: 'Brazil', flagEmoji: '🇧🇷', landmark: 'Avenida Paulista', reserveFloorDollars: 1.00 },
  { cityCode: 'MEX', countryCode: 'MX', cityName: 'Mexico City', countryName: 'Mexico', flagEmoji: '🇲🇽', landmark: 'Zócalo & Reforma', reserveFloorDollars: 1.00 },
  { cityCode: 'TPE', countryCode: 'TW', cityName: 'Taipei', countryName: 'Taiwan', flagEmoji: '🇹🇼', landmark: 'Ximending & Taipei 101', reserveFloorDollars: 1.50 },
  { cityCode: 'MUM', countryCode: 'IN', cityName: 'Mumbai', countryName: 'India', flagEmoji: '🇮🇳', landmark: 'Marine Drive & Bandra', reserveFloorDollars: 1.00 },
  { cityCode: 'HKG', countryCode: 'HK', cityName: 'Hong Kong', countryName: 'Hong Kong', flagEmoji: '🇭🇰', landmark: 'Central & Causeway Bay', reserveFloorDollars: 2.00 },
  { cityCode: 'BKK', countryCode: 'TH', cityName: 'Bangkok', countryName: 'Thailand', flagEmoji: '🇹🇭', landmark: 'Sukhumvit & Siam Square', reserveFloorDollars: 1.00 },
  { cityCode: 'LAX', countryCode: 'US', cityName: 'Los Angeles', countryName: 'United States', flagEmoji: '🇺🇸', landmark: 'Sunset Boulevard & Hollywood', reserveFloorDollars: 2.00 },
  { cityCode: 'YTO', countryCode: 'CA', cityName: 'Toronto', countryName: 'Canada', flagEmoji: '🇨🇦', landmark: 'Yonge-Dundas Square', reserveFloorDollars: 1.50 },
  { cityCode: 'SHA', countryCode: 'CN', cityName: 'Shanghai', countryName: 'China', flagEmoji: '🇨🇳', landmark: 'The Bund & Lujiazui', reserveFloorDollars: 2.00 }
];

export const CITY_DISPLAY_NAMES: Record<string, string> = GLOBAL_CITIES.reduce((acc, item) => {
  acc[item.cityCode] = item.cityCode === 'GLOBAL' ? 'Global Network Feed' : `${item.cityName} (${item.landmark})`;
  return acc;
}, {} as Record<string, string>);
