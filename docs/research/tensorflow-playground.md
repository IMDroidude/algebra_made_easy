# TensorFlow Playground: what the linked setup does, and the lab built from it

Source: https://playground.tensorflow.org with this exact setup (from the link the owner sent):

`#activation=tanh&batchSize=10&dataset=circle&learningRate=0.03&regularizationRate=0&noise=0&networkShape=4,2&seed=0.49876&percTrainData=50&x=true&y=true&problem=classification` (all other features off).

Studied 2026-11-24 with Playwright (Chromium, 1280 px). The page loaded and automation was not blocked.
Numbers below were read from the page's own counters (`#iter-number`, `#loss-train`, `#loss-test`).
The result is the **neural network lab** in our Playground: `/#/playground?lab=network`.

## What the link sets up

| URL setting | Meaning |
|---|---|
| `problem=classification`, `dataset=circle` | 500 points in two classes: blue inside a disc, orange in a ring around it. Not separable by a straight line. |
| `percTrainData=50` | Half the points (250) train the network; the other half only measure test loss. |
| `noise=0` | The two classes do not overlap. |
| `x=true&y=true`, everything else false | The network sees only the raw coordinates X₁ and X₂. No X₁², X₂², X₁X₂, sin. |
| `networkShape=4,2` | Two hidden layers: 4 neurons, then 2. With 2 inputs and 1 output that is 3 weight matrices (4×2, 2×4, 1×2): 18 weights and 7 biases. |
| `activation=tanh` | Every hidden neuron computes tanh(w·x + b). The output is also tanh, so it lies between −1 (orange) and +1 (blue). |
| `learningRate=0.03`, `batchSize=10` | After every 10 points, each weight moves 0.03 × its average gradient. One epoch = all 250 training points = 25 updates. |
| `regularizationRate=0` | No penalty on large weights. |
| `seed=0.49876` | Fixes the random data, so the link always shows the same points. |

How to read the screen: each small square is one neuron, coloured by its output over the whole plane. First-layer squares
are always a straight edge (one line each). Lines between squares are weights: blue positive, orange negative, thicker =
larger. The big square on the right is the output neuron with the data on top. Loss is ½(output − label)², averaged; a
network that answers 0 everywhere scores 0.5.

## What happened when I ran it

| Setup (same data) | Epoch 0 | ~50 | ~300 | ~800 | 2,000 | Result |
|---|---|---|---|---|---|---|
| **The link as sent: tanh, 4 + 2** | 0.519 / 0.516 | 0.191 / 0.239 | 0.108 / 0.180 | – | 0.089 / 0.167 | **Stuck.** The blue region is a "U" open at the bottom: it never closes under the disc. |
| Linear, 4 + 2 | 0.523 / 0.509 | 0.498 / 0.505 | 0.498 / 0.505 | 0.498 / 0.505 | – | Never learns. Loss stays at the "answer 0 everywhere" level. |
| ReLU, 4 + 2 | 0.534 / 0.519 | 0.012 / 0.011 | 0.001 / 0.001 | 0.000 / 0.000 | – | Solved in about 50 epochs. |
| Sigmoid, 4 + 2 | 0.505 / 0.499 | 0.498 / 0.506 | 0.497 / 0.505 | 0.025 / 0.025 | – | Flat for hundreds of epochs, then solves it. |

Each cell is training loss / test loss. One run each. The tanh row is the first run after opening the link; the others
were started by changing the activation, which resets the network with new random weights. I did not test how much the
result varies between resets on the Playground itself (our own lab does vary: see the last paragraph of the next section).

What this shows:

1. **The linked run did not solve the problem.** With only 2 neurons in the second layer and these starting weights it
   settled in a poor arrangement (three sides of a box) and improved by only 0.019 between epoch 300 and 2,000.
   Starting weights matter; "press reset and try again" is a real part of training small networks.
2. **Linear activation cannot learn the circle at all**, whatever the layer sizes: a stack of linear layers multiplies
   out to one matrix, so the boundary is one straight line. This is exactly lesson 4.2's point.
3. **A curved boundary is built from straight ones.** Every first-layer neuron draws one line; the next layer mixes them.
   Closing a loop needs at least three lines, so at least three first-layer neurons.

## What we built from it

A third Playground tab, **"Neural network: cat or tiger?"** (`src/playground/network/`, maths in `src/linalg/neuralNet.ts`).
Same model as the Playground (tanh output, ½ squared error, batches of 10, weights start in ±0.5, biases at 0.1), so results
compare directly.

| Playground | Our lab |
|---|---|
| Abstract X₁, X₂ | **Body size** and **stripes**, each 0–10 (network sees them centred: −5…5). Made-up measurements, said so on the page. |
| Blue / orange dots | 🐱 🐯 🐭 drawn on the plane; teal = "cat", orange = the other class. Ring data uses ● and ▲. |
| Circle, XOR, Gaussian, spiral | **Cat or tiger?** (one line is enough; tabby cats are striped, so size decides). **Cat, or something else?** (mice, cats, tigers: cats are a middle band, one line cannot do it). **Ring** (the Playground circle). |
| Up to 6 layers × 8 neurons, 7 features, regularisation, noise, regression | 0–2 hidden layers × 1–6 neurons, tanh / ReLU / linear, 5 learning rates. The rest is left out: one idea at a time. |
| Hover a neuron or weight to see or edit it | "The matrices inside this network": every layer printed live as W and b, linking to lesson 4.2. |
| – | **Ask the network about a new animal**: sliders or a click on the plane; "size 9, stripes 5 → output −0.98, so the network says not a cat". |
| – | A status line that says in words whether it is solved, cannot be solved (one straight line), or is stuck (try new weights). |
| – | Five **Things to try**, each loading a setup with fixed starting weights, with a hidden explanation. |

The five experiments and what the tests confirm (learning rate 0.03, the weights the button loads):

| # | Setup | Outcome |
|---|---|---|
| 1 | Cat or tiger, no hidden layer | 40 of 40 correct, loss < 0.01 by epoch 100 |
| 2 | Cat among mice and tigers, no hidden layer | Never all correct; loss stays above 0.4 at epoch 600 |
| 3 | Same data, one hidden layer of 2 tanh neurons | 48 of 48 correct by epoch 300 |
| 4 | Same data, 4 + 2 neurons, linear activation | Never all correct (three sets of starting weights) |
| 5 | Ring, 4 + 2 tanh (the owner's link) | 60 of 60 correct by epoch 300 |

Also tested: the ring is never solved by 2 hidden neurons (six sets of starting weights), and 4 + 2 tanh from a
different start (seed 6) gets stuck at 55 of 60 after 600 epochs: the same behaviour as the linked Playground run.

## Limits

- Training runs at up to 60 epochs a second on tiny datasets (40–60 training points); the Playground's are 250.
- The animal numbers are invented. "Body size 0–10" is a score, not kilograms.
- Lesson 4.2's "Explore further" now points to this lab first and to TensorFlow Playground second.
- This is a Playground tab, not a lesson: no prediction step, quiz or running house example. A lesson (5.x,
  "A network that learns") could be built on the same code if wanted.
