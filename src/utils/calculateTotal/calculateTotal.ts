export function calculateTotal(amounts: string): number {
  // Split by commas or newlines, then flatten the array in case of mixed delimiters
  const values = amounts
    .split(/[\n,]+/) // Split by either newline or comma
    .flatMap(part => part.trim()) // Trim each part
    .filter(part => part !== ''); // Remove empty strings

  // Convert to numbers and sum
  return values.reduce((sum, str) => {
    const num = parseFloat(str);
    if (isNaN(num)) {
      console.warn(`Invalid number encountered: "${str}"`);
      return sum;
    }
    return sum + num;
  }, 0);
}