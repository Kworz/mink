import { permission } from '$lib/prisma-enums/index.js';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {

    const group = await locals.prisma.user_group.findUniqueOrThrow({ where: { id: params.id }, include: { users: true }});

    return { group };

});

export const actions = {

    updatePermission: async ({ locals, params, request }) => {

        if(locals.user!.group.admin !== true) return fail(403, { updatePermission: { error: "Forbidden" }});

        const form = await request.formData();

        const permissionKey = form.get("permission_key")?.toString();
        const permissionValue = form.get("permission_value")?.toString();

        if(permissionKey === undefined || permissionValue === undefined) return fail(400, { updatePermission: { error: "Missing permission key or value" }});
        if(![...Object.values(permission), ""].includes(permissionValue as permission)) return fail(400, { updatePermission: { error: "Invalid permission value" }});

        const group = await locals.prisma.user_group.update({
            where: { id: params.id },
            data: {
                [permissionKey]: permissionValue === "" ? null : permissionValue
            }
        });

        return { updatePermission: { success: true }};
    }
}