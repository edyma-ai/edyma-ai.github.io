/**
 * Whether a `$...$` body is real inline math rather than prose with dollar
 * amounts: the delimiters must hug the content (`$x$`, not `$ x$`), and a
 * body reading like an amount inside a sentence ("50 and 60" - starts with
 * a digit and contains whitespace) is currency, not an equation.
 */
function isInlineMathBody(body: string): boolean {
  if (body.length === 0) return false
  if (/^\s/.test(body) || /\s$/.test(body)) return false
  if (/^\d/.test(body) && /\s/.test(body)) return false
  return true
}

/**
 * Rewrites each inline-math `$...$` occurrence via `replace`; escaped `\$`
 * and currency-like pairs (see `isInlineMathBody`) stay verbatim.
 *
 * Semantically equivalent to the Flutter pattern
 * `(?<!\\)\$([^$\n]+?)(?<!\\)\$`, but implemented as an exec scan because
 * regex lookbehind needs Chrome 62+ and Babel cannot transpile it, which
 * would break the legacy bundle (Chrome >= 30 target).
 */
function rewriteInlineDollars(text: string, replace: (body: string) => string): string {
  const pattern = /\$([^$\n]+?)\$/g
  let result = ''
  let cursor = 0
  let match = pattern.exec(text)
  while (match !== null) {
    const body = match[1]
    const openEscaped = match.index > 0 && text.charAt(match.index - 1) === '\\'
    const closeEscaped = /\\$/.test(body)
    if (openEscaped || closeEscaped) {
      pattern.lastIndex = match.index + 1
    } else {
      result += text.slice(cursor, match.index)
      result += isInlineMathBody(body) ? replace(body) : match[0]
      cursor = pattern.lastIndex
    }
    match = pattern.exec(text)
  }
  return result + text.slice(cursor)
}

/**
 * Normalise inline `$...$` math to `\(...\)` so expressions adjacent to
 * punctuation or words render correctly, without garbling prose like
 * "costs \$50 and \$60". Mirrors `normalizeInlineMath` in
 * `edyma_flutter/lib/shared/widgets/markdown_defaults.dart` - keep both in sync.
 */
export function normalizeInlineMath(markdown: string): string {
  const displayBlocks: string[] = []

  let text = markdown.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    displayBlocks.push(match)
    return `__DISPLAY_MATH_${displayBlocks.length - 1}__`
  })

  text = rewriteInlineDollars(text, (body) => `\\(${body}\\)`)

  displayBlocks.forEach((block, index) => {
    // Replacer function so `$$` in the block is not parsed as a
    // replacement pattern (a bare string replacement would eat dollars).
    text = text.replace(`__DISPLAY_MATH_${index}__`, () => block)
  })

  return text
}

export function isS3Uri(uri: string): boolean {
  return uri.startsWith('s3://')
}

export function s3UriToKey(uri: string): string {
  const withoutScheme = uri.slice('s3://'.length)
  const slashIndex = withoutScheme.indexOf('/')
  if (slashIndex < 0) return withoutScheme
  return withoutScheme.slice(slashIndex + 1)
}

/**
 * Slug of an `![](interactive://<id>)` reference in chapter markdown, or null
 * for any other image source.
 */
export function interactiveSlug(src: string): string | null {
  if (!src.startsWith('interactive://')) return null
  return src.slice('interactive://'.length).replace(/\/+$/, '')
}
