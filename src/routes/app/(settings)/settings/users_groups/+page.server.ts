export const load = (async ({ locals }) => {

    const groups = await locals.prisma.user_group.findMany({ include: { users: true }});

    return { groups };

});