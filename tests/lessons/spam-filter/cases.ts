import { EMAILS } from '../../../src/data/emails'
import { moveEmail } from '../../../src/lessons/spam-filter/classifier'
import { STRETCHED } from '../../../src/lessons/spam-filter/data'
import { houseSnippet } from '../../../src/lessons/spam-filter/runningExample'
import {
  centresSnippet,
  recipeSnippet,
  scatterSnippet,
  scoresSnippet,
  tableSnippet,
} from '../../../src/lessons/spam-filter/snippets'

/** Every NumPy snippet the lesson can show, in the order of numpy-fixtures.json. */
export function cases(): { code: string; output: string }[] {
  return [
    ...EMAILS.map((_, i) => tableSnippet(i)),
    centresSnippet(EMAILS),
    centresSnippet(moveEmail(EMAILS, 6, [7, 6])),
    centresSnippet(moveEmail(moveEmail(EMAILS, 0, [0, 0]), 4, [1, 6])),
    centresSnippet(moveEmail(EMAILS, 3, [5, 5])),
    recipeSnippet(),
    scatterSnippet(EMAILS),
    scatterSnippet(STRETCHED),
    scoresSnippet([1, 3]),
    scoresSnippet([3, 1]),
    scoresSnippet([4, 3]),
    scoresSnippet([0, 6]),
    scoresSnippet([6, 0]),
    houseSnippet(false),
    houseSnippet(true),
  ]
}
