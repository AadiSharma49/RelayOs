# RelayOS — Database Reference

## PostgreSQL Schema (Prisma)

### User
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String
  firstName String?
  lastName  String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspaces      Workspace[]
  conversations   Conversation[]
  decisions       Decision[]
  actionItems     ActionItem[]
  questions       Question[]
}
```

### Workspace
```prisma
model Workspace {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversations Conversation[]
}
```

### Conversation
```prisma
model Conversation {
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  title       String?
  content     String   // Raw conversation text
  source      String?  // e.g. "chatgpt", "claude"
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  decisions   Decision[]
  actionItems ActionItem[]
  questions   Question[]
}
```

### Decision
```prisma
model Decision {
  id           String   @id @default(cuid())
  userId       String
  workspaceId  String
  conversationId String?
  title        String
  summary      String
  status       String  // pending | accepted | rejected | deferred
  confidence   Float
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace     Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  conversation  Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)
  actionItems   ActionItem[]
  questions     Question[]
}
```

### ActionItem
```prisma
model ActionItem {
  id           String   @id @default(cuid())
  userId       String
  workspaceId  String
  conversationId String?
  title        String
  description  String?
  priority     String  // low | medium | high
  status       String? // pending | completed
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace     Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  conversation  Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)
  decision      Decision?     @relation(fields: [decisionId], references: [id], onDelete: SetNull)
  decisionId    String?
}
```

### Question
```prisma
model Question {
  id           String   @id @default(cuid())
  userId       String
  workspaceId  String
  conversationId String?
  question     String
  status       String?  // open | answered | dismissed
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace     Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  conversation  Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)
}
```

---

## Relationships

```
User 1──* Workspace
Workspace 1──* Conversation
Conversation *──* Decision
Conversation *──* ActionItem
Conversation *──* Question
```

- All foreign keys include `onDelete: Cascade` from user
- `conversationId` uses `SetNull` so conversations can be deleted without losing extracted items

---

## Indexes

- `User.clerkId` — unique (lookup by Clerk ID)
- All models include `userId` for ownership scoping
- `createdAt` on all models for ordering

---

## Migrations

Prisma migrations stored in `prisma/migrations/` (gitignored in production).

To apply schema changes:
```bash
npx prisma db push