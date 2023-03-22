/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Article = "article",
	ArticleMovements = "article_movements",
	ArticlePricepoint = "article_pricepoint",
	ArticleStores = "article_stores",
	ArticleView = "article_view",
	Assemblies = "assemblies",
	AssembliesRelations = "assemblies_relations",
	Build = "build",
	BuildRow = "build_row",
	FabricationOrders = "fabrication_orders",
	List = "list",
	ListRow = "list_row",
	Nomenclature = "nomenclature",
	NomenclatureRow = "nomenclature_row",
	Orders = "orders",
	OrdersRows = "orders_rows",
	Projects = "projects",
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
	supplier?: RecordIdString[]
	price?: number
	reference?: string
	manufacturer?: string
	attached_files?: string[]
	pinned_file?: string
	label?: boolean
	store?: RecordIdString
}

export type ArticleMovementsRecord = {
	article: RecordIdString
	user: RecordIdString
	quantity_update: number
	reason?: string
}

export type ArticlePricepointRecord = {
	article: RecordIdString
	supplier: RecordIdString
	price?: number
}

export type ArticleStoresRecord = {
	name: string
	location?: string
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
	attached_files?: string[]
}

export type AssembliesRelationsRecord = {
	parent: RecordIdString
	assembly_child?: RecordIdString
	article_child?: RecordIdString
	quantity: number
}

export type BuildRecord = {
	name: string
	project?: RecordIdString
	parent_nomenclature: RecordIdString
	parent_list: RecordIdString
}

export type BuildRowRecord = {
	build: RecordIdString
	parent_nomenclature_row: RecordIdString
	group?: string
	assembled?: boolean
}

export type FabricationOrdersRecord = {
	article: RecordIdString
	quantity: number
	applicant: RecordIdString
	receiver: RecordIdString
	project?: RecordIdString
	start_date: IsoDateString
	end_date: IsoDateString
}

export type ListRecord = {
	name: string
	parent_nomenclature: RecordIdString
	project?: RecordIdString
}

export type ListRowRecord = {
	parent_list: RecordIdString
	parent_nomenclature_row: RecordIdString
	quantity?: number
}

export type NomenclatureRecord = {
	name: string
	description?: string
	created_by?: RecordIdString
}

export type NomenclatureRowRecord = {
	parent_nomenclature: RecordIdString
	child_article: RecordIdString
	quantity_required: number
	group?: string
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
	start_date: IsoDateString
	end_date: IsoDateString
	attached_users?: RecordIdString[]
}

export type SuppliersRecord = {
	name: string
	internal?: boolean
	address?: string
	website?: string
	contact_email?: string
	payment_rules?: string
	thumbnail?: string
}

export type UsersRecord = {

}

// Response types include system fields and match responses from the PocketBase API
export type ArticleResponse<Texpand = unknown> = ArticleRecord & BaseSystemFields<Texpand>
export type ArticleMovementsResponse<Texpand = unknown> = ArticleMovementsRecord & BaseSystemFields<Texpand>
export type ArticlePricepointResponse<Texpand = unknown> = ArticlePricepointRecord & BaseSystemFields<Texpand>
export type ArticleStoresResponse = ArticleStoresRecord & BaseSystemFields
export type ArticleViewResponse<Tstock_price = unknown, Texpand = unknown> = ArticleViewRecord<Tstock_price> & BaseSystemFields<Texpand>
export type AssembliesResponse = AssembliesRecord & BaseSystemFields
export type AssembliesRelationsResponse<Texpand = unknown> = AssembliesRelationsRecord & BaseSystemFields<Texpand>
export type BuildResponse<Texpand = unknown> = BuildRecord & BaseSystemFields<Texpand>
export type BuildRowResponse<Texpand = unknown> = BuildRowRecord & BaseSystemFields<Texpand>
export type FabricationOrdersResponse<Texpand = unknown> = FabricationOrdersRecord & BaseSystemFields<Texpand>
export type ListResponse<Texpand = unknown> = ListRecord & BaseSystemFields<Texpand>
export type ListRowResponse<Texpand = unknown> = ListRowRecord & BaseSystemFields<Texpand>
export type NomenclatureResponse<Texpand = unknown> = NomenclatureRecord & BaseSystemFields<Texpand>
export type NomenclatureRowResponse<Texpand = unknown> = NomenclatureRowRecord & BaseSystemFields<Texpand>
export type OrdersResponse<Texpand = unknown> = OrdersRecord & BaseSystemFields<Texpand>
export type OrdersRowsResponse<Texpand = unknown> = OrdersRowsRecord & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = ProjectsRecord & BaseSystemFields<Texpand>
export type SuppliersResponse = SuppliersRecord & BaseSystemFields
export type UsersResponse = UsersRecord & AuthSystemFields

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	article: ArticleRecord
	article_movements: ArticleMovementsRecord
	article_pricepoint: ArticlePricepointRecord
	article_stores: ArticleStoresRecord
	article_view: ArticleViewRecord
	assemblies: AssembliesRecord
	assemblies_relations: AssembliesRelationsRecord
	build: BuildRecord
	build_row: BuildRowRecord
	fabrication_orders: FabricationOrdersRecord
	list: ListRecord
	list_row: ListRowRecord
	nomenclature: NomenclatureRecord
	nomenclature_row: NomenclatureRowRecord
	orders: OrdersRecord
	orders_rows: OrdersRowsRecord
	projects: ProjectsRecord
	suppliers: SuppliersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	article: ArticleResponse
	article_movements: ArticleMovementsResponse
	article_pricepoint: ArticlePricepointResponse
	article_stores: ArticleStoresResponse
	article_view: ArticleViewResponse
	assemblies: AssembliesResponse
	assemblies_relations: AssembliesRelationsResponse
	build: BuildResponse
	build_row: BuildRowResponse
	fabrication_orders: FabricationOrdersResponse
	list: ListResponse
	list_row: ListRowResponse
	nomenclature: NomenclatureResponse
	nomenclature_row: NomenclatureRowResponse
	orders: OrdersResponse
	orders_rows: OrdersRowsResponse
	projects: ProjectsResponse
	suppliers: SuppliersResponse
	users: UsersResponse
}