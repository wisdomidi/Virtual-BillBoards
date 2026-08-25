/**
 * Virtual BillBoard - Google Analytics & Custom Telemetry Helper
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Google Analytics Measurement ID from environment or standard container
export const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || 'G-VIRTUALBILLBOARD';

/**
 * Initialize Google Analytics (gtag.js)
 */
export function initGA() {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    anonymize_ip: true
  });
}

/**
 * Track custom page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title
    });
  }
}

/**
 * Track Bid Placement
 */
export function trackBidPlaced(data: {
  adTitle: string;
  bidAmountDollars: number;
  cityCode?: string;
  creatorHandle?: string;
  advertiserName: string;
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'bid_placed', {
      event_category: 'Auction',
      event_label: data.creatorHandle ? `@${data.creatorHandle}` : data.cityCode || 'GLOBAL',
      value: data.bidAmountDollars,
      currency: 'USD',
      ad_title: data.adTitle,
      advertiser: data.advertiserName
    });
  }
}

/**
 * Track Wallet Top-Up
 */
export function trackWalletFunded(amountDollars: number, method: 'card' | 'tokens' | 'crypto') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      event_category: 'Monetization',
      value: amountDollars,
      currency: 'USD',
      payment_type: method
    });
  }
}

/**
 * Track Handle Claim
 */
export function trackHandleClaimed(handle: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'handle_claimed', {
      event_category: 'Creator',
      event_label: `@${handle}`
    });
  }
}

/**
 * Track City Switch
 */
export function trackCitySwitched(cityCode: string, cityName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'city_switched', {
      event_category: 'Engagement',
      event_label: `${cityName} [${cityCode}]`
    });
  }
}
