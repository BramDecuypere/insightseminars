/** Renders one or more schema.org objects as a JSON-LD script (brief §10). */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data]
  return (
    <script
      type="application/ld+json"
      // Structured data is static, server-rendered JSON — safe to inline.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  )
}
