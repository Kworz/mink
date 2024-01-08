import { z } from "zod";
import  { Prisma } from "@prisma/client";

export const SCMArticleCreateInput = z.object({
    
    name: z.string(),
    brand: z.string()
    
}) satisfies z.Schema<Prisma.scm_articleCreateInput>;

export const SCMArticleExtension = Prisma.defineExtension({
    name: "scm_article_extension",
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