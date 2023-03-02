import openai
import os
import random
import json

def get_json(path):
	with open(path, 'r') as f:
		d = f.read()
		try:
			return eval(d)
		except:
			return json.loads(d.replace("\\\\", "\\"))

def json_to_prompt(question_json):
	# chatgpt can handle parsing the json
	return f"Here is a json of a question, choose the best answer {question_json}. ONLY RESPOND WITH THE LETTER CHOICE"

def json_to_prompt2(question_json):
	# chatgpt can handle parsing the json
	return f"""Answer the following question. 
	Background: {question_json['background']}. 
	Choices: {question_json['answers']}
	ONLY RESPOND WITH THE LETTER CHOICE"""

def json_to_prompt3(question_json):
	choices_text = ""
	for choice in question_json['answers']:
		choices_text += f"{choice['choice']}) {choice['answer']}\n"
	return f"""Answer the following question. \n
	Background: {question_json['background']}. \n
	Choices: {choices_text}\n
	ONLY RESPOND WITH THE LETTER CHOICE"""

def json_to_prompt4(question_json):
	choices_text = ""
	for choice in question_json['answers']:
		choices_text += f"{choice['choice']}) {choice['answer']}\n"
	return f"""Answer the following question. \n
	Background: {question_json['background']}. \n
	Choices: {choices_text}\n
	Respond in the format: "The correct answer is X.", only choices are "A", "B", "C", "D", or "E"\n
	The following is the letter answer:\n"""

def get_answer_chatgpt(question_json):
	return openai.ChatCompletion.create(model="gpt-3.5-turbo", 
		messages=[
			{
				"role": "user", 
				"content": json_to_prompt3(question_json)
			}
		],
		temperature=0.0,
		n=1,
		max_tokens=2,
	)["choices"][0]["message"]["content"].strip()

def get_answer_davinci(question_json):
	return openai.Completion.create(model="davinci", 
		prompt= json_to_prompt3(question_json),
		temperature=0.1,
		n=1,
		max_tokens=26,
	)["choices"][0]["text"].strip().replace("The correct answer is", "").replace("The following is the letter answer:", "").strip()[0]

def letter_to_number(letter):
	return {
		"A": 0,
		"B": 1,
		"C": 2,
		"D": 3,
		"E": 4
	}[letter]

def do_test(test_number, part_number, get_answer=get_answer_chatgpt, intermediate_print=False):
	fs = os.listdir(f"lsat/practice_test_{test_number}/")
	question, answer = None, None
	for f in fs:
		if f"part_{part_number}" not in f:
			continue
		if 'answers' in f:
			answer = f
		else:
			question = f
	questions = get_json(f"lsat/practice_test_{test_number}/{question}")
	expected_answers = get_json(f"lsat/practice_test_{test_number}/{answer}")
	actual_answers = {}
	for question in questions:
		answer = get_answer(question)
		if answer not in ['A', 'B', 'C', 'D', 'E']:
			print("random guess because we got", answer)
			answer = random.choice(['A', 'B', 'C', 'D', 'E'])
		actual_answers[question['question_number']] = answer
	total_correct = 0
	for i, (key, actual_answer) in enumerate(actual_answers.items()):
		if letter_to_number(actual_answer) == expected_answers[key]:
			total_correct += 1
		if intermediate_print:
			print(key, letter_to_number(actual_answer), expected_answers[key], round(total_correct / (i+1) * 100, 2))
	return total_correct, round(total_correct / (i+1) * 100, 2)

if __name__ == '__main__':
	for test in ["2"]:
		for part in ["one", "two", "three", "four"]:
			total_correct, percent = do_test(test, part)
			print(f"Test {test}, part {part}, Got {total_correct} right, {percent}%")


