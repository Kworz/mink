/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Article = "article",
	ArticleMovements = "article_movements",
	FabricationOrders = "fabrication_orders",
	List = "list",
	ListRow = "list_row",
	Nomenclature = "nomenclature",
	NomenclatureRow = "nomenclature_row",
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
	quantity_old?: string
	supplier?: RecordIdString
	supplier_old?: string
	price?: number
	reference?: string
	manufacturer?: string
	attached_files?: string[]
	pinned_file?: string
}

export type ArticleMovementsRecord = {
	article: RecordIdString
	user: RecordIdString
	quantity_update: number
	reason?: string
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

export type ProjectsRecord = {
	name: string
	start_date: IsoDateString
	end_date: IsoDateString
	attached_users?: RecordIdString[]
}

export type SuppliersRecord = {
	name: string
	internal?: boolean
	address: string
	website?: string
	contact_email?: string
}

export type UsersRecord = {

}

// Response types include system fields and match responses from the PocketBase API
export type ArticleResponse<Texpand = unknown> = ArticleRecord & BaseSystemFields<Texpand>
export type ArticleMovementsResponse<Texpand = unknown> = ArticleMovementsRecord & BaseSystemFields<Texpand>
export type FabricationOrdersResponse<Texpand = unknown> = FabricationOrdersRecord & BaseSystemFields<Texpand>
export type ListResponse<Texpand = unknown> = ListRecord & BaseSystemFields<Texpand>
export type ListRowResponse<Texpand = unknown> = ListRowRecord & BaseSystemFields<Texpand>
export type NomenclatureResponse<Texpand = unknown> = NomenclatureRecord & BaseSystemFields<Texpand>
export type NomenclatureRowResponse<Texpand = unknown> = NomenclatureRowRecord & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = ProjectsRecord & BaseSystemFields<Texpand>
export type SuppliersResponse = SuppliersRecord & BaseSystemFields
export type UsersResponse = UsersRecord & AuthSystemFields

export type CollectionRecords = {
	article: ArticleRecord
	article_movements: ArticleMovementsRecord
	fabrication_orders: FabricationOrdersRecord
	list: ListRecord
	list_row: ListRowRecord
	nomenclature: NomenclatureRecord
	nomenclature_row: NomenclatureRowRecord
	projects: ProjectsRecord
	suppliers: SuppliersRecord
	users: UsersRecord
}