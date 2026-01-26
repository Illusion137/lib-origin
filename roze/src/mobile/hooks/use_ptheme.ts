import { useTheme } from '@react-navigation/native';
import { reinterpret_cast } from '@common/cast'
import type { RozePrefs } from '@roze/prefs';

export default function usePTheme(){
    return reinterpret_cast<RozePrefs.RTheme>(useTheme());
}