export interface ResolvedStation {
	urn: string;
	query_urn: any;
	permalink: string;
	permalink_url: string;
	title: string;
	description: string;
	short_title: string;
	short_description: string;
	tracking_feature_name: string;
	playlist_type: string;
	last_updated: any;
	artwork_url: string;
	calculated_artwork_url: string;
	likes_count: number;
	seed: Seed;
	tracks: Track[];
	is_public: boolean;
	made_for: any;
	user: User;
	kind: string;
	id: string;
}

export interface Seed {
	urn: string;
	permalink: string;
}

export interface Track {
	id: number;
	kind: string;
	monetization_model: string;
	policy: string;
}

export interface User {
	avatar_url: string;
	first_name: string;
	followers_count: number;
	full_name: string;
	id: number;
	kind: string;
	last_modified: string;
	last_name: string;
	permalink: string;
	permalink_url: string;
	uri: string;
	urn: string;
	username: string;
	verified: boolean;
	city: string;
	country_code: string;
	badges: Badges;
	station_urn: string;
	station_permalink: string;
}

export interface Badges {
	pro: boolean;
	creator_mid_tier: boolean;
	pro_unlimited: boolean;
	verified: boolean;
}
