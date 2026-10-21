import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { generror_catch } from '@common/utils/error_util';
import type { Alerts, AlertsImpactFeedback, AlertsNotificationFeedback } from '@native/alerts/alerts.base';

const notification_types: Record<AlertsNotificationFeedback, Haptics.NotificationFeedbackType> = {
	SUCCESS: Haptics.NotificationFeedbackType.Success,
	WARNING: Haptics.NotificationFeedbackType.Warning,
	ERROR: Haptics.NotificationFeedbackType.Error
};

const impact_styles: Record<AlertsImpactFeedback, Haptics.ImpactFeedbackStyle> = {
	LIGHT: Haptics.ImpactFeedbackStyle.Light,
	MEDIUM: Haptics.ImpactFeedbackStyle.Medium,
	HEAVY: Haptics.ImpactFeedbackStyle.Heavy,
	RIGID: Haptics.ImpactFeedbackStyle.Rigid,
	SOFT: Haptics.ImpactFeedbackStyle.Soft
};

export const mobile_alerts: Alerts = {
	haptic_notification: async (type) => {
		try {
			await Haptics.notificationAsync(notification_types[type]);
			return undefined;
		} catch (e) {
			return generror_catch(e, 'Failed to haptic_notification', 'INFO', { type });
		}
	},
	haptic_impact: async (style) => {
		try {
			await Haptics.impactAsync(impact_styles[style]);
			return undefined;
		} catch (e) {
			return generror_catch(e, 'Failed to haptic_impact', 'INFO', { style });
		}
	},
	haptic_selection: async () => {
		try {
			await Haptics.selectionAsync();
			return undefined;
		} catch (e) {
			return generror_catch(e, 'Failed to haptic_selection', 'INFO', {});
		}
	},
	alert: (title, message, buttons) => {
		Alert.alert(title, message, buttons?.map(button => ({ text: button.text, style: button.style, onPress: button.on_press })));
	}
};
