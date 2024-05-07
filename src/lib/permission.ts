import type { userWithIncludes } from "$lib/components/derived/user/user";
import type { user_group } from "@prisma/client";

export type GroupPermissions = keyof Omit<user_group, "admin" | "id" | "name">;
export const groupPermissions: Array<GroupPermissions> = ["scm", "article", "supplier", "store", "buylist", "assembly", "inbound_supplies", "fabrication_orders", "crm", "leads", "companies", "contacts", "interests", "accounting", "orders", "invoices", "payments", "transactions", "tools", "qr_code_scanner"];

/**
 * Check if the given user has the needed permission to access the given path
 * @param user with its given group
 * @param path path you want to access
 * @param neededLevel needed permission level
 * @returns Can user access the ressource
 */
export const validatePermission = (user: userWithIncludes | null, path: GroupPermissions, neededLevel: "r" | "c" | "u" | "d"): boolean => {

    if(user === null) { console.error("User is not authenticated"); return false; }
    if(user.group === null) { console.error("User has no group assigned"); return false; }
    if(user.group.admin) { console.warn("User is admin, bypassing permission check"); return true; }

    const neededFieldPermission = user.group[path];

    if(neededFieldPermission === undefined || neededFieldPermission === null) { console.error("User's group does not have any permission in this path"); return false; }

    if(neededFieldPermission.includes(neededLevel)) return true; 

    console.error("Users group does not have enough permission to access this ressource");
    return false;

} 

/**
 * Gets if user can access specified route
 * @param routeId route you want to validate
 * @param user with its given group
 * @returns can user access the specified route
 */
export const validateRoute = (routeId: string, user: userWithIncludes | null): boolean => {

    // Theses routes are always enabled for any user
    const alwaysAccessibleRoutes = ["/", "/app/(base)", "/app/(base)/me", "/api/file/[...filePath]"];
    if(alwaysAccessibleRoutes.includes(routeId)) return true;

    if(routeId === "/app/(settings)/settings/mink") return user?.group?.admin || false;

    /** @todo Complete this list as each route is created */
    const associatedPermissionForRoute = {

        "/app/(scm)/scm": "scm",

        "/app/(scm)/scm/articles": "article",
        "/app/(scm)/scm/articles/print": "article",
        "/app/(scm)/scm/articles/export": "article",
        "/app/(scm)/scm/articles/import": "article",
        "/app/(scm)/scm/articles/[id]": "article",

        "/app/(scm)/scm/assemblies": "assembly",
        "/app/(scm)/scm/assemblies/[id]": "assembly",

        "/app/(scm)/scm/inbound_supplies": "inbound_supplies",
        "/app/(scm)/scm/lists": "buylist",
        "/app/(scm)/scm/manufacturing_orders": "manufacturing_orders",
        "/app/(scm)/scm/orders": "orders",
        "/app/(scm)/scm/suppliers": "supplier",

        "/app/(crm)/crm": "crm",

        "/app/(accounting)/accounting": "accounting",

        "/app/(settings)/settings": "settings",
        "/app/(settings)/settings/users": "users",
        "/app/(settings)/settings/users/[id]": "users",
        "/app/(settings)/settings/users_groups": "users_groups",
        "/app/(settings)/settings/users_groups/[id]": "users_groups",

        "/app/(tools)/tools": "tools",
        "/app/(tools)/tools/qr_scanner": "qr_code_scanner",
    
    };

    const route = Object.keys(associatedPermissionForRoute).find(apfr => routeId === apfr) as keyof typeof associatedPermissionForRoute | undefined;

    if(route === undefined) { throw new Error(`No permission associated with route ${routeId}`); } 

    // @ts-ignore
    const validation = validatePermission(user, associatedPermissionForRoute[route], "r");

    if(!validation) console.error(`User's group ${user?.group?.name || "—"} does not have enough permission to access ${routeId}`);

    return validation;

}