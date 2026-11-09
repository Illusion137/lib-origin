import rozfetch from '@common/rozfetch';

export namespace MountainLine {
	const NAU_PATH = 'routes/6269/vehicles';

	export interface Bus {
		patternId: number;
		capacity: number;
		id: number;
		lat: number;
		lon: number;
		name: string;
		passengerLoad: number;
		lastUpdated: string;
		heading: string;
		speed: number;
		headingDegrees: number;
		shapeDistanceTraveled: number;
	}
	export async function live_route(path: string) {
		const buses_response = await rozfetch<Bus[]>(`https://mountainline.syncromatics.com/api/rtpi?path=${path}`);
		if ('error' in buses_response) return buses_response;
		const buses = await buses_response.json();
		return buses;
	}
	export async function nau_live_route() {
		return await live_route(NAU_PATH);
	}
}
