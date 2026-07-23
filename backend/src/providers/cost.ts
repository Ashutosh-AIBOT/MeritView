export function estimateCost(inputTokens: number, outputTokens: number, inputPricePerM: number, outputPricePerM: number) {
  return (inputTokens / 1_000_000) * inputPricePerM + (outputTokens / 1_000_000) * outputPricePerM;
}
