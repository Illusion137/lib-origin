import type { Alerts } from '@native/alerts/alerts.base';
import { get_native_platform } from '@native/native_mode';

let alerts_instance: Alerts;

export async function load_native_alerts(): Promise<Alerts> {
	if (alerts_instance) return alerts_instance;
	switch (get_native_platform()) {
		case 'WEB':
			console.error('Web Native Alerts is NOT implemented');
			break;
		case 'NODE':
			try {
				alerts_instance = (await import('./alerts.node.ts')).node_alerts;
			} catch (e) { console.error(e); }
			break;
		case 'REACT_NATIVE':
			try {
				alerts_instance = (await import('./alerts.mobile.ts')).mobile_alerts;
			} catch (e) { console.error(e); }
			break;
	}
	return alerts_instance;
}

export function alerts(): Alerts {
	if (alerts_instance) return alerts_instance;
	console.error(new Error('Native Module [alerts/Alerts] is NOT loaded'));
	return alerts_instance;
}
