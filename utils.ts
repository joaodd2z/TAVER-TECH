export const APP = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'TAVER TECH',
};

export function isLowPerf() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('lowPerf') === '1';
}