# Module 1: Understanding coordinates and 3D space

For someone who has never studied linear algebra. Everything later in the course is built on these ideas.

## After this module you can answer

- What is a dimension?
- What are coordinates?
- What is an origin?
- What is a coordinate plane?
- What is 3D space, and what is a plane inside it?
- What is the difference between a point and a vector?
- How can a real-world position be written as numbers?

Companion Jupyter notebook: `public/notebooks/module-1-coordinates.ipynb`

## Lessons at a glance

| # | Lesson | In one line | Why an AI engineer needs it |
|---|---|---|---|
| 1.1 | [Dimensions and the origin](https://imdroidude.github.io/algebra_made_easy/#/lessons/dimensions-and-origin) | How many numbers does it take to say where something is? | Every piece of data an AI model sees has a number of dimensions: one per measured feature. |
| 1.2 | [The coordinate plane](https://imdroidude.github.io/algebra_made_easy/#/lessons/coordinate-plane) | Points, axes, quadrants and (x, y). | A data example with two measured features is a point on this plane. |
| 1.3 | [3D space: the room](https://imdroidude.github.io/algebra_made_easy/#/lessons/3d-space) | Width, height, depth, and flat planes inside space. | Three features need three axes; real data uses hundreds, with exactly the same rules. |
| 1.4 | [Points and vectors](https://imdroidude.github.io/algebra_made_easy/#/lessons/points-and-vectors) | A place versus a movement: same numbers, different meaning. | Embeddings, gradients and model updates are all vectors: movements in feature space. |
| 1.5 | [Positions in the real world](https://imdroidude.github.io/algebra_made_easy/#/lessons/real-world-positions) | Choose an origin, axes and units, and anything has an address. | Turning real things into lists of numbers is the first step of every AI project. |

## 1.1 Dimensions and the origin

How many numbers does it take to say where something is? Every piece of data an AI model sees has a number of dimensions: one per measured feature.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/dimensions-and-origin
- Source: `src/lessons/dimensions-and-origin/`

**Before you start**

- Count forwards and backwards in whole numbers
- Know that numbers below zero are written with a minus sign, like −3

**What the lesson covers**

1. Step 1 · See: How many numbers does it take?
2. Step 2 · Manipulate: Slide the bead, then move the origin
3. Step 3 · Predict: Before you look: move the origin
4. Step 4 · Understand: A number means: how far, and which way
5. Step 5 · Apply: Beyond three: a house as a point
6. Running example (houses): One house, one more number at a time
7. Step 6 · Practice: Your turn

**Key takeaways**

- A dimension is one independent direction you can move in.
- The number of dimensions is how many numbers you need to say where something is: one on a line, two on a floor, three in a room.
- The origin is the agreed starting point; a coordinate says how far from it, and the sign says which way.
- Moving the origin changes the numbers, never the place.
- Data with many measured features is a point in many dimensions: we cannot draw it, but the list of numbers still says where it is.

## 1.2 The coordinate plane

Points, axes, quadrants and (x, y). A data example with two measured features is a point on this plane.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/coordinate-plane
- Source: `src/lessons/coordinate-plane/`

**Before you start**

- Earlier lessons: 1.1 Dimensions and the origin
- Count steps forwards and backwards on a number line
- Read negative numbers: −3 is three steps below zero

**What the lesson covers**

1. Step 1 · See: From a number line to a plane
2. Step 2 · Manipulate: Drag the point anywhere, even left and down
3. Step 3 · Predict: Before you look: flip the sign of x
4. Step 4 · Understand: Order matters: x first, then y
5. Step 5 · Apply: A row of data is a point
6. Running example (houses): Eight houses on a plane
7. Step 6 · Practice: Place these points yourself

**Key takeaways**

- A point on the plane is two numbers written (x, y): x is the left-right walk, y is the up-down walk, always in that order.
- The x-axis and y-axis cross at the origin (0, 0) and split the plane into four quadrants, numbered I to IV counter-clockwise from the top right.
- A minus sign is a direction, not a smaller size: negative x means left, negative y means down.
- In NumPy a point is np.array([x, y]); Python counts from 0, so p[0] is x and p[1] is y.
- A row of data with two features is a point on this plane; more features just means more numbers per point.

## 1.3 3D space: the room

Width, height, depth, and flat planes inside space. Three features need three axes; real data uses hundreds, with exactly the same rules.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/3d-space
- Source: `src/lessons/3d-space/`

**Before you start**

- Earlier lessons: 1.2 The coordinate plane
- Read and plot a point (x, y), including negative coordinates

**What the lesson covers**

1. Step 1 · See: A line, then a plane, then a room
2. Step 2 · Manipulate: Walk to the point, watch its shadows
3. Step 3 · Predict: Before you look: what does the front view show?
4. Step 4 · Understand: Three numbers, three walks, three shadows
5. Step 5 · Apply: Three features, three axes
6. Running example (houses): The houses in the room
7. Step 6 · Practice: Find these points yourself

**Key takeaways**

- A point in 3D space needs three numbers, always in the order (x, y, z): width, height and depth.
- Each coordinate is a walk along one axis from the origin (0, 0, 0); the order of the walks does not matter.
- A plane is a flat, infinite sheet inside space, such as the floor (y = 0) or the back wall (z = 0), and it splits space into two sides.
- A flat picture of 3D data is a shadow: it keeps two coordinates and hides the third.
- A dataset with three features is a cloud of points in this room; more features means more axes, with the same rules.

## 1.4 Points and vectors

A place versus a movement: same numbers, different meaning. Embeddings, gradients and model updates are all vectors: movements in feature space.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/points-and-vectors
- Source: `src/lessons/points-and-vectors/`

**Before you start**

- Earlier lessons: 1.2 The coordinate plane; 1.3 3D space: the room
- Plot a point (x, y) and read one off the plane, including negatives

**What the lesson covers**

1. Step 1 · See: A place and a movement, written with the same numbers
2. Step 2 · Manipulate: Move the arrow anywhere: it stays the same vector
3. Step 3 · Predict: Before you look: what is a place plus a place?
4. Step 4 · Understand: From A to B is B − A
5. Step 5 · Apply: Robots, games and AI models all move by vectors
6. Running example (houses): How two houses differ is a vector
7. Step 6 · Practice: Three small puzzles

**Key takeaways**

- A point is a place, like an address: it answers "where?".
- A vector is a movement, like directions: it answers "which way, and how far?". It has no fixed starting place.
- The movement from A to B is B − A, and point + vector gives a new point.
- Adding two points means nothing useful; the arrow from the origin to a point (its position vector) has the same numbers as the point.
- In AI, embeddings, gradients and weight updates are vectors: movements in a space with many directions.

## 1.5 Positions in the real world

Choose an origin, axes and units, and anything has an address. Turning real things into lists of numbers is the first step of every AI project.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/real-world-positions
- Source: `src/lessons/real-world-positions/`

**Before you start**

- Earlier lessons: 1.2 The coordinate plane; 1.3 3D space: the room; 1.4 Points and vectors
- Write a point in 2D as (x, y) and in 3D as (x, y, z)
- Say whether a pair of numbers means a place or a movement

**What the lesson covers**

1. Step 1 · See: The recipe for an address
2. Step 2 · Manipulate: Same lamp, different numbers
3. Step 3 · Predict: Move the origin to the door
4. Step 4 · Understand: New origin? Subtract it.
5. Step 5 · Apply: Addresses out in the world
6. Running example (houses): Choosing an origin and units for the houses
7. Step 6 · Practice: Give these things an address

**Key takeaways**

- To give anything an address, choose an origin, directions for the axes and a unit; then a position is a list of numbers.
- Moving the origin changes the numbers, never the thing: new address = old address − new origin.
- Changing the unit divides every number by the size of the new unit; flipping a direction flips the sign of that one number.
- GPS latitude and longitude are angles on a sphere, not flat distances, but they follow the same recipe.
- Things that are not places, like a fruit or a house, can be positioned by their measured features: the first step of every AI project.
