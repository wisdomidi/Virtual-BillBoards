import { QueueItem } from '../types';

export interface CityCampaignSeedResult {
  cityCode: string;
  count: number;
  campaigns: Partial<QueueItem>[];
}

const INDUSTRIES = [
  'Tech & SaaS',
  'Luxury Fashion',
  'EV & Automotive',
  'Fine Dining',
  'FinTech & Banking',
  'Air Travel & Hospitality',
  'Luxury Real Estate',
  'Gaming & Esports',
  'Clean Energy',
  'Arts & Culture'
];

export const CITY_SEED_PRESETS: Record<string, { cityName: string; country: string; campaigns: Partial<QueueItem>[] }> = {
  KUL: {
    cityName: 'Kuala Lumpur',
    country: 'Malaysia',
    campaigns: [
      {
        id: 'kul_tech_01',
        title: 'Petronas Cloud AI Platform',
        advertiserName: 'Petronas Digital',
        bidAmountCents: 2500,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        industry: 'Tech & SaaS'
      },
      {
        id: 'kul_fashion_02',
        title: 'Royal Selangor Pewter Artisans',
        advertiserName: 'Royal Selangor',
        bidAmountCents: 2100,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
        industry: 'Luxury Fashion'
      },
      {
        id: 'kul_auto_03',
        title: 'Proton e.MAS 7 Electric SUV',
        advertiserName: 'Proton EV',
        bidAmountCents: 2800,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        industry: 'EV & Automotive'
      },
      {
        id: 'kul_dining_04',
        title: 'Bijan Fine Malay Cuisine Bukit Bintang',
        advertiserName: 'Bijan Dining',
        bidAmountCents: 1900,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        industry: 'Fine Dining'
      },
      {
        id: 'kul_fintech_05',
        title: 'Touch n Go eWallet Global QR',
        advertiserName: 'Touch n Go Digital',
        bidAmountCents: 3200,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        industry: 'FinTech & Banking'
      },
      {
        id: 'kul_travel_06',
        title: 'Malaysia Airlines A330neo Business Class',
        advertiserName: 'Malaysia Airlines',
        bidAmountCents: 3500,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
        industry: 'Air Travel & Hospitality'
      },
      {
        id: 'kul_realestate_07',
        title: 'Merdeka 118 Penthouse Residences',
        advertiserName: 'PNB Merdeka Ventures',
        bidAmountCents: 4500,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        industry: 'Luxury Real Estate'
      },
      {
        id: 'kul_gaming_08',
        title: 'KL Esports Arena Masters 2026',
        advertiserName: 'MDEC Games',
        bidAmountCents: 2200,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        industry: 'Gaming & Esports'
      },
      {
        id: 'kul_energy_09',
        title: 'Sime Darby Solar Rooftops',
        advertiserName: 'Sime Darby Renewables',
        bidAmountCents: 2600,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
        industry: 'Clean Energy'
      },
      {
        id: 'kul_arts_10',
        title: 'Istana Budaya Traditional Orchestra',
        advertiserName: 'Ministry of Tourism MY',
        bidAmountCents: 1800,
        targetCityCode: 'KUL',
        targetCountryCode: 'MY',
        imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
        industry: 'Arts & Culture'
      }
    ]
  },
  TYO: {
    cityName: 'Tokyo',
    country: 'Japan',
    campaigns: [
      {
        id: 'tyo_tech_01',
        title: 'Sony Quantum Vision Display Systems',
        advertiserName: 'Sony Corporation',
        bidAmountCents: 3800,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        industry: 'Tech & SaaS'
      },
      {
        id: 'tyo_fashion_02',
        title: 'Comme des Garçons Autumn Ginza',
        advertiserName: 'Comme des Garçons',
        bidAmountCents: 3400,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        industry: 'Luxury Fashion'
      },
      {
        id: 'tyo_auto_03',
        title: 'Toyota bZ4X All-Wheel Electric Drive',
        advertiserName: 'Toyota Motor Corp',
        bidAmountCents: 4200,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
        industry: 'EV & Automotive'
      },
      {
        id: 'tyo_dining_04',
        title: 'Sukiyabashi Jiro Omakase Dining',
        advertiserName: 'Jiro Sushi Ginza',
        bidAmountCents: 2900,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
        industry: 'Fine Dining'
      },
      {
        id: 'tyo_fintech_05',
        title: 'PayPay Contactless Micro-Payments',
        advertiserName: 'PayPay Corp',
        bidAmountCents: 3600,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
        industry: 'FinTech & Banking'
      },
      {
        id: 'tyo_travel_06',
        title: 'ANA All Nippon Airways Suite Class',
        advertiserName: 'ANA Group',
        bidAmountCents: 4100,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
        industry: 'Air Travel & Hospitality'
      },
      {
        id: 'tyo_realestate_07',
        title: 'Mori Building Azabudai Hills Sky Villa',
        advertiserName: 'Mori Building Co.',
        bidAmountCents: 5200,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        industry: 'Luxury Real Estate'
      },
      {
        id: 'tyo_gaming_08',
        title: 'Bandai Namco Cyber Stadium Esports',
        advertiserName: 'Bandai Namco Entertainment',
        bidAmountCents: 3100,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        industry: 'Gaming & Esports'
      },
      {
        id: 'tyo_energy_09',
        title: 'Panasonic Hydrogen Energy Cell',
        advertiserName: 'Panasonic Green Energy',
        bidAmountCents: 2700,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
        industry: 'Clean Energy'
      },
      {
        id: 'tyo_arts_10',
        title: 'Kabuki-za Theatre Autumn Performance',
        advertiserName: 'Shochiku Kabuki',
        bidAmountCents: 2300,
        targetCityCode: 'TYO',
        targetCountryCode: 'JP',
        imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        industry: 'Arts & Culture'
      }
    ]
  },
  NYC: {
    cityName: 'New York',
    country: 'United States',
    campaigns: [
      {
        id: 'nyc_tech_01',
        title: 'Datadog Real-time Infrastructure Monitoring',
        advertiserName: 'Datadog Inc',
        bidAmountCents: 4500,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        industry: 'Tech & SaaS'
      },
      {
        id: 'nyc_fashion_02',
        title: 'Tiffany & Co. Landmark 5th Ave Collection',
        advertiserName: 'Tiffany & Co.',
        bidAmountCents: 5000,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        industry: 'Luxury Fashion'
      },
      {
        id: 'nyc_auto_03',
        title: 'Lucid Air Sapphire Hyper EV',
        advertiserName: 'Lucid Motors',
        bidAmountCents: 4800,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        industry: 'EV & Automotive'
      },
      {
        id: 'nyc_dining_04',
        title: 'Eleven Madison Park Plant-Based Experience',
        advertiserName: 'Eleven Madison Group',
        bidAmountCents: 3800,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        industry: 'Fine Dining'
      },
      {
        id: 'nyc_fintech_05',
        title: 'JPMorgan Chase Onyx Blockchain Network',
        advertiserName: 'JPMorgan Chase',
        bidAmountCents: 5500,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        industry: 'FinTech & Banking'
      },
      {
        id: 'nyc_travel_06',
        title: 'Delta Air Lines Flagship D1 Suite JFK',
        advertiserName: 'Delta Air Lines',
        bidAmountCents: 4200,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
        industry: 'Air Travel & Hospitality'
      },
      {
        id: 'nyc_realestate_07',
        title: 'Central Park Tower 100th Floor Penthouse',
        advertiserName: 'Extell Development',
        bidAmountCents: 6000,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        industry: 'Luxury Real Estate'
      },
      {
        id: 'nyc_gaming_08',
        title: 'Take-Two Interactive Next-Gen Gaming',
        advertiserName: 'Take-Two Interactive',
        bidAmountCents: 3600,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
        industry: 'Gaming & Esports'
      },
      {
        id: 'nyc_energy_09',
        title: 'ConEd Clean Grid 2030 Initiative',
        advertiserName: 'Con Edison Clean Energy',
        bidAmountCents: 2900,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
        industry: 'Clean Energy'
      },
      {
        id: 'nyc_arts_10',
        title: 'Metropolitan Opera Gala Night',
        advertiserName: 'Met Opera Lincoln Center',
        bidAmountCents: 3100,
        targetCityCode: 'NYC',
        targetCountryCode: 'US',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        industry: 'Arts & Culture'
      }
    ]
  }
};

export function generate10CampaignsForCity(cityCode: string, cityName: string, country: string): Partial<QueueItem>[] {
  const code = cityCode.toUpperCase();
  if (CITY_SEED_PRESETS[code]) {
    return CITY_SEED_PRESETS[code].campaigns;
  }

  return INDUSTRIES.map((ind, idx) => {
    const baseBid = 1500 + (idx * 250);
    return {
      id: `${code.toLowerCase()}_${ind.toLowerCase().replace(/[^a-z0-9]/g, '')}_${idx + 1}`,
      title: `${cityName} ${ind} Showcase`,
      advertiserName: `${cityName} ${ind} Group`,
      bidAmountCents: baseBid,
      targetCityCode: code,
      targetCountryCode: country.substring(0, 2).toUpperCase(),
      imageUrl: `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80`,
      industry: ind
    };
  });
}
