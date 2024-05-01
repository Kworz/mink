import type { Prisma } from "@prisma/client";

export const userIncludeQuery = {
    group: true
} satisfies Prisma.userInclude;

export type userWithIncludes = Prisma.userGetPayload<{
    include: typeof userIncludeQuery
}>;