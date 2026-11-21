import { LessonHeader } from '../../components/LessonHeader'
import { Hero } from './Hero'
import { TableStep } from './TableStep'
import { CentresStep } from './CentresStep'
import { PredictStep } from './PredictStep'
import { UnderstandStep } from './UnderstandStep'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { PracticeStep } from './PracticeStep'

export function Lesson() {
  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="spam-filter">
        Take a table of eight emails and, using only averages, a subtraction and dot products, learn a line that
        tells spam from normal mail. By the end you will know what a linear classifier actually stores: one
        direction and one cut-off.
      </LessonHeader>
      <Hero />
      <TableStep />
      <CentresStep />
      <PredictStep />
      <UnderstandStep />
      <ApplyStep />
      <HouseExample />
      <PracticeStep />
    </article>
  )
}
