import { alerts } from '@native/alerts/alerts';
import type { ResponseError } from '@common/types';
import { reinterpret_cast } from '@common/cast';

export function alert_info(info: string) {
	alerts().alert('INFO', info);
}
export function alert_errors(errors: ResponseError[]) {
	alerts().alert('Errors', errors.map(err => err.error).join('\n'));
}
export function alert_error(error: { error: ResponseError } | ResponseError | string) {
	if (typeof error === 'string') alerts().alert('Error', error);
	else if ('error' in error && !('error' in error.error)) {
		alerts().alert('Error', error.error.stack);
	} else alerts().alert('Error', reinterpret_cast<{ error: ResponseError }>(error).error.error.stack);
}
export function alert_trackplayer_error(error: ResponseError[] | ResponseError | string) {
	alerts().alert('Error', typeof error === 'string' ? error : Array.isArray(error) ? error.map(e => e.error.stack).join(', ') : error.error.stack);
}
