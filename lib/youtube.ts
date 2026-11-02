/**
 * The 11-character video id from a YouTube link: watch (?v=), youtu.be,
 * embed and Shorts URLs. Undefined when the link isn't recognised.
 */
export function youtubeId(url: string): string | undefined {
  return url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1]
}
