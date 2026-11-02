import { describe, expect, it } from 'vitest'
import { youtubeId } from './youtube'

describe('youtubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=Tp5vavPFlrE', 'Tp5vavPFlrE'],
    ['https://youtu.be/Tp5vavPFlrE?t=10', 'Tp5vavPFlrE'],
    ['https://www.youtube.com/embed/Tp5vavPFlrE', 'Tp5vavPFlrE'],
    ['https://www.youtube.com/shorts/Tp5vavPFlrE?feature=share', 'Tp5vavPFlrE'],
    ['https://www.youtube.com/shorts/6CTNTbduXcw', '6CTNTbduXcw'],
  ])('reads the id from %s', (url, id) => {
    expect(youtubeId(url)).toBe(id)
  })

  it('returns undefined for a link it does not recognise', () => {
    expect(youtubeId('https://vimeo.com/123456')).toBeUndefined()
  })
})
