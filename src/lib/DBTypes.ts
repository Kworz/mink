/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Article = "article",
	ArticleMovements = "article_movements",
	List = "list",
	ListRow = "list_row",
	Nomenclature = "nomenclature",
	NomenclatureRow = "nomenclature_row",
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
	quantity: string
	price?: number
	reference?: string
	supplier?: string
	manufacturer?: string
	attached_files?: string[]
}

export type ArticleMovementsRecord = {
	article: RecordIdString
	quantity_update: number
	reason?: string
}

export type ListRecord = {
	name: string
	parent_nomenclature: RecordIdString
}

export type ListRowRecord = {
	parent_list: RecordIdString
	parent_nomenclature_row: RecordIdString
	quantity?: number
}

export type NomenclatureRecord = {
	name: string
	description?: string
}

export type NomenclatureRowRecord = {
	parent_nomenclature: RecordIdString
	child_article: RecordIdString
	quantity_required: number
	group?: string
}

export type UsersRecord = {

}

// Response types include system fields and match responses from the PocketBase API
export type ArticleResponse = ArticleRecord & BaseSystemFields
export type ArticleMovementsResponse<Texpand = unknown> = ArticleMovementsRecord & BaseSystemFields<Texpand>
export type ListResponse<Texpand = unknown> = ListRecord & BaseSystemFields<Texpand>
export type ListRowResponse<Texpand = unknown> = ListRowRecord & BaseSystemFields<Texpand>
export type NomenclatureResponse = NomenclatureRecord & BaseSystemFields
export type NomenclatureRowResponse<Texpand = unknown> = NomenclatureRowRecord & BaseSystemFields<Texpand>
export type UsersResponse = UsersRecord & AuthSystemFields

export type CollectionRecords = {
	article: ArticleRecord
	article_movements: ArticleMovementsRecord
	list: ListRecord
	list_row: ListRowRecord
	nomenclature: NomenclatureRecord
	nomenclature_row: NomenclatureRowRecord
	users: UsersRecord
}