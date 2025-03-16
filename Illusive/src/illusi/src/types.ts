import { NavigationProp } from "@react-navigation/native";
export type Navigator = NavigationProp<any, any> & {push: (name: string, params: object) => void}