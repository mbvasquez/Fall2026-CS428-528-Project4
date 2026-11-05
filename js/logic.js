// Initialize variables and character sets
const lowerAlphabet = "abcdefghijklmnopqrstuvwxyz";
const upperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
let useLowercase = true;
let useUppercase = true;
let useNumbers = true;
let useSymbols = false;
const passwordText = document.getElementById("password");
const lengthInput = document.getElementById("length");
const slider = document.querySelector(".c-pwd-gen__slider");
const sliderDecrementBtn = document.querySelector(".c-pwd-gen--decrement");
const sliderIncrementBtn = document.querySelector(".c-pwd-gen--increment");

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

// Event listener for the copy button 
$('#copyBtn').click(function () {
    copyText();
});

function copyText() {
    navigator.clipboard.writeText(passwordText.value)
    .then(() => {
        $('#copy').text('Copied!');
        setTimeout(() => {
            $('#copy').text('Copy');
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
    passwordText.value = generatePassword(value, useLowercase, useUppercase, useNumbers, useSymbols);
}

// Listen for input changes (real-time sliding)
slider.addEventListener('input', updateSliderBackground);

sliderDecrementBtn.addEventListener('click', () => {
    slider.value = Math.max(parseInt(slider.value) - 1, parseInt(slider.min));
    updateSliderBackground();
});

sliderIncrementBtn.addEventListener('click', () => {
    slider.value = Math.min(parseInt(slider.value) + 1, parseInt(slider.max));
    updateSliderBackground();
});

// Generate a new password when the page loads
updateSliderBackground();
passwordText.value = generatePassword(20, useLowercase, useUppercase, useNumbers, useSymbols);


