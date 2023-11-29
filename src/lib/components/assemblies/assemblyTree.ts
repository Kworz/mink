import type { SCMAssembly } from "@prisma/client";

export type SCMAssemblyTree = SCMAssembly & { subAssemblies: SCMAssemblyTree[] };