import type { scm_assembly } from "@prisma/client";

export type SCMAssemblyTree = scm_assembly & { subAssemblies: SCMAssemblyTree[] };