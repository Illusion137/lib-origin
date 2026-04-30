import rozfetch from "@common/rozfetch";
import { encode_params } from "@common/utils/fetch_util";
import type { ProblemJSON, ProblemDocumentResult } from "./types/ProblemDocument";
import { try_json_parse } from "@common/utils/parse_util";
import type { BaseOpts, FetchMethod, PromiseResult } from "@common/types";
import type { AssignmentSummary } from "./types/AssignmentSummary";
import type { AssignmentsList } from "./types/AssignmentsList";

export namespace Pearson {
    type AvailableFormats = "json";
    function get_headers(opts: BaseOpts) {
        return {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "mxemulatedcookie": "null",
            "pragma": "no-cache",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Chromium\";v=\"146\", \"Not-A.Brand\";v=\"24\", \"Google Chrome\";v=\"146\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": opts.cookie_jar?.toString() ?? "",
        };
    }
    async function api_request<T extends Record<any, any> = never>(method: FetchMethod, url: string, params: Record<string, unknown>, opts: BaseOpts): PromiseResult<T> {
        const response = await rozfetch<T>(`${url}${method === "GET" ? encode_params(params) : ""}`, {
            "headers": get_headers(opts),
            "body": method === "GET" ? null : encode_params(params),
            "method": method,
            ...opts.fetch_opts
        });
        if ("error" in response) return response;
        const response_json = await response.json();
        if ("error" in response_json) return response_json;
        return response_json;
    }
    export async function get_assignments_list(opts: BaseOpts) {
        const params = { action: "getStdAssignmentData" };
        return await api_request<AssignmentsList>("GET", "https://session.physics-mastering.pearson.com/myct/mastering?", params, opts);
    }
    export async function get_assignment_summary(opts: BaseOpts & { assignment_id: number }) {
        const params = {
            action: "getAssignmentSummary",
            assignmentID: opts.assignment_id
        }
        return api_request<AssignmentSummary>("GET", "https://session.physics-mastering.pearson.com/myct/assignment?", params, opts);
    }
    export async function get_problem_document(opts: BaseOpts & { problem_id: number, problem_format: AvailableFormats }) {
        const payload = {
            action: "getProblemDocument",
            assignmentProblemID: opts.problem_id,
            problemFormat: opts.problem_format
        };
        const problem_document_result = await api_request<ProblemDocumentResult>("POST", "https://session.physics-mastering.pearson.com/myct/itemView", payload, opts);
        if ("error" in problem_document_result) return problem_document_result;
        const problem_json = try_json_parse<ProblemJSON>(problem_document_result.data.problemJSON);
        if ("error" in problem_json) return problem_json;
        return { problem_document_result, problem_json };
    }
}