import type { PromiseResult } from '@common/types';

export type AlertsNotificationFeedback = 'SUCCESS' | 'WARNING' | 'ERROR';
export type AlertsImpactFeedback = 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'RIGID' | 'SOFT';

export interface AlertsButton {
	text: string;
	style?: 'default' | 'cancel' | 'destructive';
	on_press?: () => void;
}

export interface Alerts {
	haptic_notification: (type: AlertsNotificationFeedback) => PromiseResult<undefined>;
	haptic_impact: (style: AlertsImpactFeedback) => PromiseResult<undefined>;
	haptic_selection: () => PromiseResult<undefined>;
	alert: (title: string, message?: string, buttons?: AlertsButton[]) => void;
}
