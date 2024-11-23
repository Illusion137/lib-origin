export type JNovel_Toc = {
	no: number
	title: string
	uuid: string
	chapters: {
		no: number
		title: string
		uuid: string
		selected?: boolean
	}[]
}[]
export interface JNovel_Serie {
	legacy_id: string
	type: number
	title: string
	short_title: string
	original_title: string
	slug: string
	created: {
		seconds: number
		nanos: number
	}
	description: string
	short_description: string
	tags: string[]
	cover: {
		cover_url: string
		thumbnail_url: string
	}
	rentals: boolean
	ForumId: any
}
export interface JNovel_Part {
	legacy_id: string
	title: string
	slug: string
	number: number
	preview: boolean
	created: {
		seconds: number
		nanos: number
	}
	expiration: {
		seconds: number
	}
	launch: {
		seconds: number
	}
	cover: {
		cover_url: string
		thumbnail_url: string
	}
}