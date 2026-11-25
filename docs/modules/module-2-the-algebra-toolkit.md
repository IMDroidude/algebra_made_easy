# Module 2: The algebra toolkit

The school algebra the rest of the course leans on. Skip any lesson you already know.

## Lessons at a glance

| # | Lesson | In one line | Why an AI engineer needs it |
|---|---|---|---|
| 2.1 | [Variables and equations](https://imdroidude.github.io/algebra_made_easy/#/lessons/variables-and-equations) | Solving x + 5 = 12 on a balance scale. | A model’s weights are unknowns; training is solving for them. |
| 2.2 | [Functions](https://imdroidude.github.io/algebra_made_easy/#/lessons/functions) | Input in, output out: f(x) = 2x + 1. | A trained model is a function: data in, prediction out. |
| 2.3 | [Lines: slope, intercept and boundaries](https://imdroidude.github.io/algebra_made_easy/#/lessons/lines-slope-intercept) | y = mx + b, and a line that splits the plane in two. | A single neuron is w·x + b, and a straight line is the simplest decision boundary. |
| 2.4 | [Exponents and roots](https://imdroidude.github.io/algebra_made_easy/#/lessons/exponents-and-roots) | Why x² grows so fast, and what √x undoes. | Squared error drives training, and square roots measure distance between data points. |

## 2.1 Variables and equations

Solving x + 5 = 12 on a balance scale. A model’s weights are unknowns; training is solving for them.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/variables-and-equations
- Source: `src/lessons/variables-and-equations/`

**Before you start**

- Add, subtract, multiply and divide whole numbers, including negatives
- Know that “=” means both sides have the same value

**What the lesson covers**

1. Step 1 · See: An equation is a balanced scale
2. Step 2 · Manipulate: Do the same thing to both sides
3. Step 3 · Predict: Before you press it: what does this move do?
4. Step 4 · Understand: Undo what was done to x, in reverse order
5. Step 5 · Apply: Training a model is solving for its weights
6. Running example (houses): One house, one unknown
7. Step 6 · Practice: Solve these on your own

**Key takeaways**

- A variable is a number you do not know yet, and an equation says two sides weigh the same, like a level balance scale.
- The one rule: whatever you do to one side, do to the other, and the equation stays true.
- Solve by inverse operations, undoing what was done to x in reverse order: for 2x + 3 = 11, subtract 3 first, then divide by 2.
- A model’s weights are unknowns too; training finds them by guessing, measuring the error and nudging, not by dividing.
- When real examples disagree, no single weight fits them all exactly, so training settles on the best compromise.

## 2.2 Functions

Input in, output out: f(x) = 2x + 1. A trained model is a function: data in, prediction out.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/functions
- Source: `src/lessons/functions/`

**Before you start**

- Earlier lessons: 1.2 The coordinate plane; 2.1 Variables and equations
- Put a number in place of x and work out 2x + 1 (for x = 3: 2 × 3 + 1 = 7)
- Plot a point (x, y)

**What the lesson covers**

1. Step 1 · See: A machine that turns numbers into numbers
2. Step 2 · Manipulate: Every input drops a point
3. Step 3 · Predict: Before you look: change the rule
4. Step 4 · Understand: The rule, the table and the line are the same thing
5. Step 5 · Apply: A model is a function: data in, prediction out
6. Running example (houses): The model as a table: f(sqft) for every house
7. Step 6 · Practice: Build these machines

**Key takeaways**

- A function is a rule that turns each input into exactly one output: the same input always gives the same output.
- f(x) = 2x + 1 means "multiply by 2, then add 1", so f(3) = 7.
- Each input and its output make a point (x, f(x)); a rule of the form mx + b always draws a straight line.
- The formula, the table of inputs and outputs, and the line are one thing seen three ways.
- In NumPy you apply a rule to a whole array at once (vectorising), and every AI model is a function: data in, prediction out.

## 2.3 Lines: slope, intercept and boundaries

y = mx + b, and a line that splits the plane in two. A single neuron is w·x + b, and a straight line is the simplest decision boundary.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/lines-slope-intercept
- Source: `src/lessons/lines-slope-intercept/`

**Before you start**

- Earlier lessons: 2.2 Functions
- Make a table of inputs and outputs for a rule like f(x) = 2x + 1
- Read a fraction as a division: 6/3 = 2

**What the lesson covers**

1. Step 1 · See: A line is a rule that turns x into y
2. Step 2 · Manipulate: Slope tilts the line, intercept slides it
3. Step 3 · Predict: Before you look: flip the sign of the slope
4. Step 4 · Understand: Two points are enough to pin down a line
5. Step 5 · Apply: A single neuron is y = wx + b
6. Running example (houses): A line through the houses
7. Step 6 · Practice: Fit a line to data by hand

**Key takeaways**

- Every non-vertical straight line is y = mx + b: m is the slope (rise over run), b is where it crosses the y-axis.
- Two different points are enough to pin down a line: rise over run gives m, then b = y₁ − m·x₁.
- A single neuron computes y = wx + b: the slope is called the weight and the intercept the bias.
- A line also splits the plane in two; the rule "w·x + b > 0 means class A" is the simplest decision boundary, the one a linear classifier draws.
- Training means nudging w and b: to shrink the squared error of a fit, or the number of points on the wrong side of a boundary.

## 2.4 Exponents and roots

Why x² grows so fast, and what √x undoes. Squared error drives training, and square roots measure distance between data points.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/exponents-and-roots
- Source: `src/lessons/exponents-and-roots/`

**Before you start**

- Earlier lessons: 1.2 The coordinate plane
- Multiply numbers, including negatives: (−3) × (−3) = 9
- Find the area of a rectangle: width × height

**What the lesson covers**

1. Step 1 · See: x² is the area of a square with side x
2. Step 2 · Manipulate: Grow the square, or start from the area
3. Step 3 · Predict: Before you look: double the side
4. Step 4 · Understand: How fast squares grow, and what happens to negatives
5. Step 5 · Apply: Squares measure mistakes, roots measure distances
6. Running example (houses): Squared errors and distances on the houses
7. Step 6 · Practice: Place the point

**Key takeaways**

- x² is the area of a square with side x, and √x goes back from the area to the side: √9 = 3.
- Squares grow faster and faster (1, 4, 9, 16), so doubling a side makes the area four times as big.
- A negative number squares to a positive one, (−3)² = 9; in Python write (-3) ** 2, because -3 ** 2 is −9.
- √ always means the non-negative root, and a negative number has no real square root (np.sqrt(-4) gives nan).
- Squared error makes big mistakes cost much more than small ones, and distance is the square root of the summed squares (Pythagoras).
