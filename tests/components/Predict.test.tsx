import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Predict } from '../../src/components/Predict'

const options = [
  { id: 'a', label: 'Wrong answer', correct: false, explain: 'Because of misconception A.' },
  { id: 'b', label: 'Right answer', correct: true, explain: 'Because of reason B.' },
]

describe('Predict', () => {
  it('reveals nothing until the prediction is locked in', async () => {
    const onReveal = vi.fn()
    render(<Predict question="What happens?" options={options} onReveal={onReveal} />)

    const lock = screen.getByRole('button', { name: /lock in/i })
    expect(lock).toBeDisabled()

    await userEvent.click(screen.getByLabelText('Right answer'))
    expect(onReveal).not.toHaveBeenCalled()
    expect(screen.queryByText(/reason B/)).not.toBeInTheDocument()

    await userEvent.click(lock)
    expect(onReveal).toHaveBeenCalledOnce()
    expect(screen.getByText(/Correct/)).toBeInTheDocument()
    expect(screen.getByText(/reason B/)).toBeInTheDocument()
  })

  it('explains the specific misconception and allows a retry', async () => {
    const onRetry = vi.fn()
    render(<Predict question="What happens?" options={options} onRetry={onRetry} />)

    await userEvent.click(screen.getByLabelText('Wrong answer'))
    await userEvent.click(screen.getByRole('button', { name: /lock in/i }))
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
    expect(screen.getByText(/misconception A/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
    expect(screen.queryByText(/misconception A/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Wrong answer')).not.toBeChecked()
  })
})
