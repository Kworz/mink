import Prisma from "@prisma/client";
import { building } from "$app/environment";

export const prisma = new Prisma.PrismaClient();

// Do not connect to the database if we are building the app
if(!building)
    prisma.$connect();
