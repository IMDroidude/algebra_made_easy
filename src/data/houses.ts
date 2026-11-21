/**
 * The course's running example: eight houses, each described by three
 * features, plus its price. Every lesson shows its operation on this same
 * data, so learners watch one familiar dataset pass through each new tool.
 *
 * Prices follow roughly price ≈ 0.2·sqft + 15·bedrooms − 6·distance + 60
 * (in $ thousands), with a little noise, so regression lessons have a real
 * but imperfect pattern to find. All values are invented for teaching.
 */
export type House = {
  id: string
  /** A short nickname to make rows memorable. */
  name: string
  /** Floor area in square feet. */
  sqft: number
  bedrooms: number
  /** Distance to the city centre in kilometres. */
  distanceKm: number
  /** Price in thousands of dollars. */
  priceK: number
}

export const HOUSES: readonly House[] = [
  { id: 'A', name: 'Garden flat', sqft: 1100, bedrooms: 2, distanceKm: 8, priceK: 265 },
  { id: 'B', name: 'Corner house', sqft: 1500, bedrooms: 3, distanceKm: 5, priceK: 370 },
  { id: 'C', name: 'City studio', sqft: 900, bedrooms: 1, distanceKm: 2, priceK: 248 },
  { id: 'D', name: 'Family home', sqft: 2000, bedrooms: 4, distanceKm: 12, priceK: 440 },
  { id: 'E', name: 'Terrace', sqft: 1300, bedrooms: 2, distanceKm: 3, priceK: 335 },
  { id: 'F', name: 'Bungalow', sqft: 1800, bedrooms: 3, distanceKm: 9, priceK: 418 },
  { id: 'G', name: 'Townhouse', sqft: 2400, bedrooms: 4, distanceKm: 6, priceK: 560 },
  { id: 'H', name: 'Country cottage', sqft: 1000, bedrooms: 2, distanceKm: 15, priceK: 205 },
]

/** The three feature columns, in order. */
export const FEATURES = ['sqft', 'bedrooms', 'distanceKm'] as const
export type Feature = (typeof FEATURES)[number]

export const FEATURE_LABEL: Record<Feature | 'priceK', string> = {
  sqft: 'size (sqft)',
  bedrooms: 'bedrooms',
  distanceKm: 'distance to centre (km)',
  priceK: 'price ($k)',
}

/** One house as a feature vector [sqft, bedrooms, distance_km]. */
export function featureVector(h: House): number[] {
  return [h.sqft, h.bedrooms, h.distanceKm]
}

/** The data matrix X: one row per house, one column per feature. */
export function featureMatrix(houses: readonly House[] = HOUSES): number[][] {
  return houses.map(featureVector)
}

/** The price column y. */
export function prices(houses: readonly House[] = HOUSES): number[] {
  return houses.map((h) => h.priceK)
}

/** NumPy code that builds X and y for these houses, ready to paste into a snippet. */
export function housesNumpy(houses: readonly House[] = HOUSES): string {
  const rows = houses.map((h) => `[${h.sqft}, ${h.bedrooms}, ${h.distanceKm}]`)
  const pad = ' '.repeat('X = np.array(['.length)
  return [
    '# columns: sqft, bedrooms, distance_km (one house per row)',
    `X = np.array([${rows.join(`,\n${pad}`)}])`,
    `y = np.array([${houses.map((h) => h.priceK).join(', ')}])  # price in $k`,
  ].join('\n')
}
