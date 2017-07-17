/**
 * 生成n位随机数
 * @param {number} n 
 */
export function gen(n) {
  if (n > 7) {
    return gen(7) + gen(n - 7);
  } else {
    return Math.floor(Math.random() * (1 << (n * 4)))
      .toString(16)
      .substr(0, n)
      .toUpperCase();
  }
}
