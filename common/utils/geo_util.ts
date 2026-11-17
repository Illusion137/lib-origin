export interface LatLon {
	lat: number;
	lon: number;
}

const EARTH_RADIUS_M = 6_371_000;
export const METERS_PER_MILE = 1609.344;

function to_radians(degrees: number) {
	return degrees * Math.PI / 180;
}
function to_degrees(radians: number) {
	return radians * 180 / Math.PI;
}

export function distance_m(a: LatLon, b: LatLon) {
	const d_lat = to_radians(b.lat - a.lat);
	const d_lon = to_radians(b.lon - a.lon);
	const h = Math.sin(d_lat / 2) ** 2 + Math.cos(to_radians(a.lat)) * Math.cos(to_radians(b.lat)) * Math.sin(d_lon / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing_deg(from: LatLon, to: LatLon) {
	const lat1 = to_radians(from.lat);
	const lat2 = to_radians(to.lat);
	const d_lon = to_radians(to.lon - from.lon);
	const y = Math.sin(d_lon) * Math.cos(lat2);
	const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(d_lon);
	return (to_degrees(Math.atan2(y, x)) + 360) % 360;
}

export function heading_difference_deg(a: number, b: number) {
	const diff = Math.abs(a - b) % 360;
	return diff > 180 ? 360 - diff : diff;
}

function interpolate(a: LatLon, b: LatLon, t: number): LatLon {
	return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
}

function segment_fraction(point: LatLon, a: LatLon, b: LatLon) {
	const scale = Math.cos(to_radians(point.lat));
	const dx = (b.lon - a.lon) * scale, dy = b.lat - a.lat;
	const length_sq = dx * dx + dy * dy;
	if (length_sq === 0) return 0;
	return Math.max(0, Math.min(1, ((point.lon - a.lon) * scale * dx + (point.lat - a.lat) * dy) / length_sq));
}

export interface PolylinePosition {
	distance_m: number;
	offset_m: number;
}

export function cumulative_lengths_m(path: LatLon[]) {
	const lengths = [0];
	for (let i = 1; i < path.length; i++) lengths.push(lengths[i - 1] + distance_m(path[i - 1], path[i]));
	return lengths;
}

export function project_onto_polyline(point: LatLon, path: LatLon[], cumulative_m: number[], heading?: number): PolylinePosition | undefined {
	let best: PolylinePosition | undefined;
	let best_aligned: PolylinePosition | undefined;
	for (let i = 1; i < path.length; i++) {
		const a = path[i - 1], b = path[i];
		const t = segment_fraction(point, a, b);
		const position = {
			distance_m: cumulative_m[i - 1] + t * (cumulative_m[i] - cumulative_m[i - 1]),
			offset_m: distance_m(point, interpolate(a, b, t))
		};
		if (best === undefined || position.offset_m < best.offset_m) best = position;
		const aligned = heading === undefined || heading_difference_deg(heading, bearing_deg(a, b)) <= 90;
		if (aligned && (best_aligned === undefined || position.offset_m < best_aligned.offset_m)) best_aligned = position;
	}
	return best_aligned ?? best;
}

export function point_along_polyline(path: LatLon[], cumulative_m: number[], distance: number): { point: LatLon; heading: number } {
	const total = cumulative_m[cumulative_m.length - 1];
	const target = Math.max(0, Math.min(total, distance));
	let i = 1;
	while (i < path.length - 1 && cumulative_m[i] < target) i++;
	const length = cumulative_m[i] - cumulative_m[i - 1];
	const t = length === 0 ? 0 : (target - cumulative_m[i - 1]) / length;
	return { point: interpolate(path[i - 1], path[i], t), heading: bearing_deg(path[i - 1], path[i]) };
}

export function decode_polyline(encoded: string, precision = 5): LatLon[] {
	const factor = 10 ** precision;
	const points: LatLon[] = [];
	let index = 0, lat = 0, lon = 0;
	const next_value = () => {
		let result = 0, shift = 0, byte: number;
		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);
		return result & 1 ? ~(result >> 1) : result >> 1;
	};
	while (index < encoded.length) {
		lat += next_value();
		lon += next_value();
		points.push({ lat: lat / factor, lon: lon / factor });
	}
	return points;
}
