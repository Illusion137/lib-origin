import type { BotGuardSolver } from '@native/botguard_solver/botguard_solver.base.ts';
import { get_native_platform } from '@native/native_mode';

let botguard_solver_instance: BotGuardSolver;

export async function load_native_botguard(): Promise<BotGuardSolver> {
	if (botguard_solver_instance) return botguard_solver_instance;
	switch (get_native_platform()) {
		case 'WEB':
			console.error('Web Native BotGuard is NOT implemented');
			break;
		case 'NODE':
			try {
				botguard_solver_instance = (await import('./botguard_solver.node.ts')).node_botguard_solver;
			} catch (e) { console.error(e); }
			break;
		case 'REACT_NATIVE':
			try {
				botguard_solver_instance = (await import('./botguard_solver.mobile.ts')).mobile_botguard_solver;
			} catch (e) { console.error(e); }
			break;
	}
	return botguard_solver_instance;
}

export function botguard_solver(): BotGuardSolver {
	if (botguard_solver_instance) return botguard_solver_instance;
	console.error(new Error('Native Module [botguard/BotGuard] is NOT loaded'));
	return botguard_solver_instance;
}
