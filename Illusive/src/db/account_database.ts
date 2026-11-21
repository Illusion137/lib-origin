import { Prefs } from '@illusive/prefs';
import { account_db_path, default_db_path } from './database';

/**
 * Which database file belongs to which account. The first account to sign in keeps everything already on the
 * device (the default file); signing out keeps it all, and any other account gets a file of its own.
 */
export namespace AccountDatabase {
	export interface Plan {
		file: string;
		/** The account becomes the owner of the default file */
		claim: boolean;
	}

	export function plan(owner: string, user_id: string): Plan {
		if (owner === '') return { file: default_db_path, claim: true };
		return { file: owner === user_id ? default_db_path : account_db_path(user_id), claim: false };
	}

	export function for_account(user_id: string): Plan {
		return plan(Prefs.get_pref('illusi_owner_account'), user_id);
	}

	/** The file to open at startup */
	export function saved_file(): string {
		const saved = Prefs.get_pref('illusi_active_db');
		return saved === '' ? default_db_path : saved;
	}

	export async function remember(user_id: string, plan: Plan) {
		if (plan.claim) await Prefs.save_pref('illusi_owner_account', user_id);
		await Prefs.save_pref('illusi_active_db', plan.file === default_db_path ? '' : plan.file);
	}
}
