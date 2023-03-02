
function get_answer_choices(div) {
	var answers = div.getElementsByTagName("li")
	var answers_text = []
	for(let i = 0; i < answers.length; i++) {
		if(answers[i].getElementsByTagName("span").length === 0) {
			continue
		}
		var choice = answers[i].getElementsByTagName("span")[0].innerText;
		var answer = answers[i].getElementsByTagName("span")[1].innerText
		answers_text.push({
			'choice': choice,
			'answer': answer
		})
	}
	return answers_text
}

function get_answer(div) {
	var answers = get_answer_choices(div)
	for(let i = 0; i < answers.length; i++){
		if(answers[i]['answer'].slice(0, 7) === "CORRECT") {
			return i;
		}
	}
	return undefined
}

function multiple_answers() {
	var questions = document.getElementsByClassName("framework-perseus")[0].children[1].children[0].children[0].children
	var question_answers_rtn = {}
	for(var i = 0; i < questions.length; i++){
		var question_number = questions[i].children[0].children[0].children[1].children[0].children[0].children[0].innerText
		var question_answers = questions[i].children[1].getElementsByClassName("perseus-renderer perseus-renderer-responsive")[0]
		var answer = get_answer(question_answers)
		question_answers_rtn[question_number] = answer
	}
	return question_answers_rtn
}

function multiple_questions(background) {
	var questions = document.getElementsByClassName("framework-perseus")[0].children[1].children[0].children[0].children
	var questions_texts = []
	for(var i = 0; i < questions.length; i++){
		var question_number = questions[i].children[0].innerText
		var question_answers = questions[i].children[1].getElementsByClassName("perseus-renderer perseus-renderer-responsive")[0]
		var question = question_answers.getElementsByClassName("perseus-renderer perseus-renderer-responsive")[0].children[0].innerText
		var answers_text = get_answer_choices(question_answers)
		questions_texts.push(
			{
				"question_number": question_number.replace("\nReport", ""),
				"background": background,
				"question": question,
				"answers": answers_text
			}
		)
	}
	return questions_texts
}

function get_question_answers_reading() {
	var passages = document.getElementsByClassName("perseus-widget-passage")
	var passage_texts = []
	for(let i = 0; i < passages.length; i++) {
		var [title, line_numbers, passage, tmp] = passages[i].children
		passage_texts.push(
			{
				"title": title.innerText,
				"passage": passage.innerText.replace("Beginning of reading passage.", "").replace("End of reading passage.", "").replace("\n", "").replace("\n", "")
			}
		)
	}
	return multiple_questions(passage_texts)
}

function get_question_answers_analytical_reasoning() {
	var passages = document.getElementsByClassName("perseus-widget-passage")
	var passage_texts = []
	for(let i = 0; i < passages.length; i++) {
		var passage = passages[i].innerText.replace("Beginning of reading passage.", "").replace("End of reading passage.", "").replace("\n", "").replace("\n", "")
		passage_texts.push(
			{
				"passage": passage
			}
		)
	}
	return multiple_questions(passage_texts)
}


function get_answer_logical_reasoning() {
	var div = document.getElementsByClassName("framework-perseus")[0].children[0]
	var question_number = div.children[0].children[0].children[0].children[0].innerText.replace("\nReport", "")
	var d = {}
	d[question_number] = get_answer(div)
	return d
}

function get_question_answers_logical_reasoning() {
	var div = document.getElementsByClassName("framework-perseus")[0].children[0]
	var question_number = div.children[0].children[0].children[0].children[0].innerText.replace("\nReport", "")
	var background = div.children[1].innerText.replace("Beginning of reading passage.", "").replace("End of reading passage.", "").replace("\n", "").replace("\n", "")
	var question = div.children[2].children[0].children[0].textContent
	var answers_text = get_answer_choices(div)
	return [{
		'question_number': question_number,
		'background': background,
		'question': question,
		'answers': answers_text
	}]
}
	
function go_to_next_question(n) {
	var spans = document.getElementsByTagName("span")
	for(let j = 0; j < spans.length; j++) {
	    if(spans[j].innerText.slice(0, 4) === "Next") {
	    	if(n == 0) {
	    		return spans[j].parentElement	
	    	} 
	        n -= 1
	    }
	}
}

function go_back_to_results(n) {
	var spans = document.getElementsByTagName("span")
	for(let j = 0; j < spans.length; j++) {
	    if(spans[j].innerText.slice(0, 6) === "Return") {
	    	if(n == 0) {
	    		return spans[j].parentElement	
	    	} 
	        n -= 1
	    }
	}
}

function go_to_logical_reasoning(n) {
	var spans = document.getElementsByTagName("span")
	for(let j = 0; j < spans.length; j++) {
	    if(spans[j].innerText.slice(0, 7) === "Logical") {
	    	if(n == 0) {
	    		return spans[j].parentElement	
	    	} 
	        n -= 1
	    }
	}
}

// var questions = []
// const interval = setInterval(function() {
// 	questions.push(...get_question_answers_logical_reasoning())
// 	if(questions.length == 25) {
// 		clearInterval(interval)
// 		return
// 	}
// 	go_to_next_question(1).click()
// }, 1000);


const sleep = ms => new Promise(r => setTimeout(r, ms));
var answers = {}
const interval = setInterval(async function() {
	document.getElementsByTagName("button")[3 + Object.keys(answers).length].click()
	await sleep(500)
	var new_answers = get_answer_logical_reasoning()
	await sleep(500)
	answers = {
		...answers,
		...new_answers
	}
	go_back_to_results(0).click()
	go_to_logical_reasoning(2).click()
	if(Object.keys(answers).length == 25) {
		clearInterval(interval)
		console.log(JSON.stringify(answers))
		return
	}
}, 2000);

