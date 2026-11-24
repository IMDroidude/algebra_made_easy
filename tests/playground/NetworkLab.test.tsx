import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Playground } from '../../src/playground/Playground'

beforeAll(() => {
  // jsdom has no canvas; the lab then skips drawing and everything else still works.
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
})

function renderLab() {
  render(
    <MemoryRouter initialEntries={['/playground?lab=network']}>
      <Playground />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

const text = (id: string) => screen.getByTestId(id).textContent

describe('Playground: neural network lab', () => {
  it('opens from the ?lab=network link, untrained, on cat or tiger with 4 + 2 hidden neurons', () => {
    renderLab()
    expect(screen.getByRole('button', { name: 'Neural network: cat or tiger?' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Cat or tiger?' })).toHaveAttribute('aria-pressed', 'true')
    expect(text('epoch')).toBe('0')
    expect(text('status')).toMatch(/of 40 training examples correct\. Untrained/)
    expect(screen.getByText(/Hidden layers:/).textContent).toBe('Hidden layers: 2')
    expect(screen.getByRole('img', { name: /Network diagram: 2 inputs \(size and stripes\), hidden layers of 4 and 2 neurons, 1 output/ })).toBeInTheDocument()
  })

  it('switching lab tabs still works', async () => {
    const user = renderLab()
    await user.click(screen.getByRole('button', { name: 'Vectors: add and scale' }))
    expect(screen.getByRole('button', { name: 'Add two vectors' })).toBeInTheDocument()
  })

  it('stepping trains: the epoch counts up and the loss falls', async () => {
    const user = renderLab()
    await user.click(screen.getByRole('button', { name: /^1\. One neuron/ }))
    const before = Number(text('train-loss'))
    const step = screen.getByRole('button', { name: 'Step one epoch' })
    for (let i = 0; i < 30; i++) await user.click(step)
    expect(text('epoch')).toBe('30')
    expect(Number(text('train-loss'))).toBeLessThan(before)
    expect(text('status')).toMatch(/^40 of 40 training examples correct\. Every training example is on the correct side/)
  })

  it('the one-neuron experiment on the middle band explains why it cannot work', async () => {
    const user = renderLab()
    await user.click(screen.getByRole('button', { name: /^2\. One neuron/ }))
    expect(screen.getByText(/Hidden layers:/).textContent).toBe('Hidden layers: 0')
    const step = screen.getByRole('button', { name: 'Step one epoch' })
    for (let i = 0; i < 150; i++) await user.click(step)
    expect(text('status')).toMatch(/with no hidden layer the boundary is one straight line/)
  })

  it('changing the network starts again from epoch 0', async () => {
    const user = renderLab()
    await user.click(screen.getByRole('button', { name: 'Step one epoch' }))
    expect(text('epoch')).toBe('1')
    await user.click(screen.getByRole('button', { name: 'More: Neurons in layer 2' }))
    expect(text('epoch')).toBe('0')
    expect(screen.getByText(/Neurons in layer 2:/).textContent).toBe('Neurons in layer 2: 3')
    await user.click(screen.getByRole('button', { name: 'Fewer: Hidden layers' }))
    expect(screen.queryByText(/Neurons in layer 2:/)).toBeNull()
    await user.selectOptions(screen.getByLabelText('Activation'), 'relu')
    expect(text('epoch')).toBe('0')
  })

  it('a trained network answers for a new animal, and the answer follows the sliders', async () => {
    const user = renderLab()
    await user.click(screen.getByRole('button', { name: /^1\. One neuron/ }))
    const step = screen.getByRole('button', { name: 'Step one epoch' })
    for (let i = 0; i < 60; i++) await user.click(step)
    const size = screen.getByRole('slider', { name: 'size' })
    fireEvent.change(size, { target: { value: '0' } })
    expect(text('verdict')).toMatch(/^size 0, stripes 5 → output \+[01]\.\d\d, so the network says cat/)
    fireEvent.change(size, { target: { value: '10' } })
    expect(text('verdict')).toMatch(/^size 10, stripes 5 → output −[01]\.\d\d, so the network says tiger/)
  })

  it('shows each layer as a matrix and a bias', () => {
    renderLab()
    expect(screen.getByText(/Hidden layer 1: W is 4×2/)).toBeInTheDocument()
    expect(screen.getByText(/Hidden layer 2: W is 2×4/)).toBeInTheDocument()
    expect(screen.getByText(/Output layer: W is 1×2/)).toBeInTheDocument()
    expect(screen.getByLabelText('Layer 1 weights').textContent!.split('\n')).toHaveLength(4)
  })
})
