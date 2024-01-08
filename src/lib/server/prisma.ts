import { PrismaClient } from "@prisma/client";
import { SCMArticleExtension } from "$lib/dataValidation/SCM/SCMArticle";
import { CRMInterestValidator } from "$lib/dataValidation/CRM/CRMInterest";
import { SCMAssemblyExtension } from "$lib/dataValidation/SCM/SCMAssembly";

export const prisma = new PrismaClient()
    .$extends(SCMArticleExtension)
    .$extends(SCMAssemblyExtension)
    .$extends(CRMInterestValidator);

prisma.$connect();