/**
 * Centralized Design Tokens for Seekora AI
 * Premium White / Light Neumorphic System
 */

export const NEU_TOKENS = {
  colors: {
    bg: '#F4F5F7',
    surface: '#F4F5F7',
    raised: '#F8F9FB',
    card: '#F7F8FA',
    input: '#EEF0F3',
    primary: '#17181C',
    secondary: '#646974',
    muted: '#9297A1',
    border: 'rgba(20, 24, 32, 0.06)',
    accent: '#6D5DFB',
    accentHover: '#5B4AE8',
    success: '#22A879',
    warning: '#C98A25',
    danger: '#D95C5C',
    white: '#FFFFFF',
  },
  shadows: {
    raised: '8px 8px 18px rgba(163, 170, 181, 0.28), -8px -8px 18px rgba(255, 255, 255, 0.95)',
    raisedSm: '5px 5px 12px rgba(163, 170, 181, 0.25), -5px -5px 12px rgba(255, 255, 255, 0.90)',
    inset: 'inset 5px 5px 12px rgba(163, 170, 181, 0.20), inset -5px -5px 12px rgba(255, 255, 255, 0.90)',
    insetSm: 'inset 3px 3px 8px rgba(163, 170, 181, 0.25), inset -3px -3px 8px rgba(255, 255, 255, 0.90)',
    pressed: 'inset 4px 4px 10px rgba(163, 170, 181, 0.30), inset -3px -3px 8px rgba(255, 255, 255, 0.95)',
    activeNav: 'inset 3px 3px 7px rgba(163, 170, 181, 0.22), inset -3px -3px 7px rgba(255, 255, 255, 0.90)',
  },
  radius: {
    large: '22px', // Large panels (20-24px)
    medium: '16px', // Cards (16-18px)
    input: '13px', // Inputs (12-14px)
    button: '11px', // Buttons (10-12px)
    pill: '9999px', // Status, tags, small filters only
  },
} as const;
