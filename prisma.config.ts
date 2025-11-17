import path from "node:path";
import { PrismaConfig } from "prisma/config";

export default {
    schema: path.join("prisma"),
} satisfies PrismaConfig;