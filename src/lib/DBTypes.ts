/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Article = "article",
	List = "list",
	ListRow = "list_row",
	Nomenclature = "nomenclature",
	NomenclatureRow = "nomenclature_row",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string

// System fields
export type BaseSystemFields = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: { [key: string]: any }
}

export type AuthSystemFields = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields

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

export type ListRecord = {
	name: string
	parent_nomenclature: RecordIdString
}

export type ListRowRecord = {
	parent_list: RecordIdString
	parent_nomenclature_row: RecordIdString
	quantity: number
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

export type UsersRecord = Record<string, never>

// Response types include system fields and match responses from the PocketBase API
export type ArticleResponse = ArticleRecord & BaseSystemFields
export type ListResponse = ListRecord & BaseSystemFields
export type ListRowResponse = ListRowRecord & BaseSystemFields
export type NomenclatureResponse = NomenclatureRecord & BaseSystemFields
export type NomenclatureRowResponse = NomenclatureRowRecord & BaseSystemFields
export type UsersResponse = UsersRecord & AuthSystemFields

export type CollectionRecords = {
	article: ArticleRecord
	list: ListRecord
	list_row: ListRowRecord
	nomenclature: NomenclatureRecord
	nomenclature_row: NomenclatureRowRecord
	users: UsersRecord
}