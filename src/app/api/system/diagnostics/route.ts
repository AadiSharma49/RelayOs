import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type DiagnosticResult = {
  status: "ok" | "error"
  message?: string
}

type DiagnosticsResponse = {
  database: DiagnosticResult & { info?: string }
  tables: {
    User: DiagnosticResult
    Workspace: DiagnosticResult
    Conversation: DiagnosticResult
    Decision: DiagnosticResult
  }
  timestamp: string
}

export async function GET() {
  const diagnostics: DiagnosticsResponse = {
    database: { status: "ok" },
    tables: {
      User: { status: "ok" },
      Workspace: { status: "ok" },
      Conversation: { status: "ok" },
      Decision: { status: "ok" },
    },
    timestamp: new Date().toISOString(),
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    diagnostics.database.info = "Connected to PostgreSQL"
  } catch (error) {
    diagnostics.database.status = "error"
    diagnostics.database.message =
      error instanceof Error ? error.message : "Unknown database error"
    return NextResponse.json(diagnostics, { status: 503 })
  }

  // Check each table exists
  const tables = ["User", "Workspace", "Conversation", "Decision"] as const
  for (const table of tables) {
    try {
      // Try to count rows — will throw if table doesn't exist
      await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) FROM "${table}" LIMIT 1`
      )
      diagnostics.tables[table] = { status: "ok" }
    } catch (error) {
      diagnostics.tables[table] = {
        status: "error",
        message: `Table "${table}" does not exist. Run \`npx prisma db push\` to create it.`,
      }
      diagnostics.database.status = "error"
    }
  }

  const httpStatus =
    diagnostics.database.status === "error" ? 503 : 200
  return NextResponse.json(diagnostics, { status: httpStatus })
}