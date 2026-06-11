import * as fs from 'fs'
import * as path from 'path'

const CATEGORY_ZONES: Record<string, string> = {
  lipstick:   'lips only',
  eyeshadow:  'eyelids only',
  eyeliner:   'eyeliner lines only',
  mascara:    'eyelashes only',
  blush:      'cheeks only',
  contour:    'face contour only',
  foundation: 'overall skin (change finish/texture only, preserve the original skin tone)',
}

const ALL_CATEGORIES = Object.keys(CATEGORY_ZONES)

export function buildMakeupPrompt(products: Array<{ category: string; description: string }>): string {
  const selectedCategories = new Set(products.map(p => p.category))
  const excluded = ALL_CATEGORIES.filter(c => !selectedCategories.has(c))

  const applyLines = products
    .map(p => `• ${p.description} (apply to ${CATEGORY_ZONES[p.category] ?? p.category})`)
    .join('\n')

  const doNotLines = excluded
    .map(c => `• Do NOT add or modify ${c}`)
    .join('\n')

  return `You are a professional makeup artist retouching a photo. Apply ONLY these specific products:\n${applyLines}\n\nStrict rules:\n${doNotLines}\n• Do NOT add concealer, primer, setting powder, highlighter, or any unlisted product\n• Keep ALL other facial features exactly as in the original photo\n• Keep the exact same framing, zoom, background, hair, and clothing\n• Photorealistic result`
}

export async function generateMakeup(
  imageUrl: string,
  prompt: string
): Promise<{ imageUrl: string; requestId: string }> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      imageUrl: 'https://picsum.photos/seed/makeup-result/800/1000',
      requestId: `mock-${Date.now()}`,
    }
  }

  const { default: OpenAI, toFile } = await import('openai')
  const client = new OpenAI({ apiKey })

  let imageFile: Awaited<ReturnType<typeof toFile>>

  if (imageUrl.startsWith('http')) {
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()
    imageFile = await toFile(Buffer.from(buffer), 'model.jpg', { type: 'image/jpeg' })
  } else {
    const localPath = path.join(process.cwd(), 'public', imageUrl)
    const buffer = fs.readFileSync(localPath)
    imageFile = await toFile(buffer, 'model.jpg', { type: 'image/jpeg' })
  }

  const result = await client.images.edit({
    model: 'gpt-image-1',
    image: imageFile,
    prompt,
    n: 1,
    size: '1024x1024',
  })

  const b64 = result.data?.[0]?.b64_json
  if (!b64) throw new Error('No image data returned from OpenAI')

  return {
    imageUrl: `data:image/png;base64,${b64}`,
    requestId: String(result.created),
  }
}
