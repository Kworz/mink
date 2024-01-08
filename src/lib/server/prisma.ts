import { PrismaClient } from "@prisma/client";
import { SCMArticleExtension } from "$lib/dataValidation/SCM/SCMArticle";
import { CRMInterestValidator } from "$lib/dataValidation/CRM/CRMInterest";

export const prisma = new PrismaClient()
    .$extends(SCMArticleExtension)
    .$extends(CRMInterestValidator);

prisma.$connect();