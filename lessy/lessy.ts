import type { BusGeniusRouteResponse } from "@origin/busgenius/types";
import { BusGenius, MountainLine } from "@origin/index";

export namespace Lessy {
    export interface Bus {
        id: string;
        lat: number;
		lon: number;
        passenger_count: number;
        capacity: number;
        last_updated: Date;
        heading_deg: number;
        speed_mph?: number;
    };

    function busgenius_bus_to_lessy_bus(bus: BusGeniusRouteResponse['buses'][0]): Bus {
        return {
            id: String(bus.id),
            lat: bus.lat,
            lon: bus.lng,
            passenger_count: bus.passenger_count,
            capacity: bus.capacity,
            last_updated: new Date(),
            heading_deg: bus.smoothed_heading,
        };
    }
    function mountain_line_bus_to_lessy_bus(bus: MountainLine.Bus): Bus {
        return {
            id: String(bus.id),
            lat: bus.lat,
            lon: bus.lon,
            passenger_count: bus.passengerLoad * bus.capacity,
            capacity: bus.capacity,
            last_updated: new Date(bus.lastUpdated),
            heading_deg: bus.headingDegrees,
            speed_mph: bus.speed
        };
    }

    export async function all_buses(): Promise<Bus[]> {
        const [busgenius_buses, mountain_line_buses] = await Promise.all([
            BusGenius.nau_live_routes(),
            MountainLine.nau_live_route()
        ]);
        const buses: Bus[] = [];
        if(!("error" in busgenius_buses)) buses.push(...busgenius_buses.buses.map(busgenius_bus_to_lessy_bus));
        if(!("error" in mountain_line_buses)) buses.push(...mountain_line_buses.map(mountain_line_bus_to_lessy_bus));
        return buses;
    }
}