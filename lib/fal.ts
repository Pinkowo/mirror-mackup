export function buildMakeupPrompt(productDescriptions: string[]): string {
  const makeupList = productDescriptions.join(', ')
  return `Professional beauty portrait of a model wearing ${makeupList}. High-end cosmetics photography, studio lighting, sharp focus, photorealistic, 8k quality.`
}

export async function generateMakeup(
  imageUrl: string,
  prompt: string
): Promise<{ imageUrl: string; requestId: string }> {
  const apiKey = process.env.FAL_KEY

  if (!apiKey || apiKey === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      imageUrl: 'https://picsum.photos/seed/makeup-result/800/1000',
      requestId: `mock-${Date.now()}`,
    }
  }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: apiKey })

  const result = await fal.subscribe('fal-ai/image-editing/realism', {
    input: {
      image_url: imageUrl,
      prompt,
      negative_prompt: 'cartoon, illustration, deformed, unrealistic skin, bad makeup, blurry',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any,
  })

  return {
    imageUrl: (result.data as { images: { url: string }[] }).images[0].url,
    requestId: result.requestId,
  }
}
