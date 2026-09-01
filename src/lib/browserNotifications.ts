/**
 * Web Browser Push & Desktop Notification System
 * Alerts advertisers when their ad is going live, or when they get outbid in the RTB auction.
 */

export class BrowserNotificationEngine {
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this browser.');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.permission = perm;
      return perm === 'granted';
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  }

  public get isGranted(): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  public notify(title: string, options?: NotificationOptions): boolean {
    if (!this.isGranted) return false;

    try {
      const notif = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: false,
        ...options
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return true;
    } catch (e) {
      console.warn('Failed to dispatch notification:', e);
      return false;
    }
  }

  public notifyLiveBroadcast(adTitle: string, city: string): void {
    this.notify(`🎬 YOUR AD IS LIVE IN ${city.toUpperCase()}!`, {
      body: `"${adTitle}" is now broadcasting on the 24/7 Virtual Billboard! Tap to watch live.`,
      tag: 'live-broadcast'
    });
  }

  public notifyOutbid(adTitle: string, city: string, outbidAmountDollars: string): void {
    this.notify(`⚠️ OUTBID ALERT: ${city.toUpperCase()} SLOT`, {
      body: `Someone outbid your ad "${adTitle}" with $${outbidAmountDollars}. Tap to reclaim #1 billboard rank!`,
      tag: 'outbid-alert'
    });
  }
}

export const browserNotifications = new BrowserNotificationEngine();
