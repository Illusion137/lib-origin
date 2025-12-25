import type course_catalog from './data/course_catalog';

//https://api.extended.nau.edu/Help
//https://api.extended.nau.edu/api/CourseCatalog
//https://www.peoplesoft.nau.edu/psc/ps92prcs/EMPLOYEE/SA/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?Page=SSR_CLSRCH_ENTRY&inst=NAU00&open=N&search=true
//https://nau.collegescheduler.com/api/terms/Spring%202026/subjects/AIS/courses/202/regblocks
export namespace Louis {
    type CourseCatalog = typeof course_catalog;
    type CourseSubjects = CourseCatalog[number]['Subject'];
    type Courses = `${CourseSubjects} ${string}`;
    type Time = `${number}:${number}`;
    type Day = "monday"|"tuesday"|"wednesday"|"thursday"|"friday";

    export async function fetch_course_catalog(){
        return;
    }
    export async function fetch_general_education_courses(){
        return;
    }
    export async function fetch_student_academic_progress(){
        return;
    }
    export async function get_best_general_education_courses(){
        return;
    }

    interface BuildScheduleOpts {
        earliest_class_start_time?: Time;
        latest_class_start_time?: Time;
        earliest_class_end_time?: Time;
        latest_class_end_time?: Time;
        no_classes_on?: Day[];
        all_required_classes: Courses[]; // ALL that are required that you can't escape from, or you just really want them
        all_completed_classes: Courses[];
        time_between_classes_ms: number;
        time_between_classes_distance_factor: number; // 1 means just time_between_classes_ms
    };
    export async function build_schedule(){
        return;
    }

    export async function check_for_housing_application(){
        return;
    }
}