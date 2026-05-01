import { log_info } from "@common/log";
import { CookieJar } from "@common/utils/cookie_util";
import { wait } from "@common/utils/timed_util";
import { fs, load_native_fs } from "@native/fs/fs";
import { Pearson } from "@origin/pearson/pearson";

// TODO TODO for self; make script for extracting cookies from browser mid script?????
const cookies_string = ""; // TODO fill this in with cookies that you extract through browser or other means?
const cookie_jar = CookieJar.fromString(cookies_string);

async function main__pearson_problem_extracting() {
    await load_native_fs();
    const extracted_data: any[] = [];

    const assignments_list = await Pearson.get_assignments_list({ cookie_jar });
    extracted_data.push(assignments_list);
    if ("error" in assignments_list) throw assignments_list.error;
    for (const assignment of assignments_list.data.slice(2)) {
        const assignment_summary = await Pearson.get_assignment_summary({ cookie_jar, assignment_id: Number(assignment.assignmentID) });
        extracted_data.push(assignment_summary);
        if ("error" in assignment_summary) {
            console.error(assignment_summary);
            continue;
        }
        for (const problem of assignment_summary.data.items) {
            const problem_document = await Pearson.get_problem_document({ cookie_jar, problem_id: Number(problem.id), problem_format: "json" });
            extracted_data.push(problem_document);
            if ("error" in problem_document) {
                console.error(problem_document);
                continue;
            }
            log_info(`Problem: ${problem.id}`);
            await wait(1000);
        }
        log_info(`Assignment: ${assignment.assignmentID}`);
        await wait(1000);
    }
    await fs().write_file_as_string("pearson_data.json", JSON.stringify(extracted_data), { encoding: "utf8" });
}
main__pearson_problem_extracting().catch(e => console.log(e));