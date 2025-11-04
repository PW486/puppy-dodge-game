export function collision(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

// 점수를 문자열로 변환할 때 콤마와 적절한 패딩 추가
export function formatScore(score) {
  return score.toString().padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// localStorage 래퍼
export const storage = {
  get: (key, defaultValue) => {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing ${key} to localStorage:`, e);
    }
  }
};