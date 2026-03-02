// lib/utils.js - Utility helpers
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Generate a random short slug (6 chars)
 */
export function generateSlug(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Validate URL
 */
export function isValidUrl(str) {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(n) {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get base app URL
 */
export function getAppUrl() {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Build short URL from slug
 */
export function buildShortUrl(slug) {
    return `${getAppUrl()}/${slug}`;
}

/**
 * Get device type from user agent
 */
export function getDeviceType(ua) {
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
}

/**
 * Extract domain from URL
 */
export function extractDomain(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

/**
 * Plan limits
 */
export const PLAN_LIMITS = {
    free: { links: 25, clicks: 1000, teams: 0, customSlug: false, analytics: 7 },
    pro: { links: Infinity, clicks: Infinity, teams: 1, customSlug: true, analytics: 90 },
    team: { links: Infinity, clicks: Infinity, teams: 10, customSlug: true, analytics: 365 },
};
