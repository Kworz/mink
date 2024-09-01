import type { userWithIncludes } from "$lib/components/derived/user/user";
import { validatePermission, type GroupPermissions } from "$lib/permission";

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

        /// SCM Permission zone
        "/app/(scm)/scm": "scm",

        "/app/(scm)/scm/articles": "article",
        "/app/(scm)/scm/articles/print": "article",
        "/app/(scm)/scm/articles/export": "article",
        "/app/(scm)/scm/articles/import": "article",
        "/app/(scm)/scm/articles/[id]": "article",

        "/app/(scm)/scm/assemblies": "assembly",
        "/app/(scm)/scm/assemblies/[id]": "assembly",

        "/app/(scm)/scm/inbound_supplies": "inbound_supply",
        "/app/(scm)/scm/lists": "buylist",
        "/app/(scm)/scm/suppliers": "supplier",
        "/app/(scm)/scm/stores": "store",

        /// PROJECTS Permission zone
        "/app/(pm)/pm": "pm",

        "/app/(pm)/pm/projects": "project",
        "/app/(pm)/pm/projects/[id]": "project",

        "/app/(pm)/pm/manufacturing_orders": "manufacturing_order",
        "/app/(pm)/pm/manufacturing_orders/[id]": "manufacturing_order",

        /// CRM Permission zone
        "/app/(crm)/crm": "crm",

        /// ACCOUNTING Permission zone
        "/app/(accounting)/accounting": "accounting",
        "/app/(accounting)/accounting/orders": "order",
        "/app/(accounting)/accounting/orders/[id]": "order",
        "/app/(accounting)/accounting/orders/[id]/export": "order",

        "/app/(accounting)/accounting/invoices": "invoice",
        "/app/(accounting)/accounting/invoices/[id]": "invoice",

        "/app/(accounting)/accounting/transactions": "transaction",
        "/app/(accounting)/accounting/transactions/[id]": "transaction",

        /// SETTINGS Permission zone
        "/app/(settings)/settings": "settings",
        "/app/(settings)/settings/users": "user",
        "/app/(settings)/settings/users/[id]": "user",
        "/app/(settings)/settings/users_groups": "user_group",
        "/app/(settings)/settings/users_groups/[id]": "user_group",

        /// TOOLS Permission zone
        "/app/(tools)/tools": "tools",
        "/app/(tools)/tools/qr_scanner": "qr_code_scanner",
    
    } satisfies Record<string, GroupPermissions>;

    const route = Object.keys(associatedPermissionForRoute).find(apfr => routeId === apfr) as keyof typeof associatedPermissionForRoute | undefined;

    if(route === undefined) { throw new Error(`No permission associated with route ${routeId}`); } 

    const validation = validatePermission(user, associatedPermissionForRoute[route], "r");

    if(!validation) console.error(`User's group ${user?.group?.name || "—"} does not have enough permission to access ${routeId}`);

    return validation;

}