import { EMAILS } from '../../data/emails'
import type { Vec2 } from '../../linalg'
import { scale } from '../../linalg'
import { fisherDirection, learn } from './classifier'
import type { Example, Model } from './classifier'

export { EMAILS, EMAIL_COLOR } from '../../data/emails'

/** The model learned from the shared emails: w = (1, 1), b = 5. */
export const MODEL = learn(EMAILS) as Model

/** The visible part of the plane in most steps. Counts are never negative. */
export const VIEW_X: [number, number] = [-0.5, 7]
export const VIEW_Y: [number, number] = [-0.5, 6.5]

/** The email in the second prediction. */
export const PREDICT_EMAIL: Vec2 = [3, 1]

/** Where the "try a new email" point starts in the Apply step. */
export const APPLY_START: Vec2 = [1, 3]

/** The email whose projection the Apply step shows by default. */
export const PROJECTED = EMAILS[4]

/**
 * A second, made-up inbox for the advanced part: inside each group the
 * number of links varies a lot (±3) while "!" marks vary little (±1). The
 * centres differ by (2, 2) again, so the plain recipe still says w = (1, 1),
 * but that line gets two emails wrong. Fisher's S_w⁻¹ tilts the line and
 * gets all eight right.
 */
export const STRETCHED: Example[] = [
  { name: 'N1', kind: 'normal', at: [0, 1] },
  { name: 'N2', kind: 'normal', at: [6, 1] },
  { name: 'N3', kind: 'normal', at: [3, 0] },
  { name: 'N4', kind: 'normal', at: [3, 2] },
  { name: 'S1', kind: 'spam', at: [2, 3] },
  { name: 'S2', kind: 'spam', at: [8, 3] },
  { name: 'S3', kind: 'spam', at: [5, 2] },
  { name: 'S4', kind: 'spam', at: [5, 4] },
]

export const STRETCHED_VIEW_X: [number, number] = [-0.5, 8.5]
export const STRETCHED_VIEW_Y: [number, number] = [-0.5, 5]

/** The plain recipe on the stretched inbox: w = (1, 1), b = 6. */
export const STRETCHED_PLAIN = learn(STRETCHED) as Model

/**
 * Fisher's direction on the stretched inbox, S_w⁻¹ d = (1/18, 1/2), scaled
 * by 18 to the whole numbers (1, 9) for display; the threshold scales with it.
 */
const fisherRaw = fisherDirection(STRETCHED) as Vec2
export const STRETCHED_FISHER_RAW = fisherRaw
const fisherW = scale(fisherRaw, 1 / fisherRaw[0])
export const STRETCHED_FISHER: Pick<Model, 'w' | 'b'> = {
  w: fisherW,
  b: fisherW[0] * STRETCHED_PLAIN.midpoint[0] + fisherW[1] * STRETCHED_PLAIN.midpoint[1],
}
