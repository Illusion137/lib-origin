// Reference https://cdn.feelthemusi.com/parsing/parsing_source.min.js

export namespace ProIP {
    export type IpResult = IpSuccessResult|IpFailureResult;
    export interface IpSuccessResult {
        as: string
        city: string
        country: string
        countryCode: string
        isp: string
        lat: number
        lon: number
        org: string
        query: string
        region: string
        regionName: string
        status: "success"
        timezone: string
        zip: string
    }
    export interface IpFailureResult {
        status: "fail"
        message: string
    }
      
    export async function pro_ip_api(api_key?: string) {
        const response = await fetch(`https://pro.ip-api.com/json?key=${api_key}`);
        return <IpResult>await response.json();
    }
}