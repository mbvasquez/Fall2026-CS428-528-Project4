// Initialize variables and character sets
const lowerAlphabet = "abcdefghijklmnopqrstuvwxyz";
const upperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
const useLowercase = document.getElementById("randompasswordgenerator-ec93b6dceb-lowercase");
const useUppercase = document.getElementById("randompasswordgenerator-ec93b6dceb-uppercase");
const useNumbers = document.getElementById("randompasswordgenerator-ec93b6dceb-numbers");
const useSymbols = document.getElementById("randompasswordgenerator-ec93b6dceb-specials");
let numBoxesChecked = 0;
const passwordText = document.getElementById("password");
const lengthInput = document.getElementById("length");
const slider = document.querySelector(".c-pwd-gen__slider");
const sliderDecrementBtn = document.querySelector(".c-pwd-gen--decrement");
const sliderIncrementBtn = document.querySelector(".c-pwd-gen--increment");
const refreshBtn = document.getElementById("refreshBtn");
const copyBtn = document.getElementById("copyBtn");

// Random password generator function
function generatePassword(length, useLowercase, useUppercase, useNumbers, useSymbols) {
    let characters = "";
    if (useLowercase) characters += lowerAlphabet;
    if (useUppercase) characters += upperAlphabet;
    if (useNumbers) characters += numbers;
    if (useSymbols) characters += symbols;

    let password = "";
    for (let i = 0; i < length; i++) {
        // Replace Math.random() with a more secure random number generator
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

function copyText() {
    navigator.clipboard.writeText(passwordText.value)
    .then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
}

// Event lister for length slider
function updateSliderBackground() {
    const min = parseFloat(slider.min) || 1;
    const max = parseFloat(slider.max) || 50;
    const value = parseFloat(slider.value);
    
    // Calculate the exact percentage of the filled portion
    const percentage = ((value - min) / (max - min)) * 100;
    
    // Update the inline linear-gradient style
    slider.style.background = `linear-gradient(to right, rgb(0, 112, 246) 0%, rgb(0, 112, 246) ${percentage}%, rgb(255, 255, 255) ${percentage}%, white 100%)`;

    // Update the displayed length value
    lengthInput.textContent = value;
    passwordText.value = generatePassword(value, useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
}

// Check how many checkboxes are checked
function checkNumBoxesChecked() {
    numBoxesChecked = 0;
    if (useLowercase.checked) numBoxesChecked++;
    if (useUppercase.checked) numBoxesChecked++;
    if (useNumbers.checked) numBoxesChecked++;
    if (useSymbols.checked) numBoxesChecked++;
}

// Listen for input changes
slider.addEventListener('input', updateSliderBackground);

// Event listeners for increment and decrement buttons
sliderDecrementBtn.addEventListener('click', () => {
    slider.value = Math.max(parseInt(slider.value) - 1, parseInt(slider.min));
    updateSliderBackground();
});

sliderIncrementBtn.addEventListener('click', () => {
    slider.value = Math.min(parseInt(slider.value) + 1, parseInt(slider.max));
    updateSliderBackground();
});

// Event listener for refresh button
refreshBtn.addEventListener('click', () => {
    passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
});

// Event listeners for checkboxes
useLowercase.addEventListener('change', () => {
    useLowercase.checked = document.getElementById("randompasswordgenerator-ec93b6dceb-lowercase").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useLowercase.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
});

useUppercase.addEventListener('change', () => {
    useUppercase.checked = document.getElementById("randompasswordgenerator-ec93b6dceb-uppercase").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useUppercase.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
});

useNumbers.addEventListener('change', () => {
    useNumbers.checked = document.getElementById("randompasswordgenerator-ec93b6dceb-numbers").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useNumbers.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
});

useSymbols.addEventListener('change', () => {
    useSymbols.checked = document.getElementById("randompasswordgenerator-ec93b6dceb-specials").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useSymbols.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
});

// Event listener for the copy button 
copyBtn.addEventListener('click', function () {
    copyText();
});

// Generate a new password when the page loads
updateSliderBackground();
passwordText.value = generatePassword(20, useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked);
