import { groupPermissions } from './../permissions';
import type { userWithIncludes } from "$lib/components/derived/user/user";
import type { permission } from "@prisma/client";

export const validatePermission = (user: userWithIncludes, path: keyof typeof groupPermissions, neededLevel: keyof typeof permission): boolean => {

    if(user.group === null) { console.error("User has no group assigned"); return false; }

    if(user.group.admin) { console.warn("User is admin, bypassing permission check"); return true; }

    // @ts-ignore WARN: fuck typescript
    const neededFieldPermission = user.group[path];

    if(neededFieldPermission === null) { console.error("User's group does not have any permission in this path"); return false; }

    if(neededFieldPermission.includes(neededLevel)) return true; 

    console.error("Users group does not have enough permission to access this ressource");
    return false;

} 

export const validateRoute = (routeId: string, user: userWithIncludes): boolean => {

    if(routeId === "/app/(base)") return true;
    if(routeId === "/api/file/[...filePath]") return true;

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
    
    };

    const route = Object.keys(associatedPermissionForRoute).find(apfr => routeId === apfr);

    console.log(route);

    if(route === undefined) throw new Error(`No permission associated with route ${routeId}`);

    const validation = validatePermission(user, associatedPermissionForRoute[route], "r");

    if(!validation) console.error(`User's group ${user.group?.name} does not have enough permission to access ${routeId}`);

    return validation;

}