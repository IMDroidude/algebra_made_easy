export const takeaways: string[] = [
  'The dot product multiplies matching entries and adds them up: (a1, a2) · (b1, b2) = a1·b1 + a2·b2.',
  'Its sign tells you the angle: positive means the arrows lean the same way, zero means perpendicular, negative means they lean apart.',
  'A vector dotted with itself is its squared length, so |a| = √(a · a); dividing by the length gives a unit vector.',
  'a · b = |a||b|cos θ, so cosine similarity, a · b divided by |a||b|, keeps only direction and always lies between −1 and 1.',
  'Embedding search ranks documents by cosine similarity with the query, so a short arrow pointing the right way can beat a long one pointing less well.',
]
