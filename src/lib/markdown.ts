/**
 * Normalise inline `$...$` math to `\(...\)` so expressions adjacent to
 * punctuation render correctly (matches the Flutter AppMarkdownBody fix).
 */
export function normalizeInlineMath(markdown: string): string {
  const displayBlocks: string[] = []

  let text = markdown.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    displayBlocks.push(match)
    return `__DISPLAY_MATH_${displayBlocks.length - 1}__`
  })

  text = text.replace(/\$([^$\n]+?)\$/g, (_, expr) => `\\(${expr}\\)`)

  displayBlocks.forEach((block, index) => {
    text = text.replace(`__DISPLAY_MATH_${index}__`, block)
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
