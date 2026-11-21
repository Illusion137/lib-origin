import type { Alerts } from '@native/alerts/alerts.base';

export const node_alerts: Alerts = {
	haptic_notification: async () => undefined,
	haptic_impact: async () => undefined,
	haptic_selection: async () => undefined,
	alert: (title, message) => {
		console.error(message === undefined ? title : `${title}: ${message}`);
	}
};
