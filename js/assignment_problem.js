const calcBtn = window["calculate-button"];
let employees = Array.from(document.querySelectorAll("#maximum-table .row-title"));
employees.forEach((elem, i) => employees[i] = elem.innerText);
let works = Array.from(document.querySelectorAll("#maximum-table .column-title"));
works.forEach((elem, i) => works[i] = elem.innerText);
let nominationData = [];

window["min-button"].addEventListener("click", (e) => {
    // обробляємо подію натискання на кнопку для вибору задачі на мінімум
    clearOutputBlock();
    // очищуємо блок виводу та робимо кнопку максимуму активною
    window["max-button"].classList.remove("selected");
    window["max-button"].disabled = false;
    // деактивуємо кнопку мінімуму
    e.target.classList.add("selected");
    e.target.disabled = true;
    window["minimum-table"].classList.remove("hidden")
    window["maximum-table"].classList.add("hidden");
    window["final-res"].innerText = "";
    // отримуємо співробітників із таблиці на мінімум
    employees = Array.from(document.querySelectorAll("#minimum-table .row-title"));
    employees.forEach((elem, i) => employees[i] = elem.innerText);
    // отримуємо роботи із таблиці на мінімум
    works = Array.from(document.querySelectorAll("#minimum-table .column-title"));
    works.forEach((elem, i) => works[i] = elem.innerText);
    window["table__title"].innerText = e.target.innerText;
})

window["max-button"].addEventListener("click", (e) => {
    // обробляємо подію натискання на кнопку для вибору задачі на максимум
    clearOutputBlock();
    // очищуємо блок виводу та робимо кнопку мінімуму активною
    window["min-button"].classList.remove("selected");
    window["min-button"].disabled = false;
    // деактивуємо кнопку максимуму
    e.target.classList.add("selected");
    e.target.disabled = true;
    window["maximum-table"].classList.remove("hidden");
    window["minimum-table"].classList.add("hidden");
    window["final-res"].innerText = "";
    // отримуємо співробітників із таблиці на максимум
    employees = Array.from(document.querySelectorAll("#maximum-table .row-title"));
    employees.forEach((elem, i) => employees[i] = elem.innerText);
    // отримуємо роботи із таблиці на максимум
    works = Array.from(document.querySelectorAll("#maximum-table .column-title"));
    works.forEach((elem, i) => works[i] = elem.innerText);
    window["table__title"].innerText = e.target.innerText;
})

calcBtn.addEventListener("click", () => {
    clearOutputBlock();
    let nominationDirection;
    // заповнюємо матрицю значеннями із таблиць задачі для максимуму або мінімуму (в залежності від того, яка кнопка
    // натиснута)
    if (window["max-button"].classList.contains("selected")) {
        const maxInputs = document.getElementsByClassName("maximum-input");
        let twoArrIndex = -1;
        nominationData.length = 0;
        nominationDirection = "max";
        for (let i = 0; i < maxInputs.length; i++) {
            if (i % 4 === 0) {
                nominationData.push([]);
                twoArrIndex++;
            }
            nominationData[twoArrIndex].push(parseInt(maxInputs[i].value, 10));
        }
    } else {
        const minInputs = document.getElementsByClassName("minimum-input");
        let twoArrIndex = -1;
        nominationData.length = 0;
        nominationDirection = "min";
        for (let i = 0; i < minInputs.length; i++) {
            if (i % 5 === 0) {
                nominationData.push([]);
                twoArrIndex++;
            }
            nominationData[twoArrIndex].push(parseInt(minInputs[i].value, 10));
        }
    }

    const [nomination, total] = dynamicNomination(nominationData.map((val, ind) => ind), nominationDirection);
    for (let k = 0; k < Object.keys(nomination).length; k++) {
        // кожну ітерацію створюємо елемент із тегом p та заповнюємо текстом (зміст - призначення кожного із
        // співробітників)
        let outputParagraph = document.createElement("p");
        outputParagraph.classList.add("output-paragraph");
        outputParagraph.innerText = `${employees[k]} — ${works[nomination[k]].split(", ")[0]}`
        window["output-data-block"].insertBefore(outputParagraph, window["final-res"]);
    }
    if (nominationDirection === "min")
        window["final-res"].innerText = `Мінімальна кількість годин для розробки сайту: ${total}`;
    else
        window["final-res"].innerText = `Максимальна можлива кількість зібраних комп'ютерів за 1 день: ${total}`;
})

const dynamicNomination = (emps, nomDirection) => {
    // ініціюємо об'єкт для збереження поточних призначень
    let bNom = getNominationObject();
    if (emps.length === 1) {
        // базовий случай - функцію викликаємо з одним працівником та одразу повертаємо призначення та значення
        bNom[emps[0]] = 0;
        return [bNom, nominationData[emps[0]][0]];
    }
    // ініціюємо змінні для збереження крайніх (мінімальних або максимальних) значень
    let extremeEmpIndex;
    let extremeVal;
    // перевіряємо обраний режим (min, max) та привласнюємо для extremeVal відповідно значення Infinity або -Infinity
    if (nomDirection === "min")
        extremeVal = Infinity;
    else
        extremeVal = -Infinity;
    for (let i = 0; i < emps.length; ++i) {
        // масив, необхідний для рекурсивного виклику функції. Якщо розглядаємо i-го співробітника, у масив зберігаємо інших
        let bArr = [];
        for (let j = 0; j < emps.length; ++j) {
            if (j === i) continue;
            bArr.push(emps[j])
        }
        // після рекурсивного виклику отримуємо оптимальне (на цьому рівні) призначення та значення ефективності
        // працівника на минулій роботі
        const [nom, val] = dynamicNomination(bArr, nomDirection);
        let currVal = nominationData[emps[i]][emps.length - 1] + val;
        if (nomDirection === "min") {
            // якщо функція - на мінімум, то шукаємо мінімальне значення
            if (currVal < extremeVal) {
                extremeVal = currVal;
                extremeEmpIndex = emps[i];
                nom[extremeEmpIndex] = emps.length - 1;
                bNom = nom;
            }
        } else {
            // якщо функція - на максимум, то шукаємо максимальне значення
            if (currVal > extremeVal) {
                extremeVal = currVal;
                extremeEmpIndex = emps[i];
                nom[extremeEmpIndex] = emps.length - 1;
                bNom = nom;
            }
            // Якщо значення задовільняє умові порівняння, то функція, за допомогою якої було обчислено це поточне
            // значення, має оптимальне призначення. Його і зберігаємо на поточному рівні
        }
    }
    return [bNom, extremeVal]
}

function getNominationObject() {
    // ініціємо об'єкт та заповнюємо його ключами, кількість яких дорівнює довжині вхідного масиву, із значеннями null
    let obj = {}
    for (let i = 0; i < nominationData.length; ++i) {
        obj[i] = null;
    }
    return obj
}

function clearOutputBlock() {
    // очищуємо всі елементи блоку виведення, окрім #final-res
    while (window["output-data-block"].firstChild !== window["final-res"]) {
        window["output-data-block"].removeChild(window["output-data-block"].firstChild);
    }
}

