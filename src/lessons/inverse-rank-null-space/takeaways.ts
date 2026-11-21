export const takeaways: string[] = [
  'The inverse A⁻¹ undoes A: doing A and then A⁻¹ is doing nothing, A⁻¹A = I.',
  'The inverse exists only when the determinant is not zero; as the determinant shrinks towards zero, the entries of A⁻¹ blow up.',
  'The rank is the dimension of everything A can output: 2 for the plane, 1 for a line, 0 for a single point.',
  'The null space is every input A crushes to zero, and rank plus null-space dimension equals the number of input dimensions.',
  'Ax = b has one solution, none, or infinitely many, like two lines that cross, are parallel, or are the same line; np.linalg.solve finds x without building A⁻¹.',
]
