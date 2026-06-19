
const modes = {
    YearToTurn: {
        labels: [
            "Start Year",
            "Year(s)"
        ],
        values: [
            "-3000",
            ""
        ],
        placeholders: [
            "e.g. -3000",
            "Values from -3000 to 2025, separated by commas, semicolons or spaces, are allowed.",
            "The number of turns will be shown here."
        ],
        executeCalculation: execute_YearToTurn_calculation,
        sanitizeFromInput: sanitizeStartYearInput,
        sanitizeToInput: sanitizeYearInput
    },

    TurnToYear: {
        labels: [
            "Start Turn",
            "Turn(s)"
        ],
        values: [
            "0",
            ""
        ],
        placeholders: [
            "e.g. 0",
            "Values > 0, separated by commas, semicolons or spaces, are allowed.",
            "The year(s) will be shown here."
        ],
        executeCalculation: execute_TurnToYear_calculation,
        sanitizeFromInput: sanitizeStartTurnInput,
        sanitizeToInput: sanitizeTurnInput
    }
};


async function load_game_speeds() {
    const response = await fetch("game_speeds.json");
    const data = await response.json();

    for (const [gamespeed, eras] of Object.entries(data)) {
        let StartYear = -3000;

        for (const era of eras) {
            era.iMonthIncrement = parseInt(era.iMonthIncrement, 10);
            era.iTurnsPerIncrement = parseInt(era.iTurnsPerIncrement, 10);
            era.totalyears = (era.iMonthIncrement * era.iTurnsPerIncrement) / 12;
            era.StartYear = StartYear;

            StartYear += era.totalyears;
        }
    }
    return data;
}

function get_turn(year, gameSpeed, gameSpeedsData) {
    const eras = gameSpeedsData[gameSpeed];
    let turns_passed = 0;
    for (const era of eras) {
        if (year > era.StartYear + era.totalyears) {
            turns_passed += era.iTurnsPerIncrement;
        }

        if (year >= era.StartYear && year <= era.StartYear + era.totalyears) {
            const turns_min = Math.floor(((year - era.StartYear) * 12) / era.iMonthIncrement);
            const turns_max = Math.ceil(((year - era.StartYear) * 12) / era.iMonthIncrement);
            return [turns_passed + turns_min, turns_passed + turns_max];
        }
    }
    return null;
}

// loading game speeds data from json file
const gameSpeedsData = await load_game_speeds();
console.log(gameSpeedsData);

const ToInput = document.getElementById("ToInput");
const FromInput = document.getElementById("FromInput");
const result = document.getElementById("result");
const FromLabel = document.querySelector('label[for="FromInput"]');
const ToLabel = document.querySelector('label[for="ToInput"]');
const gamespeedRadios = document.querySelectorAll('input[name="gameSpeed"]');
const calculationTypeRadios = document.querySelectorAll('input[name="calculationType"]');

let currentValue = document.querySelector('input[name="calculationType"]:checked').value;
let currentMode = modes[currentValue];
updateUI();

calculationTypeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        currentValue = document.querySelector('input[name="calculationType"]:checked').value;
        currentMode = modes[currentValue];
        updateUI();
    });
})
function updateUI() {
    FromLabel.textContent = currentMode.labels[0];
    ToLabel.textContent = currentMode.labels[1];
    FromInput.value = currentMode.values[0];
    ToInput.value = currentMode.values[1];
    FromInput.placeholder = currentMode.placeholders[0];
    ToInput.placeholder = currentMode.placeholders[1];
    result.textContent = currentMode.placeholders[2];
}


function validateInputYears(input) {
    const parts = input
        .split(/[,\s;]+/)
        .filter(Boolean);
    const results = [];
    for (const part of parts) {
        const isInt = /^-?\d+$/.test(part);
        let value = null;
        let valid = false;
        if (isInt) {
            value = Number(part);
            valid = value >= -3000 && value <= 2025;
        }
        results.push({
            value: isInt ? Number(part) : part,
            valid
        });
    }
    return results;
}

function validateStartYear(input) {
    const value = Number(input);
    const gameSpeed = document.querySelector('input[name="gameSpeed"]:checked').value;
    if (get_turn(value, gameSpeed, gameSpeedsData) === null) {
        return [false, null];
    }
    const [minTurns, maxTurns] = get_turn(value, gameSpeed, gameSpeedsData);
    
    console.log(`Start year turns: ${minTurns} to ${maxTurns}`);
    return [minTurns === maxTurns, maxTurns];
    
}

function execute_YearToTurn_calculation() {
    const years = validateInputYears(ToInput.value);
    const [isValid, MaxStartYearTurn] = validateStartYear(FromInput.value);
    if (MaxStartYearTurn === null) {
        result.textContent = `Invalid start year: "${FromInput.value}". Please enter an integer between -3000 and 2025.`;
        return;
    }
    const gameSpeed = document.querySelector('input[name="gameSpeed"]:checked').value;
    
    // if (!isValid) {
    //     result.textContent = `Invalid start year: "${FromInput.value}".`;
    //     return;
    // }
    let res = '';
    for (const { value, valid } of years) {
        if (!valid) {
            res += `Invalid input: "${value}". Please enter integers between -3000 and 2025, separated by commas, semicolons, or spaces.\n`;
        }
        else {
            const [minTurns, maxTurns] = get_turn(value, gameSpeed, gameSpeedsData);
            
            if (minTurns === maxTurns) {
                res += `Turns it takes from year ${FromInput.value} to year ${value}: ${minTurns - MaxStartYearTurn}\n`;
            } else {
                res += `Turns it takes from year ${FromInput.value} to year ${value}: between ${minTurns- MaxStartYearTurn} and  ${maxTurns- MaxStartYearTurn}\n`;
            }
        }
    }
    result.textContent = res.trim();

}

function execute_TurnToYear_calculation() {
}


// input sanitization functions
function sanitizeYearInput() {
    ToInput.value = ToInput.value.replace(/[^0-9,\s;-]/g, '');
}
function sanitizeStartYearInput() {
    FromInput.value = FromInput.value.replace(/[^0-9-]/g, '');
}

function sanitizeStartTurnInput() {
    FromInput.value = FromInput.value.replace(/[^0-9]/g, '');
}
function sanitizeTurnInput() {
    ToInput.value = ToInput.value.replace(/[^0-9,\s;]/g, '');
}




// Event listeners

ToInput.addEventListener("input", (event) => {
    currentMode.sanitizeToInput();
    currentMode.executeCalculation();
});
FromInput.addEventListener("input", () => {
    currentMode.sanitizeFromInput();
    currentMode.executeCalculation();
});

gamespeedRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        currentMode.executeCalculation();
    });
})


ToInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        currentMode.executeCalculation();
    }
});





