



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

const yearInput = document.getElementById("yearInput");
const startYearInput = document.getElementById("startYearInput");
const result = document.getElementById("result");
const gamespeedRadios = document.querySelectorAll('input[name="gameSpeed"]');



function validateInputs(input) {
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
    const [minTurns, maxTurns] = get_turn(value, gameSpeed, gameSpeedsData);
    console.log(`Start year turns: ${minTurns} to ${maxTurns}`);
    return [minTurns === maxTurns, minTurns];
}

function execute_calculation() {
    const years = validateInputs(yearInput.value);
    const [isValid, StartYearTurn] = validateStartYear(startYearInput.value);
    const gameSpeed = document.querySelector('input[name="gameSpeed"]:checked').value;
    
    if (!isValid) {
        result.textContent = `Invalid start year: "${startYearInput.value}".`;
        return;
    }
    let res = '';
    for (const { value, valid } of years) {
        if (!valid) {
            res += `Invalid input: "${value}". Please enter integers between -3000 and 2025, separated by commas, semicolons, or spaces.\n`;
        }
        else {
            const [minTurns, maxTurns] = get_turn(value, gameSpeed, gameSpeedsData);
            if (minTurns === maxTurns) {
                res += `Turns it takes from year ${startYearInput.value} to year ${value}: ${minTurns - StartYearTurn}\n`;
            } else {
                res += `Turns it takes from year ${startYearInput.value} to year ${value}: between ${minTurns- StartYearTurn} and  ${maxTurns- StartYearTurn}\n`;
            }
        }
    }
    result.textContent = res.trim();

}




yearInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        execute_calculation();
    }
});

yearInput.addEventListener("input", (event) => {
    execute_calculation();
});

yearInput.addEventListener("input", () => {
    yearInput.value = yearInput.value.replace(/[^0-9,\s;-]/g, '');
});

startYearInput.addEventListener("input", () => {
    startYearInput.value = startYearInput.value.replace(/[^0-9-]/g, '');
});
startYearInput.addEventListener("input", () => {
    execute_calculation();
});

gamespeedRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        execute_calculation();
    });
});





