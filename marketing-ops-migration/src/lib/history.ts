import { prisma } from "@/lib/prisma";
import type { HistoryAction, HistoryEntity, Prisma } from "@/generated/prisma/client";

interface LogHistoryInput {
  action: HistoryAction;
  entity: HistoryEntity;
  entityId: string;
  summary: string;
  userId: string;
  diff?: Record<string, unknown>;
}

/** Grava uma entrada de auditoria. Nunca inclua senha ou mfaSecret no diff. */
export async function logHistory({ action, entity, entityId, summary, userId, diff }: LogHistoryInput) {
  await prisma.historyLog.create({
    data: {
      action,
      entity,
      entityId,
      summary,
      userId,
      diff: diff as Prisma.InputJsonValue | undefined,
    },
  });
}

/** Retorna apenas os campos que mudaram entre duas versões planas de um registro. */
export function diffFields<T extends Record<string, unknown>>(before: T, after: Partial<T>): Record<string, { before: unknown; after: unknown }> {
  const changed: Record<string, { before: unknown; after: unknown }> = {};
  for (const key of Object.keys(after) as (keyof T)[]) {
    const beforeValue = before[key];
    const afterValue = after[key];
    if (beforeValue instanceof Date || afterValue instanceof Date) {
      if (String(beforeValue) !== String(afterValue)) {
        changed[key as string] = { before: beforeValue, after: afterValue };
      }
      continue;
    }
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changed[key as string] = { before: beforeValue, after: afterValue };
    }
  }
  return changed;
}
