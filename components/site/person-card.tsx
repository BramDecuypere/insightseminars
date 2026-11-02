import Image from 'next/image'
import { pick } from '@/lib/content'
import type { ImageAsset, Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

/**
 * Photo (or initial) + name, role and an optional short bio. Used for team and
 * facilitator listings. `portrait` shows a large headshot instead of an avatar.
 */
export function PersonCard({
  photo,
  name,
  role,
  bio,
  locale,
  photoSize = 'avatar',
}: {
  photo?: ImageAsset
  name: string
  role: string
  bio?: string[]
  locale: Locale
  photoSize?: 'avatar' | 'portrait'
}) {
  const portrait = photoSize === 'portrait'
  return (
    <li className="flex flex-col items-start gap-4">
      {photo && portrait ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-panel border border-lijn">
          <Image
            src={photo.src}
            alt={pick(photo.alt, locale) || name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : photo ? (
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
          className={cn(
            'flex items-center justify-center border border-lijn font-semibold text-leisteen',
            portrait ? 'aspect-[4/5] w-full rounded-panel bg-papier text-5xl' : 'size-24 rounded-full text-2xl',
          )}
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
