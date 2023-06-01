/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Article = "article",
	ArticleMovements = "article_movements",
	ArticleTags = "article_tags",
	ArticleTagsRelations = "article_tags_relations",
	ArticleView = "article_view",
	Assemblies = "assemblies",
	AssembliesBuylists = "assemblies_buylists",
	AssembliesRelations = "assemblies_relations",
	FabricationOrders = "fabrication_orders",
	Orders = "orders",
	OrdersRows = "orders_rows",
	Projects = "projects",
	Stores = "stores",
	StoresRelations = "stores_relations",
	Suppliers = "suppliers",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type ArticleRecord = {
	name: string
	quantity?: number
	order_quantity?: number
	critical_quantity?: number
	supplier?: RecordIdString[]
	price?: number
	reference?: string
	manufacturer?: string
	attached_files?: string[]
	pinned_file?: string
	store?: RecordIdString
	consumable?: boolean
	unit?: string
	unit_quantity?: number
}

export type ArticleMovementsRecord = {
	article: RecordIdString
	user: RecordIdString
	quantity_update: number
	store_in?: RecordIdString
	store_out?: RecordIdString
	reason?: string
}

export type ArticleTagsRecord = {
	name: string
}

export type ArticleTagsRelationsRecord = {
	article: RecordIdString
	tag: RecordIdString
	value: string
}

export type ArticleViewRecord<Tstock_price = unknown> = {
	article?: RecordIdString
	stock_price?: null | Tstock_price
}

export type AssembliesRecord = {
	name: string
	description?: string
	favorite?: boolean
	pinned_file?: string
	thumbnail?: string
	attached_files?: string[]
	assembly_time?: number
}

export type AssembliesBuylistsRecord = {
	name: string
	assembly: RecordIdString
	project?: RecordIdString
	store: RecordIdString
	closed?: boolean
}

export type AssembliesRelationsRecord = {
	parent: RecordIdString
	assembly_child?: RecordIdString
	article_child?: RecordIdString
	quantity: number
}

export enum FabricationOrdersStateOptions {
	"asked" = "asked",
	"started" = "started",
	"completed" = "completed",
	"cancelled" = "cancelled",
}
export type FabricationOrdersRecord = {
	article: RecordIdString
	quantity: number
	applicant: RecordIdString
	receiver: RecordIdString
	start_date: IsoDateString
	end_date: IsoDateString
	state: FabricationOrdersStateOptions
	project?: RecordIdString
}

export enum OrdersStateOptions {
	"draft" = "draft",
	"placed" = "placed",
	"acknowledged" = "acknowledged",
	"completed" = "completed",
	"cancelled" = "cancelled",
}
export type OrdersRecord = {
	name: string
	supplier: RecordIdString
	issuer: RecordIdString
	state: OrdersStateOptions
	attached_files?: string[]
	vat?: number
	delivery_fees?: number
}

export type OrdersRowsRecord = {
	order: RecordIdString
	project?: RecordIdString
	article: RecordIdString
	quantity: number
	needed_date?: IsoDateString
	ack_date?: IsoDateString
	ack_price?: number
	quantity_received?: number
}

export type ProjectsRecord = {
	name: string
	customer?: string
	start_date?: IsoDateString
	end_date?: IsoDateString
	attached_users?: RecordIdString[]
	closed?: boolean
}

export type StoresRecord = {
	name: string
	location?: string
	temporary?: boolean
}

export type StoresRelationsRecord = {
	store: RecordIdString
	article: RecordIdString
	quantity?: number
}

export enum SuppliersPaymentRuleOptions {
	"order" = "order",
	"received" = "received",
	"30eom" = "30eom",
	"45eom" = "45eom",
	"60d" = "60d",
}
export type SuppliersRecord = {
	name: string
	internal?: boolean
	address?: string
	website?: string
	contact_email?: string
	payment_rules?: string
	thumbnail?: string
	payment_rule?: SuppliersPaymentRuleOptions
}

export type UsersRecord = {
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ArticleResponse<Texpand = unknown> = Required<ArticleRecord> & BaseSystemFields<Texpand>
export type ArticleMovementsResponse<Texpand = unknown> = Required<ArticleMovementsRecord> & BaseSystemFields<Texpand>
export type ArticleTagsResponse = Required<ArticleTagsRecord> & BaseSystemFields
export type ArticleTagsRelationsResponse<Texpand = unknown> = Required<ArticleTagsRelationsRecord> & BaseSystemFields<Texpand>
export type ArticleViewResponse<Tstock_price = unknown, Texpand = unknown> = Required<ArticleViewRecord<Tstock_price>> & BaseSystemFields<Texpand>
export type AssembliesResponse = Required<AssembliesRecord> & BaseSystemFields
export type AssembliesBuylistsResponse<Texpand = unknown> = Required<AssembliesBuylistsRecord> & BaseSystemFields<Texpand>
export type AssembliesRelationsResponse<Texpand = unknown> = Required<AssembliesRelationsRecord> & BaseSystemFields<Texpand>
export type FabricationOrdersResponse<Texpand = unknown> = Required<FabricationOrdersRecord> & BaseSystemFields<Texpand>
export type OrdersResponse<Texpand = unknown> = Required<OrdersRecord> & BaseSystemFields<Texpand>
export type OrdersRowsResponse<Texpand = unknown> = Required<OrdersRowsRecord> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type StoresResponse = Required<StoresRecord> & BaseSystemFields
export type StoresRelationsResponse<Texpand = unknown> = Required<StoresRelationsRecord> & BaseSystemFields<Texpand>
export type SuppliersResponse = Required<SuppliersRecord> & BaseSystemFields
export type UsersResponse = Required<UsersRecord> & AuthSystemFields

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	article: ArticleRecord
	article_movements: ArticleMovementsRecord
	article_tags: ArticleTagsRecord
	article_tags_relations: ArticleTagsRelationsRecord
	article_view: ArticleViewRecord
	assemblies: AssembliesRecord
	assemblies_buylists: AssembliesBuylistsRecord
	assemblies_relations: AssembliesRelationsRecord
	fabrication_orders: FabricationOrdersRecord
	orders: OrdersRecord
	orders_rows: OrdersRowsRecord
	projects: ProjectsRecord
	stores: StoresRecord
	stores_relations: StoresRelationsRecord
	suppliers: SuppliersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	article: ArticleResponse
	article_movements: ArticleMovementsResponse
	article_tags: ArticleTagsResponse
	article_tags_relations: ArticleTagsRelationsResponse
	article_view: ArticleViewResponse
	assemblies: AssembliesResponse
	assemblies_buylists: AssembliesBuylistsResponse
	assemblies_relations: AssembliesRelationsResponse
	fabrication_orders: FabricationOrdersResponse
	orders: OrdersResponse
	orders_rows: OrdersRowsResponse
	projects: ProjectsResponse
	stores: StoresResponse
	stores_relations: StoresRelationsResponse
	suppliers: SuppliersResponse
	users: UsersResponse
}