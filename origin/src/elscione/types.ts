export interface ViewItems {
	items: Item[];
}

export interface Item {
	href: string;
	time: number;
	size?: number;
	managed?: boolean;
	fetched?: boolean;
}