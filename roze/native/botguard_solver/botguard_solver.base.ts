import type { WebPoSignalOutput } from 'bgutils-js/shared-types';
import type { Types } from 'youtubei.js';

export interface BotGuardWebPo {
	webPoSignalOutput: WebPoSignalOutput;
}

export type BotGuardSolver = Types.BotGuardSolver<Types.BotGuardSessionTokenBinding | Types.BotGuardLogBinding | BotGuardWebPo>;
