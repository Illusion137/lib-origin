import { ResponseError } from "../../utils/types"

export type Support = SupportSuccess|ResponseError;
export interface SupportSuccess {
    success: Success[]
} 
export interface Success {
    body: string
    category: string
    subcategory: string
    title: string
}
  