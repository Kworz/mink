import type { Prisma } from "@prisma/client"

export const articleIncludeQuery = {
    acticle_movements: {
        include: {
            user: true,
            store_in: true,
            store_out: true
        }
    },
    store_relations: {
        include: {
            store: true
        }
    },
    order_rows: {
        include: {
            order: {
                include: {
                    supplier: true
                }
            }
        },
        where: { order: { state: { notIn: ["closed", "cancelled", "quotation"] }}}
    },
    files: true
} satisfies Prisma.SCMArticleInclude;

export type SCMArticleWithIncludes = Prisma.SCMArticleGetPayload<{
    include: typeof articleIncludeQuery
}>;
