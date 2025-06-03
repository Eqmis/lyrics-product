/**
 * 从数组中随机返回指定数量的元素（不重复）
 * @param {Array} arr - 输入数组
 * @param {number} count - 随机返回的数量
 * @returns {Array} - 随机结果数组
 */
function getRandomItems(arr, count) {
  if (!Array.isArray(arr)) return []
  if (count >= arr.length) {
    return arr.map((value, index) => ({ value, index }))
  }

  // 构建原始下标数组并打乱顺序
  const indexes = arr.map((_, i) => i).sort(() => 0.5 - Math.random())
  const selectedIndexes = indexes.slice(0, count)

  // 构建结果对象
  return selectedIndexes.map((i) => ({
    value: arr[i],
    index: i,
  }))
}
export { getRandomItems }
