import { Prisma } from "@prisma/client";
import { z } from "zod";

export const SCMArticleCreateInput = z.object({
    
    name: z.string(),
    brand: z.string()
    
}) satisfies z.Schema<Prisma.scm_articleCreateInput>;

export const SCMArticleExtension = Prisma.defineExtension((client) => {

    return client.$extends({
        name: "scm_article_extension",
        result: {
            scm_article: {
                price: {
                    async compute(article) {
                        const orderRows = await client.scm_order_rows.findMany({ where: { article_id: article.id, order: { state: { in: ["acknowledged", "completed"]}}, ack_price : { not: null }}});
                        return orderRows.reduce((acc, row) => acc + row.needed_quantity * (row.ack_price as number), 0) / orderRows.reduce((acc, row) => acc + row.needed_quantity, 0);
                    }
                }
            }
        },
        model: {
            scm_article: {
                create: ({ args, query }) => {
                    args.data = SCMArticleCreateInput.parse(args.data);
                    return query(args);
                },
                update: ({ args, query }) => {
                    args.data = SCMArticleCreateInput.partial().parse(args.data);
                    return query(args);
                },
                updateMany: ({ args, query }) => {
                    args.data = SCMArticleCreateInput.partial().parse(args.data);
                    return query(args);
                },
                upsert: ({ args, query }) => {
                    args.create = SCMArticleCreateInput.parse(args.create);
                    args.update = SCMArticleCreateInput.partial().parse(args.update);
                    return query(args);
                }
            }
        }
    });
});