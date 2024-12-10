import { Action } from "./actions";

function quiz_answerquestion_info(): [string, string[]]{
    const title = document.getElementsByClassName('quiz_question_numbers')[0].parentElement!.textContent!.replace(/\n/g, '').replace(/\s{2,}/g, '').replace(/QUESTION \d+ of \d+:/, '');
    const answers: string[] = Array.from(document.getElementsByClassName('quiz_question_answers')[0].children[0].children).map((answer: any) => answer.innerText.replace(/\t/g,' ').trim());
    return [title, answers];
}
function gpt_formated_quiz_answerquestion_info(): string {
    const [title, answers] = quiz_answerquestion_info();
    const formated = `Answer the following question: \n${title} \n${answers.join('\n')}`;
    return formated;
}
/*
Jan 3 2053 03:42 PM
Formed a new Plumbing Business named Silly Plumbing.

Jan 3 2053 03:42 PM
Financed business with $110,000 from personal savings.

Jan 3 2053 03:42 PM
Took out a loan for $50,000 for 24 months at 15 % interest rate.

Jan 3 2053 03:42 PM
Conducted survey at cost of $1,600.

Jan 3 2053 03:42 PM
Located business at location Street 26, Avenue 12, Lot 1

Jan 3 2053 03:42 PM
Purchased business owner's insurance policy with annual premium of $769, deductible of $1,000 and coverage amount of $1,000,000.

Jan 3 2053 03:42 PM
Set prices for:

Repair of Leaky Pipe$250.00
Kitchen Sink Replacement$500.00
Clearing of Slow/Clogged Drain$100.00
Full Bathroom Remodel$2,000.00
Plumbing Installation, New Home$8,000.00
Jan 3 2053 03:42 PM
Hired Miguel Hewson for the position of Master Plumber at wage of $50.10

Jan 3 2053 03:42 PM
Hired Chuck Gray for the position of Journeyman Plumber at wage of $33.68

Jan 3 2053 03:42 PM
Hired Evia Gill for the position of Journeyman Plumber at wage of $35.11

Jan 3 2053 03:42 PM
Hired Sue Ustach for the position of Apprentice Plumber at wage of $24.81

Jan 3 2053 03:42 PM
Hired Russell Ustach for the position of Apprentice Plumber at wage of $26.20

Jan 3 2053 03:42 PM
Hired Hugh Thorpe for the position of Apprentice Plumber at wage of $24.43

Jan 3 2053 03:42 PM
Cost of purchased plumbing truck was $30,000.

Jan 3 2053 03:42 PM
Added Plumbing Truck to Truck Parking area at location: (3,2).

Jan 3 2053 03:42 PM
Cost of purchased pipe wrenches was $1,000.

Jan 3 2053 03:42 PM
Added stockpile for Pipe Wrenches to Equipment area at location: (9,3).

Jan 3 2053 03:42 PM
Cost of purchased pipe wrenches was $1,000.

Jan 3 2053 03:42 PM
Cost of purchased pipe wrenches was $1,000.

Jan 3 2053 03:42 PM
Cost of purchased pipe wrenches was $1,000.

Jan 3 2053 03:42 PM
Cost of purchased pipe wrenches was $1,000.

Jan 3 2053 03:42 PM
Cost of purchased reciprocating saw was $90.

Jan 3 2053 03:42 PM
Added stockpile for Reciprocating Saw to Equipment area at location: (1,6).

Jan 3 2053 03:42 PM
Cost of purchased reciprocating saw was $90.

Jan 3 2053 03:42 PM
Cost of purchased reciprocating saw was $90.

Jan 3 2053 03:42 PM
Cost of purchased reciprocating saw was $90.

Jan 3 2053 03:42 PM
Cost of purchased reciprocating saw was $90.

Jan 3 2053 03:42 PM
Cost of purchased circular saw was $120.

Jan 3 2053 03:42 PM
Added stockpile for Circular Saw to Equipment area at location: (5,5).

Jan 3 2053 03:42 PM
Cost of purchased circular saw was $120.

Jan 3 2053 03:42 PM
Cost of purchased circular saw was $120.

Jan 3 2053 03:42 PM
Cost of purchased circular saw was $120.

Jan 3 2053 03:42 PM
Cost of purchased propane torch was $40.

Jan 3 2053 03:42 PM
Added stockpile for Propane Torch to Equipment area at location: (8,3).

Jan 3 2053 03:42 PM
Cost of purchased propane torch was $40.

Jan 3 2053 03:42 PM
Cost of purchased propane torch was $40.

Jan 3 2053 03:42 PM
Cost of purchased propane torch was $40.

Jan 3 2053 03:42 PM
Cost of purchased propane torch was $40.

Jan 3 2053 03:42 PM
Cost of purchased power snake was $300.

Jan 3 2053 03:42 PM
Added stockpile for Power Snake to Equipment area at location: (4,2).

Jan 3 2053 03:42 PM
Cost of purchased power snake was $300.

Jan 3 2053 03:42 PM
Cost of purchased power snake was $300.

Jan 3 2053 03:42 PM
Cost of purchased power snake was $300.

Jan 3 2053 03:42 PM
Cost of purchased power snake was $300.

Jan 3 2053 03:42 PM
Cost of purchased power snake was $300.

Jan 3 2053 03:42 PM
Cost of purchased pipes was $7,200.

Jan 3 2053 03:42 PM
Added stockpile for Pipes to Equipment area at location: (10,5).

Jan 3 2053 03:42 PM
Cost of purchased pipes was $7,200.

Jan 3 2053 03:42 PM
Added stockpile for Pipes to Equipment area at location: (10,6).

Jan 3 2053 03:42 PM
Cost of purchased pipes was $7,200.

Jan 3 2053 03:42 PM
Added stockpile for Pipes to Equipment area at location: (10,2).

Jan 3 2053 03:42 PM
Removed stockpile for Pipes from Equipment area at location: (10,2).

Jan 3 2053 03:42 PM
Removed stockpile for Pipes from Equipment area at location: (10,5).

Jan 3 2053 03:42 PM
Cost of purchased fittings was $117.

Jan 3 2053 03:42 PM
Added stockpile for Fittings to Equipment area at location: (8,2).

Jan 3 2053 03:42 PM
Cost of purchased sinks was $4,680.

Jan 3 2053 03:42 PM
Added stockpile for Sinks to Equipment area at location: (6,5).

Jan 3 2053 03:42 PM
Cost of purchased toilets was $3,552.

Jan 3 2053 03:42 PM
Added stockpile for Toilets to Equipment area at location: (9,5).

Jan 3 2053 03:42 PM
Moved Sinks from Equipment area location: (6,5) to (5,2).

Jan 3 2053 03:42 PM
Moved Propane Torch from Equipment area location: (8,3) to (6,2).

Jan 3 2053 03:42 PM
Moved Pipe Wrenches from Equipment area location: (9,3) to (7,2).

Jan 3 2053 03:42 PM
Moved Circular Saw from Equipment area location: (5,5) to (3,2).

Jan 3 2053 03:42 PM
Moved Pipes from Equipment area location: (10,6) to (2,2).

Jan 3 2053 03:42 PM
Moved Toilets from Equipment area location: (9,5) to (2,3).

Jan 3 2053 03:42 PM
Cost of purchased plumbing truck was $30,000.

Jan 3 2053 03:42 PM
Added Plumbing Truck to Truck Parking area at location: (1,2).

Jan 3 2053 03:42 PM
Moved Reciprocating Saw from Equipment area location: (1,6) to (3,3).

Jan 3 2053 03:42 PM
Booked social media ad Leaky Pipes.
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing'. Ad text: 'Repair of Leaky Pipe'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: $25K to $60K, $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Property Maintenance.

Jan 3 2053 03:42 PM
Booked social media ad Kitchen Sink.
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing'. Ad text: 'Kitchen Sink Replacement'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Property Maintenance and Remodeling.

Jan 3 2053 03:42 PM
Booked social media ad Clogged Drain.
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing Drains'. Ad text: 'Clearing of Slow/Clogged Drain'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: <$25K, $25K to $60K, $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Property Maintenance.

Jan 3 2053 03:42 PM
Booked social media ad Bathroom Remodel.
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing Bathroom'. Ad text: 'Full Bathroom Remodel'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Remodeling.

Jan 3 2053 03:42 PM
Booked social media ad New Home.
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing New Home'. Ad text: 'Plumbing Installation, New Home'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Construction and Home Ownership.

Jan 3 2053 03:42 PM
Edited social media ad Leaky Pipes
Ad's original name: Leaky Pipes
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing Leaky'. Ad text: 'Repair of Leaky Pipe'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: $25K to $60K, $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Property Maintenance.

Jan 3 2053 03:42 PM
Edited social media ad Bathroom Remodel
Ad's original name: Bathroom Remodel
Ad will run from Jan 3 2053 to Jan 1 2100 with daily budget of $50.
Ad headline: 'Silly Plumbing Bathroom'. Ad text: 'Full Bathroom Remodel'. Ad image is number 16, Fixing Drain.
Distance: <4 blocks, 4 to 10 blocks and 11 to 20 blocks.
Income: $61K to $100K and $100K+.
Age: 18 to 28, 29 to 49 and 50+.
Gender: Male and Female.
Interests: Home Renovation and Remodeling.

Jan 19 2053 12:10 PM
Financed business with $20,800 from personal savings.

Jan 22 2053 05:35 PM
Moved Toilets from Equipment area location: (2,3) to (1,5).
*/

function pattern_extract(str: string, pattern: RegExp){
    return str.match(pattern)!.slice(1);
}
function parse_num(numstr: string){
    return parseInt(numstr.replace(/,/g, ''));
}

function run_action(){

}

function parse_action(actstr: string): Action{
    if(actstr.startsWith("Formed a new ")){
        const [business_type, name] = pattern_extract(actstr, /Formed a new (.+?) business named (.+?)/)
        return {
            type: "form_business",
            name: name,
            business_type: business_type
        };
    }
    if(actstr.startsWith("Financed business with ")){
        const [amount] = pattern_extract(actstr, /(\$[0-9,]+)/)
        return {
            type: "finance_savings",
            amount: parse_num(amount)
        };
    }
}

function parse_actions_journal(input: string){
    const actions = input.split('\n\n');
    actions.map(action_data => {
        const [datestr, actionstr] = action_data.split('\n');
        const date = new Date(datestr);
        if(actionstr.startsWith("Formed a new ")){
            
        }
    })
}