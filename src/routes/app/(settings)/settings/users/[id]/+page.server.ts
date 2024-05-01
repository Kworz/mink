import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {

    const user = await locals.prisma.user.findUniqueOrThrow({ where: { id: params.id }, include: { group: true }});

    return { user };

}) satisfies PageServerLoad;