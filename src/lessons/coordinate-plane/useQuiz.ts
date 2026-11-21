import { useState } from 'react'
import type { Vec2 } from '../../linalg'
import { QUIZ, diagnose } from './quiz'
import type { Verdict } from './quiz'

/** State of the read-and-plot quiz: which question, the placed point, the verdict, the score. */
export function useQuiz() {
  const [index, setIndex] = useState(0)
  const [placed, setPlaced] = useState<Vec2>([0, 0])
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [given, setGiven] = useState<Vec2 | null>(null)
  const [score, setScore] = useState(0)
  const finished = index >= QUIZ.length
  const q = QUIZ[Math.min(index, QUIZ.length - 1)]

  const answer = (p: Vec2) => {
    if (verdict || finished) return
    const v = diagnose(q, p)
    setGiven(p)
    setVerdict(v)
    if (v.correct) setScore((s) => s + 1)
  }
  const next = () => {
    setIndex((i) => i + 1)
    setPlaced([0, 0])
    setVerdict(null)
    setGiven(null)
  }
  const restart = () => {
    setIndex(0)
    setPlaced([0, 0])
    setVerdict(null)
    setGiven(null)
    setScore(0)
  }
  const place = (p: Vec2) => {
    if (!verdict) setPlaced([p[0] + 0, p[1] + 0])
  }
  return { index, q, placed, place, verdict, given, score, finished, answer, next, restart, total: QUIZ.length }
}

export type QuizState = ReturnType<typeof useQuiz>
