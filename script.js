/*window.onload = () => {
    startGame();
}*/

var getwordlist = new Promise((resolve, reject) => {
    var text = "";
    var request = new XMLHttpRequest();
    request.open("GET", "wordlist.txt", true);
    request.onload = () => {
        if (request.status === 200) {
            text = request.responseText;
            resolve(text);
        } else {
            reject("no file found");
        }
    }
    request.send();
});

function clearGrid() {
    var grid = document.getElementsByClassName("guess_grid")[0];
    var keyboard = document.getElementsByClassName("onscreen-keyboard")[0];

    grid.remove();
    keyboard.remove();
}

function setUpGrid(grid) {
    // setup
    for (let i = 0; i < 6; i++) {
        var row = document.createElement('div');
        row.className = "guess_row";
        for (let i = 0; i < 5; i++) {
            var cell = document.createElement('div');
            cell.className = "letterbox";
            var text = document.createElement('p');
            text.className = "lettertext";
            text.textContent = "";
            cell.appendChild(text);
            row.appendChild(cell);
        }
        //var popup = document.createElement("div");
        //popup.className = "not-in-lexicon";
        //popup.textContent = "Not in lexicon!";
        //row.appendChild(popup);
        grid.appendChild(row);
    }

    var first_row =  grid.getElementsByClassName("guess_row")[0];
    first_row.classList.add("selected");
}

function gameend() {
    var keyboard = document.getElementsByClassName("onscreen-keyboard")[0];
    var keys = keyboard.getElementsByClassName("keyboard-key");
    for (let i = 0; i < keys.length; i++) {
        keys[i].removeEventListener("click", keyboardinput);
    }

    document.removeEventListener('keydown', keyboardinput);
}

function setUpKeyboard(keyboard, grid) {
    // setup
    const bar1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    const bar2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    const bar3 = ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"];

    var row1 = document.createElement('div');
    row1.className = "keyboard-row";
    for (let i = 0; i < bar1.length; i++) {
        var key = document.createElement('div');
        key.className = "keyboard-key";
        key.textContent = bar1[i];
        row1.appendChild(key);
    }

    var row2 = document.createElement('div');
    row2.className = "keyboard-row";
    for (let i = 0; i < bar2.length; i++) {
        var key = document.createElement('div');
        key.className = "keyboard-key";
        key.textContent = bar2[i];
        row2.appendChild(key);
    }

    var row3 = document.createElement('div');
    row3.className = "keyboard-row";
    for (let i = 0; i < bar3.length; i++) {
        var key = document.createElement('div');
        key.className = "keyboard-key";
        if (bar3[i] == "Backspace") {
            key.textContent = "Back";
        } else key.textContent = bar3[i];
        row3.appendChild(key);
    }

    keyboard.appendChild(row1);
    keyboard.appendChild(row2);
    keyboard.appendChild(row3);
}

var game_ended = false;
var inputword = "";

function handleInput(grid, key, wordlist, word) {

    if (game_ended) return "";

    var rowlist = grid.getElementsByClassName("guess_row");
    var cur_row, cellist, x;

    for (let i = 0; i < rowlist.length; i++) {
        if (rowlist[i].classList.contains("selected")) {
            cur_row = rowlist[i];
            x = i;
            break;
        }
    }

    cellist = cur_row.getElementsByClassName("letterbox");
    var incorrect_letter = false;

    if (key === "Enter" && x < 6 && inputword.length == 5) {
        
        if (wordlist.includes(inputword.toLowerCase())) {
            var wordvals = compare_words(inputword.toLowerCase(), word);

            for (var i = 0; i < 5; i++) {
                if (wordvals[i] == 2) {
                    cur_row.getElementsByClassName("letterbox")[i].style.backgroundColor = "green";
                    continue;
                }

                if (wordvals[i] == 1) {
                    cur_row.getElementsByClassName("letterbox")[i].style.backgroundColor = "yellow";
                    incorrect_letter = true;
                    continue;
                }

                if (wordvals[i] == 0) {
                    incorrect_letter = true;
                    continue;
                }
            }

            if (incorrect_letter == false) {
                console.log("winner");
                console.log(inputword.length);
                game_ended = true;
            }

            else {
                if (x != 5) {
                    cur_row.className = "guess_row";
                    rowlist[x+1].className = "guess_row selected";
                    inputword = "";
                }

                else {
                    console.log("game over");
                    game_ended = true;
                }
            }
        } else {
            alertWordNotInLexicon();
        }
    }

    else if (key === "Backspace" && inputword.length > 0) {
        inputword = inputword.substring(0, inputword.length - 1);
        for (let i = 0; i < 5; i++) {
            let keycontent = cellist[i].getElementsByTagName("p")[0];
            keycontent.textContent = "";
            if (i < inputword.length)
                keycontent.textContent = inputword.charAt(i);
        }
    }

    else if (isLetter(key) && inputword.length < 5 && x < 6) {
        inputword += key.toUpperCase();
        for (let i = 0; i < 5; i++) {
            let keycontent = cellist[i].getElementsByTagName("p")[0];
            keycontent.textContent = "";
            if (i < inputword.length)
                keycontent.textContent = inputword.charAt(i);
        }
    }

    else {
    }

    return inputword;
}

function alertWordNotInLexicon() {
    var activeRow = document.getElementsByClassName("guess_row selected")[0];
    
    var popup = document.createElement("div");
    popup.className = "not-in-lexicon";

    var popuparrow = document.createElement("div");
    popuparrow.className = "lex-arrow";
    popup.appendChild(popuparrow);

    var popupbody = document.createElement("div");
    popupbody.className = "not-in-lexicon-body";
    popupbody.textContent = "Not in lexicon!";
    popup.appendChild(popupbody);

    activeRow.appendChild(popup);
    popup.classList.add("show");

    setTimeout(() => {
        activeRow.removeChild(popup);
    }, 3000);
    console.log(popup);
}


function startGame() {
    getwordlist.then((value) => {

        var grid = document.getElementsByClassName("guess_grid")[0];
        var keyboard = document.getElementsByClassName("onscreen-keyboard")[0];

        setUpGrid(grid);

        var wordlist = value.split("\n");
        console.log(wordlist);
        for (let i = 0; i < wordlist.length; i++) {
            wordlist[i] = wordlist[i].substring(0, wordlist[i].length - 1);
        }

        const list_length = wordlist.length;
        var word = wordlist[Math.floor(Math.random() * list_length)];

        setUpKeyboard(keyboard, grid);
        var keys = keyboard.getElementsByClassName("keyboard-key");
        for (let i = 0; i < keys.length; i++) {
            keys[i].addEventListener('click', function keyboardinput(event) {
                var inpkey;
                var keycontent = keys[i].getElementsByTagName("p")[0];
                if (keys[i].textContent == "Back") inpkey = "Backspace";
                else inpkey = keys[i].textContent;
                inputword = handleInput(grid, inpkey, wordlist, word);
            });
        }

        document.addEventListener('keydown', function keyboardinput(event) {
            inputword = handleInput(grid, event.key, wordlist, word);
        });

    }, (error) => {
        console.log(error);
    });
}

function compare_words(word1, word) {
    var ret = [0, 0, 0, 0, 0];
    var lettercount = [];

    if (word1.length != word.length || word.length != 5) {
        console.log("error: word length is unequal");
    }

    else {
        // set up letter history
        for (let i = 0; i < word1.length; i++) {
            var found_letter = false;
            for (let j = 0; j < lettercount.length; j++) {
                if (lettercount[j][0] == word.charAt(i)) {
                    found_letter = true;
                    break;
                }
            }
            if (found_letter == false) 
                lettercount.push([word.charAt(i), word.split(word.charAt(i)).length - 1]);
        }

        // check for any correct placements
        for (let i = 0; i < word1.length; i++) {
            if (word1.charAt(i) == word.charAt(i)) {
                ret[i] = 2;
                for (let j = 0; j < lettercount.length; j++) {
                    if (lettercount[j][0] == word.charAt(i) && lettercount[j][1] > 0) {
                        lettercount[j][1]--;
                        break;
                    }
                }
            }
        }

        // check for any correct letters in incorrect placements
        for (let i = 0; i < word1.length; i++) {
            if (word.includes(word1.charAt(i)) && ret[i] == 0) {
                for (let j = 0; j < lettercount.length; j++) {
                    if (lettercount[j][0] == word1.charAt(i) && lettercount[j][1] > 0) {
                        ret[i] = 1;
                        lettercount[j][1]--;
                        break;
                    }
                }
            }
        }
    }

    return ret;
}

function isLetter(c) {
    return c.length === 1 && c.match(/[a-z]/i);
}

startGame();