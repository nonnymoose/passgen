var w1000 = [];
var wordnet = [];
var data = [];
var twister = new MersenneTwister();
var loaderQueue = []; // arrays ["<identifier>", "url"] where identifier is \w['w', '1']\d<index>
var loading = false;
var loadReq = new XMLHttpRequest();
loadReq.addEventListener("load", loaded);

function loaded() {
	if (!loading) {
		document.querySelector("#wordDBLoader").style.display = "inline-block";
		document.querySelector("#gen").onclick = false;
		document.querySelector("#gen").innerText = "Loading...";
		loading = true;
	}
	if (this.responseURL !== undefined) {
		console.log("Loaded " + this.responseURL);
		if (loaderQueue[0][0][0] == "w") {
			//wordnet
			wordnet[loaderQueue[0][0][1]] = JSON.parse(this.responseText);
		}
		else if (loaderQueue[0][0][0] == "1") {
			//1000
			w1000[loaderQueue[0][0][1]] = JSON.parse(this.responseText);
		}
		loaderQueue.shift();
	}
	if (loaderQueue.length > 0) {
		loadReq.open("GET", loaderQueue[0][1]);
		loadReq.send();
	}
	else {
		document.querySelector("#wordDBLoader").style.display = "none";
		document.querySelector("#gen").onclick = gen;
		document.querySelector("#gen").innerText = "Generate Password";
		loading = false;
	}
}

function randomNumber(times) {
	var result = [];
	for (var i = 0; i < times; i++) {
		result.push(Math.floor(twister.random() * 10));
	}
	return result;
}

var patt = [[1,2,3],[0,2,4,5],[0,1,3,4,5,6],[2,5,6],[1,2,5,7,8],[1,2,3,4,6,7,8,9],[2,3,5,8,9],[4,5,8],[4,5,6,7,9],[5,6,8]];

function randomNumberPatt(times, init) {
	var result = [];
	if (init !== undefined) {result[0] = init;}
	else {result[0] = Math.floor(twister.random() * 10);}
	for (var i = 1; i < times; i++) {
		var choices = patt[result[i-1]];
		var choice = Math.floor(twister.random() * choices.length);
		result.push(choices[choice]);
	}
	return result;
}

var randomNumberGenerator = randomNumber;

function getWordDB() {
	return document.querySelector("#wordb").value;
}

function updateWordDB() {
	if (getWordDB() == "1000") {
		if (w1000[0] === undefined) {
			loaderQueue.push(["10", "1000/index.adj"],["11", "1000/index.adv"],["12", "1000/index.noun"],["13", "1000/index.verb"]);
			loaded();
		}
	}
	else { // kewl fallback to wordnet, right?
		if (wordnet[0] === undefined) {
			// should not happen but just in case... ;)
			loaderQueue.push(["w0","wordnet/index.adj"],["w1","wordnet/index.adv"],["w2","wordnet/index.noun"],["w3","wordnet/index.verb"]);
			loaded();
		}
	}
}

function updateNumberGen() {
	var choice = document.querySelector("#numbergen").value;
	if (choice == "random") {randomNumberGenerator = randomNumber;}
	else if (choice == "pattern") {randomNumberGenerator = randomNumberPatt;}
}

var words = []; // 0=random, 1=adj, 2=adv, 3=noun, 4=verb
var wordelems = []; // should match above

function updateWords() {
	var wordct = parseInt(document.querySelector("#\\#words").value);
	if (isNaN(wordct)) {wordct = 0;}
	document.querySelector("#\\#words").value = wordct;
	if (wordct == words.length) {return;} // what the heck? Well, nothing to update
	else if (wordct < words.length) {
		while (wordct != words.length) {
			wordelems.pop().outerHTML = "";
			words.pop();
		}
		if (words.length === 0) {
			document.querySelector("#wordchoices").style.height = "0";
		}
	}
	else if (wordct > words.length) {
		while (wordct != words.length) {
			var elementToAdd = document.createElement("select");
			elementToAdd.innerHTML = "<option value=\"0\">Random</option>\n<option value=\"1\">Adjective</option>\n<option value=\"2\">Adverb</option>\n<option value=\"3\">Noun</option>\n<option value=\"4\">Verb</option>";
			elementToAdd.name = words.length;
			elementToAdd.onchange = function() {words[this.name] = parseInt(this.value);}; // jshint ignore:line
			                                                                               // shut up JsHint this situation is unique!
			document.querySelector("#wordchoices").appendChild(elementToAdd);
			words.push(0);
			wordelems.push(elementToAdd);
		}
		document.querySelector("#wordchoices").style.height = "200px";
	}
}

function getPartOfSpeech(denotation) {
	if (! isNaN(denotation)) {return denotation - 1;}
	else if (denotation == "a") {return 0;} // see index order and this will make sense
	else if (denotation == "r") {return 1;}
	else if (denotation == "n") {return 2;}
	else if (denotation == "v") {return 3;}
	else { // prettier than a switch
		return 2; // fail-safe
	}
}

function getRandWord(pos) { // part of speech ;)
	if (pos === undefined || pos == 0) {pos = Math.floor(twister.random() * 4) + 1;}
	pos = getPartOfSpeech(pos);
	var selectedword;
	if (getWordDB() == "1000") {
		selectedword = w1000[pos][Math.floor(twister.random() * w1000[pos].length)];
	}
	else {
		selectedword = wordnet[pos][Math.floor(twister.random() * wordnet[pos].length)];
	}
	return selectedword[0]; // unfinished for debugging purposes
}

function gen() {
	var result = "";
	for (var i = 0; i < words.length; i++) {
		result += getRandWord(words[i]) + " ";
	}
	result += randomNumberGenerator(document.querySelector("#\\#numbers").value).join("");
	if (result.length > 0) {
		document.querySelector("#result").innerHTML = result;
		document.querySelector("div.result").style.height = "200px";
	}
}

//this goes at the end!!!
loaderQueue.push(["w0","wordnet/index.adj"],["w1","wordnet/index.adv"],["w2","wordnet/index.noun"],["w3","wordnet/index.verb"],["w4","wordnet/data.adj"],["w5","wordnet/data.adv"],["w6","wordnet/data.noun"],["w7","wordnet/data.verb"]);
loaded();
