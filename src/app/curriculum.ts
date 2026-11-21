export type LessonEntry = {
  /** Shown in the lesson header and on the home page: "1.1", "1.2" … */
  id: string
  /** Folder name under src/lessons/ and the URL: /lessons/<slug>. Never changes once published. */
  slug: string
  title: string
  summary: string
  /**
   * Why an AI engineer needs this, in one sentence. Gentle in Module 1 (no
   * neural networks yet), more concrete as the course goes on.
   */
  ai: string
}

export type Module = {
  n: number
  title: string
  blurb: string
  /** What a learner can confidently explain after the module. */
  goals?: string[]
  /** A companion Jupyter notebook served from public/, if the module has one. */
  notebook?: string
  lessons: LessonEntry[]
}

export const CURRICULUM: Module[] = [
  {
    n: 1,
    title: 'Understanding coordinates and 3D space',
    blurb:
      'For someone who has never studied linear algebra. Everything later in the course is built on these ideas.',
    goals: [
      'What is a dimension?',
      'What are coordinates?',
      'What is an origin?',
      'What is a coordinate plane?',
      'What is 3D space, and what is a plane inside it?',
      'What is the difference between a point and a vector?',
      'How can a real-world position be written as numbers?',
    ],
    notebook: 'notebooks/module-1-coordinates.ipynb',
    lessons: [
      {
        id: '1.1',
        slug: 'dimensions-and-origin',
        title: 'Dimensions and the origin',
        summary: 'How many numbers does it take to say where something is?',
        ai: 'Every piece of data an AI model sees has a number of dimensions: one per measured feature.',
      },
      {
        id: '1.2',
        slug: 'coordinate-plane',
        title: 'The coordinate plane',
        summary: 'Points, axes, quadrants and (x, y).',
        ai: 'A data example with two measured features is a point on this plane.',
      },
      {
        id: '1.3',
        slug: '3d-space',
        title: '3D space: the room',
        summary: 'Width, height, depth, and flat planes inside space.',
        ai: 'Three features need three axes; real data uses hundreds, with exactly the same rules.',
      },
      {
        id: '1.4',
        slug: 'points-and-vectors',
        title: 'Points and vectors',
        summary: 'A place versus a movement: same numbers, different meaning.',
        ai: 'Embeddings, gradients and model updates are all vectors: movements in feature space.',
      },
      {
        id: '1.5',
        slug: 'real-world-positions',
        title: 'Positions in the real world',
        summary: 'Choose an origin, axes and units, and anything has an address.',
        ai: 'Turning real things into lists of numbers is the first step of every AI project.',
      },
    ],
  },
  {
    n: 2,
    title: 'The algebra toolkit',
    blurb: 'The school algebra the rest of the course leans on. Skip any lesson you already know.',
    lessons: [
      {
        id: '2.1',
        slug: 'variables-and-equations',
        title: 'Variables and equations',
        summary: 'Solving x + 5 = 12 on a balance scale.',
        ai: 'A model’s weights are unknowns; training is solving for them.',
      },
      {
        id: '2.2',
        slug: 'functions',
        title: 'Functions',
        summary: 'Input in, output out: f(x) = 2x + 1.',
        ai: 'A trained model is a function: data in, prediction out.',
      },
      {
        id: '2.3',
        slug: 'lines-slope-intercept',
        title: 'Lines: slope, intercept and boundaries',
        summary: 'y = mx + b, and a line that splits the plane in two.',
        ai: 'A single neuron is w·x + b, and a straight line is the simplest decision boundary.',
      },
      {
        id: '2.4',
        slug: 'exponents-and-roots',
        title: 'Exponents and roots',
        summary: 'Why x² grows so fast, and what √x undoes.',
        ai: 'Squared error drives training, and square roots measure distance between data points.',
      },
    ],
  },
  {
    n: 3,
    title: 'Vectors',
    blurb: 'Arrows you can add, scale and compare: the language of embeddings.',
    lessons: [
      {
        id: '3.1',
        slug: 'scalars-and-vectors',
        title: 'Vector arithmetic',
        summary: 'Add, subtract and scale arrows.',
        ai: 'Word embeddings are vectors, and arithmetic on them captures meaning.',
      },
      {
        id: '3.2',
        slug: 'span-and-basis',
        title: 'Linear combinations, span, basis',
        summary: 'Which points can two vectors reach?',
        ai: 'A feature vector is a mix of basis features; span tells you what a model can represent.',
      },
      {
        id: '3.3',
        slug: 'dot-product',
        title: 'Dot product, length and cosine similarity',
        summary: 'How alike are two embeddings?',
        ai: 'Cosine similarity ranks search results; dot products are the scores inside attention.',
      },
    ],
  },
  {
    n: 4,
    title: 'Matrices',
    blurb: 'A matrix moves every point at once. This is what a neural-network layer does.',
    lessons: [
      {
        id: '4.1',
        slug: 'matrices-as-transformations',
        title: 'Matrices as transformations',
        summary: 'A matrix moves the whole plane. Drag it and see.',
        ai: 'A neural-network layer is a matrix transforming a cloud of data points.',
      },
      {
        id: '4.2',
        slug: 'matrix-multiplication',
        title: 'Matrix multiplication',
        summary: 'One transformation after another.',
        ai: 'Forward propagation is matrix multiplication, layer after layer.',
      },
      {
        id: '4.3',
        slug: 'shapes-and-transpose',
        title: 'Shapes, transpose, non-square matrices',
        summary: 'Changing the number of dimensions.',
        ai: 'Matching shapes is half of debugging a model; projection layers change dimension.',
      },
      {
        id: '4.4',
        slug: 'determinant',
        title: 'Determinant',
        summary: 'How much a matrix stretches area.',
        ai: 'A determinant of zero means information is lost and cannot be recovered.',
      },
      {
        id: '4.5',
        slug: 'inverse-rank-null-space',
        title: 'Inverse, rank, null space',
        summary: 'When a transformation can be undone.',
        ai: 'Low-rank matrices are the idea behind efficient fine-tuning methods such as LoRA.',
      },
    ],
  },
  {
    n: 5,
    title: 'Inside AI models',
    blurb: 'The linear algebra running inside real models, from regression to transformers.',
    lessons: [
      {
        id: '5.1',
        slug: 'spam-filter',
        title: 'Build a spam filter',
        summary: 'From a table to a learned decision line, using only vectors and matrices.',
        ai: 'A linear classifier is a learned direction plus a threshold: the core of many real models.',
      },
      {
        id: '5.2',
        slug: 'projection-least-squares',
        title: 'Projection and least squares',
        summary: 'The best-fit line.',
        ai: 'Linear regression, the simplest trainable model, is a projection.',
      },
      {
        id: '5.3',
        slug: 'eigenvectors',
        title: 'Eigenvectors and eigenvalues',
        summary: 'Directions a matrix does not turn.',
        ai: 'PCA finds the most informative directions in data using eigenvectors.',
      },
      {
        id: '5.4',
        slug: 'svd',
        title: 'Singular value decomposition',
        summary: 'Rotate, stretch, rotate.',
        ai: 'SVD compresses data and models by keeping only what matters most.',
      },
      {
        id: '5.5',
        slug: 'attention',
        title: 'Capstone: attention',
        summary: 'A tiny attention head, step by step.',
        ai: 'Attention is the core operation of every transformer, including GPT-style models.',
      },
    ],
  },
]

export type LessonWithModule = LessonEntry & { module: number; moduleTitle: string }

export const ALL_LESSONS: LessonWithModule[] = CURRICULUM.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, module: m.n, moduleTitle: m.title })),
)
