import type { user_group } from "@prisma/client";

export type GroupPermissions = keyof Omit<user_group, "admin" | "id" | "name">;
export const groupPermissions: Array<GroupPermissions> = ["scm", "article", "supplier", "store", "buylist", "assembly", "inbound_supplies", "fabrication_orders", "crm", "leads", "companies", "contacts", "interests", "finance", "orders", "invoices", "payments", "transactions"];