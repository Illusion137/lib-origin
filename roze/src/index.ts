import type Roz from "./types/roz";
import type { SomeRoz } from "./types/roz-old";

export function upgrade_roz_version(roz: SomeRoz): Roz{
	switch(roz.version){
		case 1: return roz;
		default: return roz;
	}
}