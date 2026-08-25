export const CITY_TIMEZONES: Record<string, { tz: string; abbr: string; name: string }> = {
  TYO: { tz: 'Asia/Tokyo', abbr: 'JST', name: 'Tokyo' },
  NYC: { tz: 'America/New_York', abbr: 'EDT', name: 'New York' },
  LON: { tz: 'Europe/London', abbr: 'BST', name: 'London' },
  PAR: { tz: 'Europe/Paris', abbr: 'CEST', name: 'Paris' },
  KUL: { tz: 'Asia/Kuala_Lumpur', abbr: 'MYT', name: 'Kuala Lumpur' },
  SIN: { tz: 'Asia/Singapore', abbr: 'SGT', name: 'Singapore' },
  DXB: { tz: 'Asia/Dubai', abbr: 'GST', name: 'Dubai' },
  SEL: { tz: 'Asia/Seoul', abbr: 'KST', name: 'Seoul' },
  SYD: { tz: 'Australia/Sydney', abbr: 'AEST', name: 'Sydney' },
  YTO: { tz: 'America/Toronto', abbr: 'EDT', name: 'Toronto' },
  HKG: { tz: 'Asia/Hong_Kong', abbr: 'HKT', name: 'Hong Kong' },
  LAX: { tz: 'America/Los_Angeles', abbr: 'PDT', name: 'Los Angeles' },
  SHA: { tz: 'Asia/Shanghai', abbr: 'CST', name: 'Shanghai' },
  BER: { tz: 'Europe/Berlin', abbr: 'CEST', name: 'Berlin' },
  SAO: { tz: 'America/Sao_Paulo', abbr: 'BRT', name: 'São Paulo' },
  BKK: { tz: 'Asia/Bangkok', abbr: 'ICT', name: 'Bangkok' },
  AMS: { tz: 'Europe/Amsterdam', abbr: 'CEST', name: 'Amsterdam' },
  MEX: { tz: 'America/Mexico_City', abbr: 'CST', name: 'Mexico City' },
  TPE: { tz: 'Asia/Taipei', abbr: 'CST', name: 'Taipei' },
  MUM: { tz: 'Asia/Kolkata', abbr: 'IST', name: 'Mumbai' },
  LOS: { tz: 'Africa/Lagos', abbr: 'WAT', name: 'Lagos' },
  JNB: { tz: 'Africa/Johannesburg', abbr: 'SAST', name: 'Johannesburg' },
  BUE: { tz: 'America/Argentina/Buenos_Aires', abbr: 'ART', name: 'Buenos Aires' },
  ISS: { tz: 'UTC', abbr: 'UTC-ORBIT', name: 'ISS Space Station' },
  MARS: { tz: 'UTC', abbr: 'MTC-ALPHA', name: 'Mars Colony Alpha' },
  GLOBAL: { tz: 'UTC', abbr: 'UTC', name: 'Global Earth Feed' }
};

export function getCityLocalTime(cityCode: string): string {
  const code = (cityCode || 'GLOBAL').toUpperCase();
  const info = CITY_TIMEZONES[code] || CITY_TIMEZONES.GLOBAL;
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      timeZone: info.tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return `${timeStr} ${info.abbr}`;
  } catch {
    return new Date().toLocaleTimeString();
  }
}
