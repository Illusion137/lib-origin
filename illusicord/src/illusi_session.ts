import type { PromiseResult } from '@common/types';
import { generror } from '@common/utils/error_util';
import { Prefs } from '@illusive/prefs';
import { Config } from '@illusicord/config';
import { Illusi } from '@origin/illusi/illusi';
import type { SessionResponse } from '@origin/illusi/types';

export async function open_illusi_session(): PromiseResult<SessionResponse> {
	const { ILLUSI_EMAIL: email, ILLUSI_PASSWORD: password } = Config.dotenv;
	if (!email || !password) return generror('ILLUSI_EMAIL and ILLUSI_PASSWORD must be set to play Illusi tracks', 'INFO');
	Illusi.configure({
		base_url: Prefs.get_pref('illusi_api_url'),
		on_session_change: (session) => {
			if (session === null) void open_illusi_session().then(log_session);
		}
	});
	return Illusi.Auth.login({ email, password, device_name: 'Illusicord' });
}

export function log_session(result: Awaited<ReturnType<typeof open_illusi_session>>) {
	if (Illusi.is_error(result)) console.error(result);
	else console.log('Illusi session opened');
}
