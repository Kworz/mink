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
            store: {
                include: {
                    assemblies_buylist: true
                }
            }
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

export const computeArticlePrice = (orderRows: scm_articleWithIncludes["order_rows"]): number => {
    return orderRows.reduce((p, c) => p + (c.ack_price ?? 0) * c.needed_quantity, 0) / orderRows.reduce((p, c) => p + c.needed_quantity, 0);
}
