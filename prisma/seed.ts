import 'dotenv/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../app/generated/prisma/client'

const url = process.env.DATABASE_URL ?? 'file:dev.db'
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.generation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.model.deleteMany()

  await prisma.model.createMany({
    data: [
      { id: 'model-1', name: 'Aria', imageUrl: '/models/model-1.jpg', skinTone: 'fair', description: 'Fair skin, versatile look' },
      { id: 'model-2', name: 'Maya', imageUrl: '/models/model-2.jpg', skinTone: 'medium', description: 'Medium skin, warm undertones' },
      { id: 'model-3', name: 'Zara', imageUrl: '/models/model-3.jpg', skinTone: 'deep', description: 'Deep skin, cool undertones' },
    ],
  })

  await prisma.product.createMany({
    data: [
      { id: 'lip-1', name: 'Ruby Kiss', brand: 'MirrorLab', category: 'lipstick', colorHex: '#C41E3A', price: 28, promptDescription: 'bold ruby red satin lipstick, classic red lip' },
      { id: 'lip-2', name: 'Nude Velvet', brand: 'MirrorLab', category: 'lipstick', colorHex: '#C4956A', price: 26, promptDescription: 'soft nude beige matte lipstick, natural everyday lip color' },
      { id: 'lip-3', name: 'Berry Crush', brand: 'MirrorLab', category: 'lipstick', colorHex: '#8B1A4A', price: 28, promptDescription: 'deep berry plum glossy lipstick, rich jewel tone lip' },
      { id: 'lip-4', name: 'Coral Reef', brand: 'MirrorLab', category: 'lipstick', colorHex: '#FF6B6B', price: 26, promptDescription: 'vibrant coral orange-red lipstick, fresh summer lip color' },
      { id: 'lip-5', name: 'Rose Petal', brand: 'MirrorLab', category: 'lipstick', colorHex: '#E8A0B0', price: 24, promptDescription: 'delicate soft pink rose lipstick, feminine and romantic lip' },
      { id: 'eye-1', name: 'Smoky Noir', brand: 'MirrorLab', category: 'eyeshadow', colorHex: '#1C1C1E', price: 38, promptDescription: 'dramatic smoky black eyeshadow, intense dark smoky eye look' },
      { id: 'eye-2', name: 'Bronze Goddess', brand: 'MirrorLab', category: 'eyeshadow', colorHex: '#CD7F32', price: 36, promptDescription: 'warm bronze copper metallic eyeshadow, shimmery golden bronze eye' },
      { id: 'eye-3', name: 'Rose Gold Dream', brand: 'MirrorLab', category: 'eyeshadow', colorHex: '#B76E79', price: 36, promptDescription: 'rose gold pink shimmer eyeshadow, soft glowy romantic eye look' },
      { id: 'eye-4', name: 'Ocean Depth', brand: 'MirrorLab', category: 'eyeshadow', colorHex: '#1B4F72', price: 38, promptDescription: 'deep navy blue matte eyeshadow, dramatic navy blue eye look' },
      { id: 'eye-5', name: 'Earth & Stone', brand: 'MirrorLab', category: 'eyeshadow', colorHex: '#8B6914', price: 34, promptDescription: 'natural warm brown taupe eyeshadow, everyday neutral eye look' },
      { id: 'found-1', name: 'Porcelain Veil', brand: 'MirrorLab', category: 'foundation', colorHex: '#F5E6D3', price: 48, promptDescription: 'light porcelain foundation, flawless fair skin with natural finish' },
      { id: 'found-2', name: 'Golden Hour', brand: 'MirrorLab', category: 'foundation', colorHex: '#C68642', price: 48, promptDescription: 'medium golden beige foundation, warm natural skin with dewy finish' },
      { id: 'found-3', name: 'Mahogany Glow', brand: 'MirrorLab', category: 'foundation', colorHex: '#7B3F00', price: 48, promptDescription: 'deep rich mahogany foundation, luminous deep skin with satin finish' },
    ],
  })

  console.log('✓ Seed complete: 3 models, 5 lipsticks, 5 eyeshadows, 3 foundations')
}

main().catch(console.error).finally(() => prisma.$disconnect())
