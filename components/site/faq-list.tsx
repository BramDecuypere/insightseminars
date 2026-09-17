import { Link2, Plus } from 'lucide-react'
import { pick, pickRich } from '@/lib/content'
import { slugify } from '@/lib/slug'
import type { Faq, Locale } from '@/lib/content/types'

/**
 * Accessible FAQ list built on native <details>/<summary> so it works without
 * JavaScript and stays a server component. Each item gets a stable id derived
 * from the Dutch question, so it can be deep-linked (#question-slug, §13.6).
 * The FaqHash client helper opens the matching item on navigation.
 */
export function FaqList({ faqs, locale }: { faqs: Faq[]; locale: Locale }) {
  return (
    <ul className="divide-y divide-lijn border-y border-lijn">
      {faqs.map((faq) => {
        const answer = pickRich(faq.answer, locale)
        const id = slugify(faq.question.nl)
        return (
          <li key={faq._id}>
            <details id={id} className="group scroll-mt-28">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="text-lg font-semibold text-inkt">{pick(faq.question, locale)}</span>
                <Plus
                  className="size-5 shrink-0 text-leisteen transition-transform group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <div className="-mt-1 space-y-3 pb-6">
                {answer.map((p, i) => (
                  <p key={i} className="type-body text-leisteen">
                    {p}
                  </p>
                ))}
                <a
                  href={`#${id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-leisteen underline underline-offset-4 hover:text-inkt"
                >
                  <Link2 className="size-4" aria-hidden />
                  {pick({ nl: 'Link naar deze vraag', en: 'Link to this question' }, locale)}
                </a>
              </div>
            </details>
          </li>
        )
      })}
    </ul>
  )
}
