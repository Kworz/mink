import type { userWithIncludes } from "$lib/components/derived/user/user";
import type { user_group } from "@prisma/client";

export type GroupPermissions = keyof Omit<user_group, "admin" | "id" | "name">;
export const groupPermissions: Array<GroupPermissions> = ["scm", "article", "supplier", "store", "buylist", "assembly", "inbound_supply", "pm", "project", "manufacturing_order", "crm", "lead", "company", "contact", "interest", "accounting", "order", "invoice", "quotation", "transaction", "tools", "qr_code_scanner", "settings", "user", "user_group"];

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