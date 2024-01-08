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
        where: { order: { state: { in: ["completed", "acknowledged"] }}}
    },
    files: true
} satisfies Prisma.scm_articleInclude;

export type scm_articleWithIncludes = Prisma.scm_articleGetPayload<{
    include: typeof articleIncludeQuery
}>;
