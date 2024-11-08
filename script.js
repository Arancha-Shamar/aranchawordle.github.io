const popup = document.querySelector(".popup"); // Hämta popup-elementet
const closeButton = document.querySelector(".close-button"); // Hämta avsluta knappen

window.onload = function () {
  togglePopup(); // Visa popup när fönstret laddas
};

function togglePopup() {
  popup.classList.toggle("show-popup"); // Växla visningen av popup
}

function windowOnClick(event) {
  if (event.target === popup) {
    // Kontrollera om popup är målet för klicket
    togglePopup(); // Stäng popup om den klickas på
  }
}

closeButton.addEventListener("click", togglePopup); // Lägg till en event-listener för avsluta knappen
window.addEventListener("click", windowOnClick); // Lägg till en event-listener för klick

fetch("./wordle.json") // Hämta ord från JSON-filen
  .then((response) => {
    return response.json(); // Konvertera svaret
  })
  .then((data) => {
    const wordList = data.words; // Hämta ordlistan
    const secretWord = wordList[Math.floor(Math.random() * wordList.length)]; // Välj ett slumpmässigt ord
    const grid = document.getElementById("word-grid"); // Hämta rutnätet för ord
    const wordArray = secretWord.split(""); // Dela det hemliga ordet i bokstäver
    const gridRows = grid.children; // Hämta raderna i rutnätet
    const keys = document
      .querySelector("#keyboard")
      .getElementsByTagName("input"); // Hämta tangentbordets knappar

    let row = 0; // Initiera radindex
    let col = 0; // Initiera kolumnindex
    let str = ""; // Initiera sträng för inmatning
    let popupText = document.querySelector(".popup-text"); // Hämta popup-texten
    let popupContent = document.querySelector(".popup-content"); // Hämta innehållet i popup

    for (let i = 0; i < 6; i++) {
      // Skapa 6 rader i rutnätet
      let row = document.createElement("div"); // Skapa en ny rad

      for (let j = 0; j < 5; j++) {
        // Skapa 5 celler i varje rad
        let cell = document.createElement("div"); // Skapa en ny cell
        cell.classList.add("cell"); // Lägg till klass för cell
        row.appendChild(cell); // Lägg till cellen i raden
      }

      grid.appendChild(row); // Lägg till raden i rutnätet
    }

    const clearBoard = () => {
      // Funktion för att rensa board
      for (let i = 0; i < 6; i++) {
        // Gå igenom varje rad
        for (let j = 0; j < 5; j++) {
          // Gå igenom varje cell
          gridRows[i].children[j].textContent = ""; // Rensa cellens text
          gridRows[i].children[j].classList.remove(
            // Ta bort klass från cell
            "correct-cell",
            "correct-letter-wrong-cell",
            "wrong-cell"
          );
        }
      }
    };

    const wordleLogic = (e, val) => {
      // Huvudlogik för spelet
      if ((e[val] === "Backspace" || e[val] === "<-") && col >= 1) {
        // Hantera backspace
        col--; // Minska kolumn
        gridRows[row].children[col].textContent = ""; // Rensa cellens text
        fillCell(gridRows[row].children[col]); // Fyll cellen
        str = str.substring(0, str.length - 1); // Ta bort sista tecknet från strängen
      }

      if ((col === 5 && e[val] === "Enter") || e[val] === "enter") {
        // Kontrollera om raden är full och Enter trycks
        if (str === secretWord) {
          // Kontrollera om gissningen är korrekt
          popupText.innerHTML = `
					<h1> Grattis 🎉🎉🎉 <br>Du gissade rätt ord. <h1>
						<div class="play-buttons">
						<button onclick="location.reload()" id="play">Spela igen</button>
						<button onclick="window.close()" id="exit">Avsluta</button>
					</div>
					`;
          allCorrect(row); // Markera alla celler som korrekta
          togglePopup(); // Visa popup
        } else {
          let wrongArr = str.split(""); // Dela den felaktiga gissningen i bokstäver
          colorLetterCells(wrongArr, row); // Färga cellerna baserat på gissningen
          col = 0; // Återställ kolumnindex
          row++; // Gå till nästa rad
          str = ""; // Återställ strängen
        }
      }

      if (isCharacterALetter(e[val]) && e[val].length === 1 && col < 5) {
        // Kontrollera om inmatningen är en bokstav
        gridRows[row].children[col].textContent = e[val].toUpperCase(); // Sätt cellens text till den inmatade bokstaven
        fillCell(gridRows[row].children[col]); // Fyll cellen
        col++; // Öka kolumnindex
        str += e[val].toLowerCase(); // Lägg till bokstaven i strängen
      }

      if (row === 6) {
        // Kontrollera om alla rader är använda
        popupContent.innerHTML = `<h1> Tyvärr :( <br>Du misslyckades. Tryck på spela igen för att försöka en gång till. <h1>
					<div class="play-buttons">
						<button onclick="location.reload()" id="play">Spela igen</button>
						<button onclick="window.close()" id="exit">Avsluta</button>
					</div>`;
        togglePopup(); // Visa popup för spelets slut
      }
    };

    for (let key of keys) {
      // Lägg till event-listener för varje tangent
      key.addEventListener("click", () => {
        wordleLogic(key, "value"); // Anropa logikfunktionen med tangentens värde
        key.blur(); // Ta bort fokus från tangenten
      });
    }

    document.addEventListener("keydown", (e) => {
      // Lägg till event-listener för tangenttryckningar
      wordleLogic(e, "key"); // Anropa logikfunktionen med tangentens namn
    });

    const allCorrect = (row) => {
      // Markera alla celler i en rad som korrekta
      for (let i = 0; i < 5; i++) {
        gridRows[row].children[i].classList.add("correct-cell"); // Lägg till klass för correkt cell
      }
    };

    const colorLetterCells = (wordList, row) => {
      // Färga cellerna baserat på gissningen
      let cells = gridRows[row].children; // Hämta cellerna i den aktuella raden
      for (let i = 0; i < 5; i++) {
        // Kontrollera varje bokstav
        if (wordArray[i] === wordList[i]) {
          // Om bokstaven är korrekt
          cells[i].classList.add("correct-cell"); // Lägg till klass för korrekt cell
          colorKey(wordArray[i].toUpperCase(), "green"); // Färga tangenten grön
        }
      }

      for (let i = 0; i < 5; i++) {
        // Kontrollera för bokstäver som är korrekta men på fel plats
        for (let j = 0; j < 5; j++) {
          if (wordArray[i] === wordList[j]) {
            if (!cells[j].classList.contains("correct-cell")) {
              // Om cellen inte redan är korrekt
              cells[j].classList.add("correct-letter-wrong-cell"); // Lägg till klass för felaktig cell
              colorKey(wordArray[i].toUpperCase(), "yellow"); // Färga tangenten gul
            }
          }
        }
      }

      for (let i = 0; i < 5; i++) {
        // Färga celler som är felaktiga
        if (
          !(
            cells[i].classList.contains("correct-cell") ||
            cells[i].classList.contains("correct-letter-wrong-cell")
          )
        ) {
          cells[i].classList.add("wrong-cell"); // Lägg till klass för felaktig cell
          colorKey(cells[i].textContent, "gray"); // Färga tangenten grå
        }
      }
    };

    const isCharacterALetter = (char) => {
      // Kontrollera om tecknet är en bokstav
      return /[a-zA-Z]/.test(char); // Returnera sant om det är en bokstav
    };

    const colorKey = (key, color) => {
      // Färga tangenten baserat på resultatet
      for (let k of keys) {
        if (k.id === key) {
          // Kontrollera om tangenten matchar
          if (color === "green") {
            // Om färgen är grön
            k.classList.add("correct-key"); // Lägg till klass för korrekt tangent
            k.style.backgroundColor = "rgba(94, 233, 106, 0.596)"; // Sätt bakgrundsfärg
          } else if (color === "yellow" && k.className != "correct-key") {
            // Om färgen är gul för att bokstaven är rätt men på fel plats
            k.style.backgroundColor = "rgba(219, 219, 76, 0.596)"; // Sätt bakgrundsfärg
          } else if (color === "gray") {
            // Om färgen är grå
            k.style.backgroundColor = "#111"; // Sätt bakgrundsfärg
          }
        }
      }
    };

    const fillCell = (cell) => {
      // Fyll cellen med animation
      cell.classList.add("big-cell"); // Lägg till klass för att förstora cellen
      setTimeout(() => {
        cell.classList.remove("big-cell"); // Ta bort klassen efter en kort stund
      }, 200);
    };
  })
  .catch((err) => {
    console.log("Error in fetching word"); // Logga fel om hämtning misslyckas
  });
