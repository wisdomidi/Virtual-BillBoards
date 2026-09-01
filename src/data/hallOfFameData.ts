export interface HallOfFameItem {
  id: string;
  title: string;
  advertiserName: string;
  category: 'startup' | 'crypto' | 'meme' | 'brand' | 'charity';
  imageUrl: string;
  mediaType: 'image' | 'video';
  cityCode: string;
  cityName: string;
  countryCode: string;
  winningBidDollars: number;
  impressionsDelivered: number;
  qrScans: number;
  broadcastDate: string;
  badge: string;
  story: string;
  ctaUrl: string;
  likesCount: number;
}

export const HALL_OF_FAME_ITEMS: HallOfFameItem[] = [
  {
    id: 'hof_01',
    title: '🚀 Supabase Launch Week Takeover',
    advertiserName: 'DevTool Pioneers',
    category: 'startup',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    cityCode: 'NYC',
    cityName: 'New York (Times Square)',
    countryCode: 'US',
    winningBidDollars: 145.00,
    impressionsDelivered: 42800,
    qrScans: 1240,
    broadcastDate: 'August 2026',
    badge: '👑 #1 Startup Launch of the Month',
    story: 'Broadcasted live during Product Hunt #1 launch week, driving over 1,200 direct developer signups in 15 seconds.',
    ctaUrl: 'https://supabase.com',
    likesCount: 542
  },
  {
    id: 'hof_02',
    title: '🐕 $BONK Community Global Billboard Raid',
    advertiserName: 'Solana Meme Cabal',
    category: 'meme',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    cityCode: 'TYO',
    cityName: 'Tokyo (Shibuya Crossing)',
    countryCode: 'JP',
    winningBidDollars: 210.00,
    impressionsDelivered: 68400,
    qrScans: 2890,
    broadcastDate: 'August 2026',
    badge: '🔥 Most Viral Meme Raid',
    story: 'Over 4,000 live Twitch and stream viewers coordinated an RTB slot raid on the Shibuya 3D screen, trending #3 on X.',
    ctaUrl: 'https://solana.com',
    likesCount: 918
  },
  {
    id: 'hof_03',
    title: '⚡ Phantom Wallet DeFi Micro-Rail Demo',
    advertiserName: 'Web3 Velocity Labs',
    category: 'crypto',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    cityCode: 'LON',
    cityName: 'London (Piccadilly Lights)',
    countryCode: 'UK',
    winningBidDollars: 88.50,
    impressionsDelivered: 31200,
    qrScans: 870,
    broadcastDate: 'July 2026',
    badge: '⚡ Instant Settlement Milestone',
    story: 'The first advertisement funded entirely via sub-second Solana micro-rail programmatic API without credit card intermediaries.',
    ctaUrl: 'https://phantom.app',
    likesCount: 384
  },
  {
    id: 'hof_04',
    title: '🌱 Plant 100,000 Mangrove Trees Campaign',
    advertiserName: 'Earth Guardian Alliance',
    category: 'charity',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    cityCode: 'KUL',
    cityName: 'Kuala Lumpur (Bukit Bintang)',
    countryCode: 'MY',
    winningBidDollars: 50.00,
    impressionsDelivered: 24500,
    qrScans: 640,
    broadcastDate: 'June 2026',
    badge: '💚 Top Community Impact',
    story: 'Crowdfunded by 80 indie developers to sponsor ecological mangrove reforestation in Southeast Asia.',
    ctaUrl: 'https://teamtrees.org',
    likesCount: 671
  },
  {
    id: 'hof_05',
    title: '🧠 DeepSeek-V3 Autonomous AI Agent Launch',
    advertiserName: 'OpenAGI Collective',
    category: 'startup',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    cityCode: 'NYC',
    cityName: 'New York (Times Square)',
    countryCode: 'US',
    winningBidDollars: 175.00,
    impressionsDelivered: 54000,
    qrScans: 1950,
    broadcastDate: 'August 2026',
    badge: '🤖 First AI-Agent Programmatic Bid',
    story: 'An autonomous Python agent inspected the WebMCP API, determined auction depth, funded its wallet, and broadcasted independently.',
    ctaUrl: 'https://deepseek.com',
    likesCount: 820
  }
];
