import { z } from "zod";
import { Prisma } from "@prisma/client";

export const CRMInterestCreateInput = z.object({
    
    name: z.string(),
    description: z.string(),
    color: z.string(),

    created: z.date(),
    updated: z.date(),

}) satisfies z.Schema<Prisma.crm_interestCreateInput>;

export const CRMInterestValidator = Prisma.defineExtension({

    name: "crm_interest_extension",
    model: {
        crm_interest: {
            create: ({ args, query }) => {
                args.data = CRMInterestCreateInput.parse(args.data);
                return query(args);
            },
            update: ({ args, query }) => {
                args.data = CRMInterestCreateInput.partial().parse(args.data);
                return query(args);
            },
            updateMany: ({ args, query }) => {
                args.data = CRMInterestCreateInput.partial().parse(args.data);
                return query(args);
            },
            upsert: ({ args, query }) => {
                args.create = CRMInterestCreateInput.parse(args.create);
                args.update = CRMInterestCreateInput.partial().parse(args.update);
                return query(args);
            }
        }
    }
});