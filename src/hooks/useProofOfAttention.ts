import { useState, useEffect, useRef, useCallback } from 'react';
import { CaptchaChallenge, PayoutLedgerEntry } from '../types';

interface ProofOfAttentionOptions {
  viewerId?: string;
  heartbeatIntervalSeconds?: number;
  onPointsEarned?: (points: number) => void;
  onLedgerEntryAdded?: (entry: PayoutLedgerEntry) => void;
  enabled?: boolean;
}

// Client-side Web Crypto helper to compute HMAC-SHA256 signature
async function computeHmacSignature(payloadStr: string, secret: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payloadStr);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple hash generator if subtle crypto is limited
    let hash = 0;
    const combined = payloadStr + secret;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hb_sha256_${Math.abs(hash).toString(16)}`;
  }
}

export function useProofOfAttention({
  viewerId = 'usr_viewer_01',
  heartbeatIntervalSeconds = 60,
  onPointsEarned,
  onLedgerEntryAdded,
  enabled = true
}: ProofOfAttentionOptions = {}) {
  // Page Visibility & User Focus Tracking States
  const [isTabVisible, setIsTabVisible] = useState<boolean>(!document.hidden);
  const [isTabFocused, setIsTabFocused] = useState<boolean>(document.hasFocus());
  const [activeWatchSeconds, setActiveWatchSeconds] = useState<number>(0);
  const [totalVerifiedSeconds, setTotalVerifiedSeconds] = useState<number>(0);

  // User Reward & Fraud States
  const [viewerPoints, setViewerPoints] = useState<number>(120);
  const [riskScore, setRiskScore] = useState<number>(0); // 0% = low risk, 100% = bot flagged
  const [userStatus, setUserStatus] = useState<string>('verified_human');
  const [lastHeartbeatStatus, setLastHeartbeatStatus] = useState<string>('idle');

  // Captcha Drop Challenge State
  const [activeCaptcha, setActiveCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaCountdown, setCaptchaCountdown] = useState<number>(15);
  const [captchaSubmitting, setCaptchaSubmitting] = useState<boolean>(false);
  const [captchaResultMsg, setCaptchaResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const captchaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeWatchSecondsRef = useRef<number>(0);

  activeWatchSecondsRef.current = activeWatchSeconds;

  // 1. Page Visibility & Focus Event Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
      if (!visible) {
        setLastHeartbeatStatus('tab_hidden_paused');
      }
    };

    const handleFocus = () => setIsTabFocused(true);
    const handleBlur = () => setIsTabFocused(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 2. Continuous Watch Time Counter Ticker
  useEffect(() => {
    watchTimerRef.current = setInterval(() => {
      // Only increment watch time if tab is visible and focused
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        setActiveWatchSeconds((prev) => prev + 1);
        setTotalVerifiedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, []);

  // 3. Send Heartbeat Request to Backend
  const sendHeartbeat = useCallback(async () => {
    if (!enabled || activeCaptcha) return; // Pause or disable heartbeat during active captcha challenge or if disabled for guests

    const currentWatchSecs = activeWatchSecondsRef.current || 15;
    const timestamp = Date.now();
    const nonce = `nonce_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    const isVisible = document.visibilityState === 'visible';
    const isFocused = document.hasFocus();

    const payloadData = {
      viewerId,
      timestamp,
      nonce,
      watchSeconds: currentWatchSecs,
      tabVisible: isVisible,
      focusState: isFocused
    };

    const payloadStr = JSON.stringify(payloadData);
    const clientSecret = import.meta.env.VITE_HEARTBEAT_HMAC_SECRET || 'hb_client_rtb_2026';
    const hmacSignature = await computeHmacSignature(payloadStr, clientSecret);

    setLastHeartbeatStatus('transmitting_heartbeat');

    try {
      const res = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Heartbeat-Signature': hmacSignature
        },
        body: JSON.stringify({
          ...payloadData,
          signature: hmacSignature
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLastHeartbeatStatus(`verified (${data.pointsEarned} pts earned)`);
        
        if (data.pointsEarned > 0) {
          setViewerPoints((prev) => prev + data.pointsEarned);
          if (onPointsEarned) onPointsEarned(data.pointsEarned);
        }

        if (data.riskScore !== undefined) setRiskScore(data.riskScore);
        if (data.userStatus) setUserStatus(data.userStatus);

        if (data.ledgerEntry && onLedgerEntryAdded) {
          onLedgerEntryAdded(data.ledgerEntry);
        }

        // Check if Backend Triggered a Random "Captcha Drop" Challenge!
        if (data.captchaRequired && data.challenge) {
          setActiveCaptcha(data.challenge);
          setCaptchaCountdown(data.challenge.timeLimitSeconds || 15);
          setCaptchaResultMsg(null);
          setLastHeartbeatStatus('ATTENTION_CHECK_REQUIRED');
        } else {
          // Reset continuous watch seconds after successful heartbeat send
          setActiveWatchSeconds(0);
        }
      } else {
        setLastHeartbeatStatus(`rejected: ${data.error || 'Validation failed'}`);
        if (data.userStatus) setUserStatus(data.userStatus);
      }
    } catch (err: any) {
      console.error('Heartbeat transmission error:', err);
      setLastHeartbeatStatus('network_error');
    }
  }, [viewerId, activeCaptcha, onPointsEarned, onLedgerEntryAdded]);

  // 4. Automated Heartbeat Interval Trigger
  useEffect(() => {
    if (activeWatchSeconds >= heartbeatIntervalSeconds) {
      sendHeartbeat();
    }
  }, [activeWatchSeconds, heartbeatIntervalSeconds, sendHeartbeat]);

  // 5. Captcha Challenge 15-Second Timer Countdown
  useEffect(() => {
    if (!activeCaptcha) return;

    captchaTimerRef.current = setInterval(() => {
      setCaptchaCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(captchaTimerRef.current as NodeJS.Timeout);
          // Auto-fail captcha on timeout
          handleCaptchaTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (captchaTimerRef.current) clearInterval(captchaTimerRef.current);
    };
  }, [activeCaptcha]);

  // Handle Captcha Timeout
  const handleCaptchaTimeout = async () => {
    if (!activeCaptcha) return;
    setCaptchaSubmitting(true);

    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken: activeCaptcha.challengeToken,
          selectedIndex: -1, // Timed out / missed click
          viewerId,
          timedOut: true
        })
      });

      const data = await res.json();
      setCaptchaResultMsg({
        success: false,
        text: '⏰ Attention Check Timed Out! User flagged as potential automated bot.'
      });
      setRiskScore(data.riskScore || 85);
      setUserStatus('flagged_bot_suspect');
    } catch (err) {
      console.error('Captcha timeout submission error:', err);
    } finally {
      setCaptchaSubmitting(false);
      setTimeout(() => {
        setActiveCaptcha(null);
        setActiveWatchSeconds(0);
      }, 2500);
    }
  };

  // Submit Captcha User Response
  const submitCaptchaResponse = async (selectedIndex: number) => {
    if (!activeCaptcha || captchaSubmitting) return;
    setCaptchaSubmitting(true);

    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken: activeCaptcha.challengeToken,
          selectedIndex,
          viewerId,
          timedOut: false
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCaptchaResultMsg({
          success: true,
          text: `🎉 Human Presence Verified! Earned +${data.pointsEarned} Bonus Ticket Points!`
        });

        setViewerPoints((prev) => prev + data.pointsEarned);
        if (onPointsEarned) onPointsEarned(data.pointsEarned);
        if (data.riskScore !== undefined) setRiskScore(data.riskScore);
        setUserStatus('verified_human');

        if (data.ledgerEntry && onLedgerEntryAdded) {
          onLedgerEntryAdded(data.ledgerEntry);
        }
      } else {
        setCaptchaResultMsg({
          success: false,
          text: `❌ Incorrect Selection! Bot Risk Score increased to ${data.riskScore}%.`
        });
        if (data.riskScore !== undefined) setRiskScore(data.riskScore);
        setUserStatus(data.userStatus || 'flagged_bot_suspect');
      }
    } catch (err) {
      console.error('Captcha verification error:', err);
    } finally {
      setCaptchaSubmitting(false);
      setTimeout(() => {
        setActiveCaptcha(null);
        setActiveWatchSeconds(0);
      }, 2200);
    }
  };

  return {
    isTabVisible,
    isTabFocused,
    activeWatchSeconds,
    totalVerifiedSeconds,
    viewerPoints,
    riskScore,
    userStatus,
    lastHeartbeatStatus,
    activeCaptcha,
    captchaCountdown,
    captchaSubmitting,
    captchaResultMsg,
    submitCaptchaResponse,
    sendHeartbeat
  };
}
