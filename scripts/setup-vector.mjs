/**
 * One-time setup for semantic search.
 * Enables pgvector, adds Decision.embedding, and creates a cosine HNSW index.
 * Idempotent — safe to re-run. Usage: node scripts/setup-vector.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

try {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`)
  console.log("✓ pgvector extension enabled")

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Decision" ADD COLUMN IF NOT EXISTS embedding vector(768)`
  )
  console.log("✓ Decision.embedding column ready")

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS decision_embedding_idx ON "Decision" USING hnsw (embedding vector_cosine_ops)`
  )
  console.log("✓ HNSW cosine index ready")

  console.log("\nSemantic search infrastructure is ready.")
} catch (e) {
  console.error("Setup error:", e instanceof Error ? e.message : e)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
