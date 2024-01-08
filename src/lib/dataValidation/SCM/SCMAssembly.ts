import { Prisma } from "@prisma/client";
import { z } from "zod";

export const SCMAssemblyCreateInput = z.object({

    name: z.string(),

}) satisfies z.Schema<Prisma.scm_assemblyCreateInput>;

export const SCMAssemblyExtension = Prisma.defineExtension({

    name: "scm_assembly_extension",

    model: {
        scm_assembly: {
            create: ({ args, query }) => {

                args.data = SCMAssemblyCreateInput.parse(args.data);
                return query(args);
            },
            update: ({ args, query }) => {

                args.data = SCMAssemblyCreateInput.partial().parse(args.data);
                return query(args);
            },
            updateMany: ({ args, query }) => {

                args.data = SCMAssemblyCreateInput.partial().parse(args.data);
                return query(args);
            },
            upsert: ({ args, query }) => {

                args.create = SCMAssemblyCreateInput.parse(args.create);
                args.update = SCMAssemblyCreateInput.partial().parse(args.update);
                return query(args);
            }
        }
    }
});
