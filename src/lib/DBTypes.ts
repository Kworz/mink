/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Article = "article",
	ArticleFabricationQuantity = "article_fabrication_quantity",
	ArticleMovements = "article_movements",
	ArticleOrderQuantity = "article_order_quantity",
	ArticlePrice = "article_price",
	ArticleStoreQuantity = "article_store_quantity",
	ArticleTags = "article_tags",
	ArticleTagsRelations = "article_tags_relations",
	Assemblies = "assemblies",
	AssembliesBuylists = "assemblies_buylists",
	AssembliesRelations = "assemblies_relations",
	CrmCompany = "crm_company",
	CrmCompanyContact = "crm_company_contact",
	CrmInterest = "crm_interest",
	CrmLeads = "crm_leads",
	CrmLeadsInterests = "crm_leads_interests",
	FabricationOrders = "fabrication_orders",
	Orders = "orders",
	OrdersRows = "orders_rows",
	OrdersTotalPrice = "orders_total_price",
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
	non_physical?: boolean
}

export type ArticleFabricationQuantityRecord<Tquantity = unknown> = {
	article?: RecordIdString
	quantity?: null | Tquantity
}

export type ArticleMovementsRecord = {
	article: RecordIdString
	user: RecordIdString
	quantity_update: number
	store_in?: RecordIdString
	store_out?: RecordIdString
	reason?: string
}

export type ArticleOrderQuantityRecord<Tquantity = unknown> = {
	article?: RecordIdString
	quantity?: null | Tquantity
}

export type ArticlePriceRecord<Tprice = unknown> = {
	article?: RecordIdString
	price?: null | Tprice
}

export type ArticleStoreQuantityRecord<Tquantity = unknown> = {
	article?: RecordIdString
	quantity?: null | Tquantity
}

export type ArticleTagsRecord = {
	name: string
}

export type ArticleTagsRelationsRecord = {
	article: RecordIdString
	tag: RecordIdString
	value: string
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

export enum CrmCompanySizeOptions {
	"0-5" = "0-5",
	"5-20" = "5-20",
	"20-50" = "20-50",
	"50-100" = "50-100",
	"100-250" = "100-250",
	"250-500" = "250-500",
	"500-1000" = "500-1000",
	"1000+" = "1000+",
}
export type CrmCompanyRecord = {
	name: string
	country?: string
	field?: string
	sector?: string
	type?: string
	size?: CrmCompanySizeOptions
}

export type CrmCompanyContactRecord = {
	name: string
	email?: string
	phone?: string
	address?: string
	spoken_langs?: string
	company: RecordIdString
	company_role?: string
}

export type CrmInterestRecord = {
	name: string
	description?: string
	color?: string
}

export enum CrmLeadsStateOptions {
	"prospect" = "prospect",
	"suspect" = "suspect",
	"active" = "active",
	"customer" = "customer",
	"lost" = "lost",
}
export type CrmLeadsRecord = {
	company: RecordIdString
	company_contacts: RecordIdString[]
	origin?: string
	comment?: string
	state?: CrmLeadsStateOptions
}

export type CrmLeadsInterestsRecord = {
	lead: RecordIdString
	interest: RecordIdString
	order?: number
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
	sub_id: string
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

export type OrdersTotalPriceRecord<Tgross_price = unknown, Tnet_price = unknown> = {
	order_ref?: RecordIdString
	gross_price?: null | Tgross_price
	net_price?: null | Tnet_price
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
export type ArticleFabricationQuantityResponse<Tquantity = unknown, Texpand = unknown> = Required<ArticleFabricationQuantityRecord<Tquantity>> & BaseSystemFields<Texpand>
export type ArticleMovementsResponse<Texpand = unknown> = Required<ArticleMovementsRecord> & BaseSystemFields<Texpand>
export type ArticleOrderQuantityResponse<Tquantity = unknown, Texpand = unknown> = Required<ArticleOrderQuantityRecord<Tquantity>> & BaseSystemFields<Texpand>
export type ArticlePriceResponse<Tprice = unknown, Texpand = unknown> = Required<ArticlePriceRecord<Tprice>> & BaseSystemFields<Texpand>
export type ArticleStoreQuantityResponse<Tquantity = unknown, Texpand = unknown> = Required<ArticleStoreQuantityRecord<Tquantity>> & BaseSystemFields<Texpand>
export type ArticleTagsResponse = Required<ArticleTagsRecord> & BaseSystemFields
export type ArticleTagsRelationsResponse<Texpand = unknown> = Required<ArticleTagsRelationsRecord> & BaseSystemFields<Texpand>
export type AssembliesResponse = Required<AssembliesRecord> & BaseSystemFields
export type AssembliesBuylistsResponse<Texpand = unknown> = Required<AssembliesBuylistsRecord> & BaseSystemFields<Texpand>
export type AssembliesRelationsResponse<Texpand = unknown> = Required<AssembliesRelationsRecord> & BaseSystemFields<Texpand>
export type CrmCompanyResponse = Required<CrmCompanyRecord> & BaseSystemFields
export type CrmCompanyContactResponse<Texpand = unknown> = Required<CrmCompanyContactRecord> & BaseSystemFields<Texpand>
export type CrmInterestResponse = Required<CrmInterestRecord> & BaseSystemFields
export type CrmLeadsResponse<Texpand = unknown> = Required<CrmLeadsRecord> & BaseSystemFields<Texpand>
export type CrmLeadsInterestsResponse<Texpand = unknown> = Required<CrmLeadsInterestsRecord> & BaseSystemFields<Texpand>
export type FabricationOrdersResponse<Texpand = unknown> = Required<FabricationOrdersRecord> & BaseSystemFields<Texpand>
export type OrdersResponse<Texpand = unknown> = Required<OrdersRecord> & BaseSystemFields<Texpand>
export type OrdersRowsResponse<Texpand = unknown> = Required<OrdersRowsRecord> & BaseSystemFields<Texpand>
export type OrdersTotalPriceResponse<Tgross_price = unknown, Tnet_price = unknown, Texpand = unknown> = Required<OrdersTotalPriceRecord<Tgross_price, Tnet_price>> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type StoresResponse = Required<StoresRecord> & BaseSystemFields
export type StoresRelationsResponse<Texpand = unknown> = Required<StoresRelationsRecord> & BaseSystemFields<Texpand>
export type SuppliersResponse = Required<SuppliersRecord> & BaseSystemFields
export type UsersResponse = Required<UsersRecord> & AuthSystemFields

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	article: ArticleRecord
	article_fabrication_quantity: ArticleFabricationQuantityRecord
	article_movements: ArticleMovementsRecord
	article_order_quantity: ArticleOrderQuantityRecord
	article_price: ArticlePriceRecord
	article_store_quantity: ArticleStoreQuantityRecord
	article_tags: ArticleTagsRecord
	article_tags_relations: ArticleTagsRelationsRecord
	assemblies: AssembliesRecord
	assemblies_buylists: AssembliesBuylistsRecord
	assemblies_relations: AssembliesRelationsRecord
	crm_company: CrmCompanyRecord
	crm_company_contact: CrmCompanyContactRecord
	crm_interest: CrmInterestRecord
	crm_leads: CrmLeadsRecord
	crm_leads_interests: CrmLeadsInterestsRecord
	fabrication_orders: FabricationOrdersRecord
	orders: OrdersRecord
	orders_rows: OrdersRowsRecord
	orders_total_price: OrdersTotalPriceRecord
	projects: ProjectsRecord
	stores: StoresRecord
	stores_relations: StoresRelationsRecord
	suppliers: SuppliersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	article: ArticleResponse
	article_fabrication_quantity: ArticleFabricationQuantityResponse
	article_movements: ArticleMovementsResponse
	article_order_quantity: ArticleOrderQuantityResponse
	article_price: ArticlePriceResponse
	article_store_quantity: ArticleStoreQuantityResponse
	article_tags: ArticleTagsResponse
	article_tags_relations: ArticleTagsRelationsResponse
	assemblies: AssembliesResponse
	assemblies_buylists: AssembliesBuylistsResponse
	assemblies_relations: AssembliesRelationsResponse
	crm_company: CrmCompanyResponse
	crm_company_contact: CrmCompanyContactResponse
	crm_interest: CrmInterestResponse
	crm_leads: CrmLeadsResponse
	crm_leads_interests: CrmLeadsInterestsResponse
	fabrication_orders: FabricationOrdersResponse
	orders: OrdersResponse
	orders_rows: OrdersRowsResponse
	orders_total_price: OrdersTotalPriceResponse
	projects: ProjectsResponse
	stores: StoresResponse
	stores_relations: StoresRelationsResponse
	suppliers: SuppliersResponse
	users: UsersResponse
}