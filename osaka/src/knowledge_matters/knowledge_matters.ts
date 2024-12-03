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
async function main(){
    await navigator.clipboard.writeText(gpt_formated_quiz_answerquestion_info());
    alert("Copied info to clipboard: " + gpt_formated_quiz_answerquestion_info());
}
main();