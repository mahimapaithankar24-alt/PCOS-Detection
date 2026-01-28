/**
 * Storage utilities for handling large result data
 * Uses sessionStorage to avoid cookie size limits (4KB)
 */

export function saveResult(result: any) {
  try {
    // Use sessionStorage for large data (no size limit like cookies)
    sessionStorage.setItem('pcos_result', JSON.stringify(result));
    console.log('✅ Result saved to sessionStorage');
    return true;
  } catch (error) {
    console.error('❌ Failed to save result:', error);
    return false;
  }
}

export function getResult() {
  try {
    const stored = sessionStorage.getItem('pcos_result');
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('❌ Failed to retrieve result:', error);
    return null;
  }
}

export function clearResult() {
  sessionStorage.removeItem('pcos_result');
}
