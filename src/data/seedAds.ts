import { QueueItem } from '../types';

export interface CitySeedSet {
  cityCode: string;
  cityName: string;
  countryCode: string;
  ads: QueueItem[];
}

export const CITY_LANDMARKS: Record<string, { landmarkName: string; description: string; svgKey: string; primaryColor: string }> = {
  KUL: {
    landmarkName: 'Petronas Twin Towers (KLCC)',
    description: 'Iconic 88-storey twin spires with Skybridge in Kuala Lumpur',
    svgKey: 'klcc',
    primaryColor: '#00f2fe'
  },
  TYO: {
    landmarkName: 'Tokyo Tower & Shibuya Scramble',
    description: 'Neon skyline with iconic red lattice spires & Shibuya Scramble',
    svgKey: 'tokyo',
    primaryColor: '#ff0055'
  },
  NYC: {
    landmarkName: 'Times Square & Statue of Liberty',
    description: 'Lady Liberty, Manhattan skyline and dazzling Broadway neon',
    svgKey: 'nyc',
    primaryColor: '#ffaa00'
  },
  LON: {
    landmarkName: 'Big Ben & Tower Bridge',
    description: 'Victorian Gothic clock tower & Thames suspension towers',
    svgKey: 'london',
    primaryColor: '#3b82f6'
  },
  PAR: {
    landmarkName: 'Eiffel Tower & Arc de Triomphe',
    description: 'Iron Lady soaring spire over Champs-Élysées avenue',
    svgKey: 'paris',
    primaryColor: '#ec4899'
  },
  SIN: {
    landmarkName: 'Marina Bay Sands & Supertree Grove',
    description: 'Futuristic rooftop SkyPark & illuminated Gardens by the Bay',
    svgKey: 'singapore',
    primaryColor: '#10b981'
  },
  DXB: {
    landmarkName: 'Burj Khalifa & Museum of the Future',
    description: "World's tallest 828m spire soaring into Arabian skies",
    svgKey: 'dubai',
    primaryColor: '#f59e0b'
  },
  SEL: {
    landmarkName: 'N Seoul Tower & Gangnam District',
    description: 'Namsan mountain beacon overlooking futuristic high-tech metropolis',
    svgKey: 'seoul',
    primaryColor: '#8b5cf6'
  },
  SYD: {
    landmarkName: 'Sydney Opera House & Harbour Bridge',
    description: 'Architectural sail shells framing world-famous harbour',
    svgKey: 'sydney',
    primaryColor: '#06b6d4'
  },
  YTO: {
    landmarkName: 'CN Tower & Toronto Waterfront',
    description: '553m communications tower over Lake Ontario skyline',
    svgKey: 'toronto',
    primaryColor: '#ef4444'
  },
  HKG: {
    landmarkName: 'Victoria Harbour & Bank of China Tower',
    description: 'Luminous skyscraper cluster & traditional Star Ferry',
    svgKey: 'hongkong',
    primaryColor: '#14b8a6'
  },
  LAX: {
    landmarkName: 'Hollywood Sign & Sunset Boulevard',
    description: 'Golden hour palm boulevard & cinematic hill monument',
    svgKey: 'la',
    primaryColor: '#f97316'
  },
  SHA: {
    landmarkName: 'Oriental Pearl Tower & The Bund',
    description: 'Futuristic sphere towers overlooking historic riverfront',
    svgKey: 'shanghai',
    primaryColor: '#e11d48'
  },
  BER: {
    landmarkName: 'Brandenburg Gate & TV Tower',
    description: 'Neoclassical victory arch & Alexanderplatz Fernsehturm',
    svgKey: 'berlin',
    primaryColor: '#6366f1'
  },
  SAO: {
    landmarkName: 'Avenida Paulista & MASP Museum',
    description: 'Modernist red suspension museum & vibrant Latin metropolis',
    svgKey: 'sao_paulo',
    primaryColor: '#84cc16'
  },
  BKK: {
    landmarkName: 'Grand Palace & Chao Phraya River',
    description: 'Golden spires, vibrant night markets and iconic riverfront displays',
    svgKey: 'bangkok',
    primaryColor: '#eab308'
  },
  AMS: {
    landmarkName: 'Rijksmuseum & Herengracht Canal',
    description: 'Historic canal rings, historic gables and vibrant digital art corridors',
    svgKey: 'amsterdam',
    primaryColor: '#f97316'
  },
  MEX: {
    landmarkName: 'Zócalo Plaza & Reforma Boulevard',
    description: 'Historic cathedral square & soaring Angel of Independence tower',
    svgKey: 'mexico_city',
    primaryColor: '#10b981'
  },
  TPE: {
    landmarkName: 'Taipei 101 & Ximending Pedestrian District',
    description: '508m bamboo tower & luminous neon shopping promenade',
    svgKey: 'taipei',
    primaryColor: '#06b6d4'
  },
  MUM: {
    landmarkName: 'Gateway of India & Marine Drive',
    description: 'Basalt arch monument & Queen’s Necklace waterfront lights',
    svgKey: 'mumbai',
    primaryColor: '#a855f7'
  },
  GLOBAL: {
    landmarkName: 'Earth Orbit & Satellite Relay Ring',
    description: '24/7 Global Satellite Broadcast Stream reaching all continents',
    svgKey: 'global',
    primaryColor: '#38bdf8'
  }
};

// Authentic local brand ads dictionary per city (10 distinct local brand ads per city)
export const LOCAL_CITY_ADS: Record<string, Array<{ title: string; advertiser: string; img: string; bid: number }>> = {
  KUL: [
    { title: 'Petronas Twin Towers Skybridge & Observation Deck Tour', advertiser: 'Petronas Heritage', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'AirAsia: Now Everyone Can Fly to 150+ Destinations', advertiser: 'AirAsia Aviation', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Maybank M2U: Next-Gen Islamic Digital Banking App', advertiser: 'Maybank Berhad', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Grab Malaysia: Superapp Food Delivery & E-Hailing', advertiser: 'Grab Malaysia', img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'OldTown White Coffee: Authentic Ipoh Roasted Blend', advertiser: 'OldTown Coffee', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Sunway Lagoon Water Park & Wildlife Resort Pass', advertiser: 'Sunway Group', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', bid: 7000 },
    { title: 'Telekom Malaysia Unifi: 2Gbps Ultra-Fast Fiber Broadband', advertiser: 'TM Unifi', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Royal Selangor Pewter: Artisanal Malaysian Craftsmanship', advertiser: 'Royal Selangor', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Village Park Nasi Lemak: Legendary Crispy Ayam Goreng', advertiser: 'Village Park Cafe', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Nelissa Hilman: Artisanal Malaysian Handcrafted Footwear', advertiser: 'Nelissa Hilman', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  TYO: [
    { title: 'Uniqlo Heattech & LifeWear Spring Collection 2026', advertiser: 'Uniqlo Japan', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', bid: 14000 },
    { title: 'Sony PlayStation 5 Pro & VR2 Next-Gen Gaming System', advertiser: 'Sony Interactive', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'Shiseido Future Solution LX Radiant Skincare Ritual', advertiser: 'Shiseido Ginza', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Toyota Crown Crossover Hybrid EV Flagship Sedan', advertiser: 'Toyota Motor Corp', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', bid: 10500 },
    { title: 'Nintendo Store Tokyo: Zelda & Mario Limited Edition Merch', advertiser: 'Nintendo Co Ltd', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Lawson Station Karaage-kun Crunchy Fried Chicken', advertiser: 'Lawson Japan', img: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'Matcha Tokyo: Ceremonial Grade Organic Uji Green Tea', advertiser: 'The Matcha Tokyo', img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80', bid: 7000 },
    { title: 'Asahi Super Dry 0.0%: Crisp Japanese Draft Experience', advertiser: 'Asahi Breweries', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'SoftBank 6G Quantum Network High-Speed Pass', advertiser: 'SoftBank Corp', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Rakuten Ichiba Global Spring Shopping Festival', advertiser: 'Rakuten Group', img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80', bid: 5500 }
  ],
  NYC: [
    { title: 'Shake Shack: Original Madison Square Park Angus Burger', advertiser: 'Shake Shack NYC', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', bid: 15000 },
    { title: "Bloomingdale's 59th Street Flagship Designer Runway", advertiser: "Bloomingdale's", img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', bid: 13500 },
    { title: 'NYC Ferry: Scenic Hudson & East River Express Pass', advertiser: 'NYC Ferry System', img: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Supreme NYC: Soho Flagship Box Logo Apparel Drop', advertiser: 'Supreme New York', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Brooklyn Brewery: Local Artisanal Craft IPA & Lager', advertiser: 'Brooklyn Brewery', img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'Citi Bike NYC: Unlimited Electric Bike Commuter Pass', advertiser: 'Citi Bike NYC', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: "Katz's Delicatessen: Legendary Overstuffed Pastrami on Rye", advertiser: "Katz's Deli NYC", img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', bid: 7000 },
    { title: 'Madison Square Garden: Live Concerts & MSG Sphere Shows', advertiser: 'MSG Entertainment', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Paper Source NYC: Bespoke Manhattan Calligraphy & Cards', advertiser: 'Paper Source', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Chelsea Market Gourmet Food Hall Tasting Tour', advertiser: 'Chelsea Market', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', bid: 5000 }
  ],
  LON: [
    { title: 'Marks & Spencer Foodhall: M&S Gourmet Luxury Hampers', advertiser: 'M&S London', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'British Airways: First Class Suite London to New York', advertiser: 'British Airways', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Twinings Tea: Royal English Breakfast Heritage Blend', advertiser: 'Twinings London', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: 'Harrods Knightsbridge: Luxury Department Store Shopping', advertiser: 'Harrods London', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'Pret A Manger: Organic Coffee & Fresh Artisan Sandwiches', advertiser: 'Pret UK', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'London Underground TfL Oyster & Contactless Express', advertiser: 'Transport for London', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Barbour UK: Classic Waxed Cotton Country Jackets', advertiser: 'Barbour Clothing', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Dyson UK: Airwrap Multi-Styler & Cordless Vacuum Tech', advertiser: 'Dyson Technology', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Fortnum & Mason: Royal Warrant Loose Leaf Tea & Biscuits', advertiser: 'Fortnum & Mason', img: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Tate Modern: Contemporary Art Exhibition & River Pass', advertiser: 'Tate Modern', img: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  PAR: [
    { title: 'Louis Vuitton: Champs-Élysées Trunk Exhibition', advertiser: 'Louis Vuitton Paris', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80', bid: 16000 },
    { title: 'Chanel N°5: Fine Fragrance & High Jewelry Runway', advertiser: 'Chanel Paris', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 14500 },
    { title: 'Ladurée Paris: Artisanal French Macarons Gift Box', advertiser: 'Ladurée Paris', img: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Air France: La Première Suite Paris to Tokyo Flight', advertiser: 'Air France', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Citroën Ami: 100% Electric Paris City Mobility Buggy', advertiser: 'Citroën France', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Le Bon Marché Rive Gauche Luxury Parisian Shopping', advertiser: 'Le Bon Marché', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Café de Flore: Legendary Saint-Germain Espresso & Croissant', advertiser: 'Café de Flore', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Perrier Sparkling Natural Mineral Water Refreshment', advertiser: 'Perrier France', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Sephora France: Exclusive Parisian Skincare & Cosmetics', advertiser: 'Sephora Paris', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Renault 5 E-Tech Electric Retro Hatchback Launch', advertiser: 'Renault Group', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', bid: 5000 }
  ],
  SIN: [
    { title: 'Singapore Airlines: First Class Suite Transpacific', advertiser: 'Singapore Airlines', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 15500 },
    { title: 'DBS Bank: POSB Digital Wealth Management App', advertiser: 'DBS Bank Singapore', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 14000 },
    { title: 'Charles & Keith: Global High-Fashion Handbag Collection', advertiser: 'Charles & Keith', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80', bid: 12500 },
    { title: 'TWG Tea: Haute Couture Fine Teas & Gold Tea Tins', advertiser: 'TWG Tea Company', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Tiger Beer: Crystal Cold Filtered Tropical Lager', advertiser: 'Asia Pacific Breweries', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Razer Singapore: Ultra-Performance Esports Gaming Laptop', advertiser: 'Razer Inc', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'BreadTalk: Pork Flosss Bun & Fresh Artisanal Bakery', advertiser: 'BreadTalk Group', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', bid: 7000 },
    { title: 'Marina Bay Sands: SkyPark Infinity Pool Evening Pass', advertiser: 'Marina Bay Sands', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Jewel Changi Airport: HSBC Rain Vortex Waterfall Light Show', advertiser: 'Jewel Changi', img: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'CapitaLand Malls: CapitaStar Cashback & Shopping Vouchers', advertiser: 'CapitaLand', img: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80', bid: 5000 }
  ],
  DXB: [
    { title: 'Emirates Airline: First Class Game Changer Private Suite', advertiser: 'Emirates Airline', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80', bid: 17000 },
    { title: 'Emaar Properties: Downtown Dubai Luxury Sky Penthouses', advertiser: 'Emaar Properties', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', bid: 15000 },
    { title: 'Careem UAE: Superapp Rides, Food Delivery & Pay Wallet', advertiser: 'Careem Middle East', img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'Al Baik Dubai: Legendary Fried Chicken Hot Meal Combo', advertiser: 'Al Baik UAE', img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Majid Al Futtaim: Mall of the Emirates Ski Dubai Pass', advertiser: 'Majid Al Futtaim', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: 'Atlantis The Royal: World-Class Ultra Luxury Beach Resort', advertiser: 'Atlantis Dubai', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'ENOC Link: Smart On-Demand Fuel Delivery to Your Door', advertiser: 'ENOC Group', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'Jumeirah Hotels: Burj Al Arab Royal Suite Helicopter Transfer', advertiser: 'Jumeirah Group', img: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80', bid: 7000 },
    { title: 'Dubai Mall: Fashion Avenue Luxury Designer Flagships', advertiser: 'The Dubai Mall', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Talabat UAE: Ultra-Fast 15-Minute Grocery & Restaurant Delivery', advertiser: 'Talabat UAE', img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80', bid: 5000 }
  ],
  SEL: [
    { title: 'Samsung Galaxy S26 Ultra: Quantum AI Camera Phone', advertiser: 'Samsung Electronics', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80', bid: 15000 },
    { title: 'Genesis G90: Luxury AWD Flagship Executive Sedan', advertiser: 'Genesis Motors Korea', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', bid: 13500 },
    { title: 'Gentle Monster: Futuristic Eyewear & Sunglasses Collection', advertiser: 'Gentle Monster Seoul', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Sulwhasoo First Care Activating Serum Ginseng Ritual', advertiser: 'Amorepacific', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 10500 },
    { title: 'CJ ENM: K-Pop World Tour Live Stream Pass', advertiser: 'CJ ENM Entertainment', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'KakaoTalk & Kakao Pay One-Touch Digital Wallet', advertiser: 'Kakao Corp', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Olive Young: Korea #1 K-Beauty & Skincare Festival', advertiser: 'Olive Young Korea', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Hyundai Ioniq 6 EV Streamliner Electric Vehicle', advertiser: 'Hyundai Motor Co', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Paris Baguette: Fresh Cream Cake & Artisanal Bakery', advertiser: 'SPC Group Korea', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Line Friends Store: Brown & Cony Plush Collectibles', advertiser: 'Line Friends Korea', img: 'https://images.unsplash.com/photo-1531525645387-7f14be1bbea7?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  SYD: [
    { title: 'Qantas Airways: Non-Stop Sunrise Express Sydney to London', advertiser: 'Qantas Airways', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 13500 },
    { title: 'Vegemite: Happy Little Vegemites Breakfast Spread', advertiser: 'Bega Cheese Ltd', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Zimmermann: High-End Australian Silk Fashion Runway', advertiser: 'Zimmermann Wear', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', bid: 10500 },
    { title: 'Bondi Sands: Australian Botanical SPF50+ Sunscreen', advertiser: 'Bondi Sands Sun', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'Aesop Skin Care: Botanical Parsley Seed Cleanser', advertiser: 'Aesop Australia', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'Atlassian: Enterprise Software & Jira Cloud Systems', advertiser: 'Atlassian Sydney', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Guzman y Gomez: Real Fresh Mexican Burritos & Tacos', advertiser: 'Guzman y Gomez', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'R.M. Williams: Handcrafted Leather Craftsman Boots', advertiser: 'R.M. Williams', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Boost Juice Bars: All-Natural Tropical Mango Smoothie', advertiser: 'Boost Juice Australia', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Black Star Pastry: Famous Strawberry Watermelon Cake', advertiser: 'Black Star Bakery', img: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  YTO: [
    { title: 'Tim Hortons: Double-Double Coffee & Fresh Timbits Box', advertiser: 'Tim Hortons Canada', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'Canada Goose: Arctic Program Expedition Down Parka', advertiser: 'Canada Goose', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Roots Canada: Salt & Pepper Beaver Heritage Hoodie', advertiser: 'Roots Canada', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80', bid: 10500 },
    { title: 'Lululemon: Align High-Rise Pant & Athletic Wear', advertiser: 'Lululemon Athletica', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Shoppers Drug Mart: PC Optimum Digital Loyalty Points', advertiser: 'Loblaw Companies', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Bell Canada: 5G Gigabit Wireless Ultra Network', advertiser: 'Bell Mobility', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Scotiabank Arena: Toronto Maple Leafs Live Game Pass', advertiser: 'Scotiabank', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: "Drake OVO Store: October's Very Own Streetwear Drop", advertiser: 'OVO Clothing', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Cineplex VIP Cinemas: IMAX Luxury Dining & Movies', advertiser: 'Cineplex Entertainment', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Steam Whistle Pilsner: Craft Brewed in Toronto', advertiser: 'Steam Whistle Brewing', img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  HKG: [
    { title: 'Cathay Pacific: Aria Suite Business Class Flights', advertiser: 'Cathay Pacific', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 14500 },
    { title: 'HSBC HK: Premier Global Wealth Management & Banking', advertiser: 'HSBC Hong Kong', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'Shangri-La Hotels: Island Shangri-La Fine Dining', advertiser: 'Shangri-La Group', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Pacific Coffee: Signature HK Roasted Espresso Blend', advertiser: 'Pacific Coffee HK', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: "Maxim's MX: Authentic HK Style Milk Tea & Dim Sum", advertiser: "Maxim's Caterers", img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Lane Crawford: High-End Fashion & Designer Cosmetics', advertiser: 'Lane Crawford', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'G2000 Apparel: Smart Professional Business Wear', advertiser: 'G2000 HK', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Vitasoy: Classic HK Soya Bean Drink Refreshment', advertiser: 'Vitasoy International', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Kee Wah Bakery: Traditional Lotus Seed Mooncakes', advertiser: 'Kee Wah Bakery', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Harbour City Tsim Sha Tsui Ocean Terminal Mall', advertiser: 'Wharf REIC', img: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  LAX: [
    { title: 'In-N-Out Burger: Double-Double Animal Style Burger', advertiser: 'In-N-Out Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', bid: 14000 },
    { title: 'Universal Studios Hollywood: Super Nintendo World Pass', advertiser: 'Universal Studios LA', img: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'Erewhon Market: Organic Cold-Pressed Smoothie Bar', advertiser: 'Erewhon Organic', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Alo Yoga: Beverly Hills Wellness & Athleisure Apparel', advertiser: 'Alo Yoga', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: 'Taco Bell LA: Original Doritos Locos Tacos & Burritos', advertiser: 'Taco Bell Corp', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Venice Skateboards: California Custom Longboards', advertiser: 'Venice Skate Co', img: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Santa Monica Pier Pacific Park Rides & Rollercoaster', advertiser: 'Pacific Park LA', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Rodeo Drive Luxury Boutique Shopping Concierge', advertiser: 'Rodeo Drive Association', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Kith LA: Sunset Boulevard Sneaker & Apparel Drop', advertiser: 'Kith Los Angeles', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Portis Coffee: Venice Beach Artisanal Roasters', advertiser: 'Portis Coffee LA', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  SHA: [
    { title: 'NIO Electric: ET7 Executive Flagship Sedan', advertiser: 'NIO China', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', bid: 15000 },
    { title: 'Luckin Coffee: Velvet Latte & Coconut Cold Brew', advertiser: 'Luckin Coffee', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'White Rabbit Candy: Nostalgic Creamy Milk Candy', advertiser: 'Guanshengyuan Group', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Shanghai Tang: Modern Chinese Luxury Silk Fashion', advertiser: 'Shanghai Tang', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Miniso Global: Blind Box Toys & Pop Culture Collectibles', advertiser: 'Miniso Group', img: 'https://images.unsplash.com/photo-1531525645387-7f14be1bbea7?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Peace Hotel Shanghai: Old Jazz Bar & Afternoon High Tea', advertiser: 'Fairmont Peace Hotel', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Chow Tai Fook: 999.9 Fine Gold Heritage Jewelry', advertiser: 'Chow Tai Fook', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Douyin Live: Interactive E-Commerce Shopping Carnival', advertiser: 'ByteDance Douyin', img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Xpeng Motors: G9 Smart Ultra-Fast Charging SUV', advertiser: 'Xpeng Motors', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Bright Dairy: Fresh Milk & Cream Shanghai Heritage', advertiser: 'Bright Food Group', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  BER: [
    { title: 'Lufthansa Airlines: Allegris First Class Suite Flights', advertiser: 'Lufthansa Group', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 13500 },
    { title: 'BMW Berlin: i4 Electric Gran Coupé Performance', advertiser: 'BMW Deutschland', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Ritter Sport Chocolate: Colourful Chocolate World', advertiser: 'Ritter Sport', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1200&q=80', bid: 10500 },
    { title: 'Zalando: Europe #1 Online Fashion & Footwear Store', advertiser: 'Zalando SE', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'Club Mate: Original Berliner Yerba Mate Energy Soda', advertiser: 'Brauerei Loscher', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'KaDeWe Berlin: Luxury Department Store Food Hall', advertiser: 'KaDeWe Group', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 7000 },
    { title: 'Curry 36: Famous Original Berlin Currywurst & Fries', advertiser: 'Curry 36 Berlin', img: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'SoundCloud Berlin: Independent Music & Audio Creator Pass', advertiser: 'SoundCloud Berlin', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'N26 Bank: Modern European Mobile Banking Zero Fees', advertiser: 'N26 Bank SE', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: 'Porsche Berlin: Taycan Turbo S All-Electric Sports Car', advertiser: 'Porsche Center Berlin', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  SAO: [
    { title: 'Havaianas: Iconic Brazilian Flip Flops Summer Collection', advertiser: 'Alpargatas S.A.', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80', bid: 12500 },
    { title: 'Itaú Unibanco: Personnalité Digital Wealth Management', advertiser: 'Itaú Unibanco', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Natura Cosméticos: Amazonian Bio-Active Skincare', advertiser: 'Natura Brasil', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: 'Skol Beer: Cerveja Gelada Pilsen Refrescante', advertiser: 'Ambev Brasil', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Cacau Show: Artisanal Gourmet Truffles & Chocolates', advertiser: 'Cacau Show', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1200&q=80', bid: 7500 },
    { title: 'Guaraná Antarctica: Original Brazilian Refreshing Soda', advertiser: 'Ambev Group', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', bid: 6500 },
    { title: 'Nubank: Purple Credit Card Zero Annuity Mobile App', advertiser: 'Nubank Brasil', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', bid: 6000 },
    { title: 'Vivara Joias: Brazilian Fine Gold & Diamond Jewelry', advertiser: 'Vivara Brasil', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80', bid: 5500 },
    { title: 'Hering: Classic 100% Brazilian Cotton Basics Apparel', advertiser: 'Cia. Hering', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', bid: 5000 },
    { title: "Outback Brasil: Legendary Bloomin' Onion & Prime Rib", advertiser: 'Outback Brasil', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', bid: 4500 }
  ],
  BKK: [
    { title: 'Singha Beer: Original Thai Royal Brewery Lager', advertiser: 'Boon Rawd Brewery', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'CentralWorld Bangkok: Global Fashion Shopping Festival', advertiser: 'Central Group', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: 'Jim Thompson Silk: Thai Artisanal Heritage Fashion', advertiser: 'Jim Thompson', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'Thai Airways: Royal Silk Class Bangkok to Europe', advertiser: 'Thai Airways', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'After You Dessert Cafe: Shibuya Honey Toast & Kakigori', advertiser: 'After You Cafe', img: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80', bid: 7500 }
  ],
  AMS: [
    { title: 'Heineken Experience: Historic Amsterdam Brewery Tour', advertiser: 'Heineken N.V.', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'KLM Royal Dutch Airlines: World Business Class Flights', advertiser: 'KLM Royal Dutch', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'G-Star RAW: Sustainable Dutch Denim & Streetwear', advertiser: 'G-Star RAW', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Rijksmuseum Amsterdam: Vermer & Rembrandt Masterpieces', advertiser: 'Rijksmuseum', img: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'Rituals Cosmetics: Sakura Cherry Blossom Home Bath Rituals', advertiser: 'Rituals Cosmetics', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', bid: 7000 }
  ],
  MEX: [
    { title: 'Corona Extra: La Cerveza Más Fina Refrescante', advertiser: 'Grupo Modelo', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Aeroméxico: Premier Class Mexico City to Madrid', advertiser: 'Aeroméxico', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 10500 },
    { title: 'El Palacio de Hierro: Luxury Department Store Shopping', advertiser: 'El Palacio de Hierro', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', bid: 9000 },
    { title: 'Bimbo Bread: Authentic Soft Bakery & Pastries', advertiser: 'Grupo Bimbo', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', bid: 8000 },
    { title: 'Claro Pay: Modern Mexican Digital Payment App', advertiser: 'América Móvil', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', bid: 7000 }
  ],
  TPE: [
    { title: 'ASUS ROG Strix: Ultra Gaming Laptops & OLED Displays', advertiser: 'ASUS Taiwan', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80', bid: 13000 },
    { title: 'EVA Air: Royal Laurel Class Transpacific Flights', advertiser: 'EVA Airways', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', bid: 11500 },
    { title: 'Din Tai Fung: Original World Famous Xiao Long Bao', advertiser: 'Din Tai Fung', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', bid: 10000 },
    { title: 'Giant Bicycles: Advanced Carbon Fiber Road Bikes', advertiser: 'Giant Bicycles', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'Tiger Sugar: Original Brown Sugar Boba Milk Tea', advertiser: 'Tiger Sugar TPE', img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80', bid: 7500 }
  ],
  MUM: [
    { title: 'Tata Motors: Nexon EV Electric SUV Innovation', advertiser: 'Tata Motors', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', bid: 12000 },
    { title: 'Reliance Jio: 5G True Unlimited High-Speed Network', advertiser: 'Reliance Jio', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Taj Hotels: The Taj Mahal Palace Waterfront Heritage', advertiser: 'Indian Hotels Co', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Titan Watches: Nebula Fine Gold Artisan Timepieces', advertiser: 'Titan Company', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: 'FabIndia: Handcrafted Cotton Ethnic Wear & Home Decor', advertiser: 'FabIndia', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', bid: 7500 }
  ],
  GLOBAL: [
    { title: 'World First 24/7 Virtual Billboard Space Global Feed', advertiser: 'Global Billboard Network', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', bid: 20000 },
    { title: 'SpaceX Starlink: Global High-Speed Satellite Internet', advertiser: 'SpaceX Starlink', img: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80', bid: 18000 },
    { title: 'Tesla Cybertruck: Ultra-Hard Stainless Steel Exoskeleton EV', advertiser: 'Tesla Motors', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', bid: 16500 },
    { title: 'Apple Vision Pro: Spatial Computing AR/VR Glasses', advertiser: 'Apple Inc', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80', bid: 15000 },
    { title: 'Rolex Oyster Perpetual Daytona Cosmograph Chronograph', advertiser: 'Rolex Geneva', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80', bid: 14000 },
    { title: 'Nike Air Jordan 1 Retro High OG Global Release', advertiser: 'Nike Sportswear', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80', bid: 12500 },
    { title: 'Coca-Cola: Real Magic Original Taste Ice Cold', advertiser: 'The Coca-Cola Co', img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=1200&q=80', bid: 11000 },
    { title: 'Red Bull Energy Drink: Gives You Wings World Pass', advertiser: 'Red Bull GmbH', img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=1200&q=80', bid: 9500 },
    { title: 'Google Pixel 10 Pro: Quantum AI Mobile Assistant', advertiser: 'Google LLC', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80', bid: 8500 },
    { title: "McDonald's Big Mac 24/7 Global Express Delivery", advertiser: "McDonald's Corp", img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', bid: 7500 }
  ]
};

export function generate10AdsForCity(cityCode: string, countryCode: string, cityName: string): QueueItem[] {
  const code = cityCode.toUpperCase();
  const rawList = LOCAL_CITY_ADS[code] || [];
  const globalList = LOCAL_CITY_ADS['GLOBAL'];

  // Combine city-specific ads with global ads to reach exactly 10 house ads per city
  const combinedList = [...rawList];
  let gIndex = 0;
  while (combinedList.length < 10 && gIndex < globalList.length) {
    combinedList.push(globalList[gIndex]);
    gIndex++;
  }
  if (combinedList.length > 10) {
    combinedList.length = 10;
  }

  const ads: QueueItem[] = combinedList.map((item, index) => {
    const slug = item.advertiser.toLowerCase().replace(/[^a-z0-9]/g, '');
    const landingUrl = `https://${slug || 'brand'}.com`;
    const waLink = `https://wa.me/1555${(1000000 + (index * 123456) % 8999999)}?text=Hi%20${encodeURIComponent(item.advertiser)}%2C%20I%20saw%20your%20billboard%20ad`;
    const isWebsiteCta = index % 2 === 0;

    return {
      id: `house_ad_${code.toLowerCase()}_${index}`,
      advertiserId: `house_network_${code.toLowerCase()}_${index}`,
      userId: 'house_ad',
      isHouseAd: true,
      advertiserName: item.advertiser,
      title: item.title,
      imageUrl: item.img,
      mediaType: 'image',
      ctaType: isWebsiteCta ? 'website' : 'whatsapp',
      ctaUrl: isWebsiteCta ? landingUrl : waLink,
      landingPageUrl: isWebsiteCta ? landingUrl : undefined,
      whatsappLink: isWebsiteCta ? undefined : waLink,
      targetCountryCode: countryCode,
      targetCityCode: cityCode,
      bidAmountCents: 100, // $1.00 base floor for house ad fallbacks
      safetyScore: 98 + (index % 3),
      createdAt: new Date(Date.now() - (10 - index) * 60000).toISOString()
    };
  });

  return ads;
}

export function generate20AdsForCity(cityCode: string, countryCode: string, cityName: string): QueueItem[] {
  return generate10AdsForCity(cityCode, countryCode, cityName);
}
