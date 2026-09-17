import Image from 'next/image'
import { pick } from '@/lib/content'
import type { ImageAsset, Locale } from '@/lib/content/types'

/** Photo (or initial) + name, role and an optional short bio. Used for team and facilitator listings. */
export function PersonCard({
  photo,
  name,
  role,
  bio,
  locale,
}: {
  photo?: ImageAsset
  name: string
  role: string
  bio?: string[]
  locale: Locale
}) {
  return (
    <li className="flex flex-col items-start gap-4">
      {photo ? (
        <Image
          src={photo.src}
          alt={pick(photo.alt, locale) || name}
          width={96}
          height={96}
          className="size-24 rounded-full border border-lijn object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-24 items-center justify-center rounded-full border border-lijn text-2xl font-semibold text-leisteen"
        >
          {name.charAt(0)}
        </span>
      )}
      <div>
        <p className="font-semibold text-inkt">{name}</p>
        <p className="text-base text-leisteen">{role}</p>
        {bio?.length ? (
          <div className="mt-3 space-y-2">
            {bio.map((paragraph, i) => (
              <p key={i} className="text-base text-inkt">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  )
}
