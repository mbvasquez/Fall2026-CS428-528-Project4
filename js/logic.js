// Character sets
const lowerAlphabet = "abcdefghijklmnopqrstuvwxyz";
const upperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

// Strength Test Library
const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'poiuytrewqlkjhgfdsamnbvcxz', 'qwertyuiopasdfghjklzxcvbnm', '09876543210', 'zyxwvutsrqponmlkjihgfedcba'];

// Configurable options
const useLowercase = document.getElementById("lowercase");
const useUppercase = document.getElementById("uppercase");
const useNumbers = document.getElementById("numbers");
const useSymbols = document.getElementById("specials");
let numBoxesChecked = 0;
const avoidAmbiguous = document.getElementById("ambiguous");
const passwordText = document.getElementById("password");
const lengthInput = document.getElementById("length");
const slider = document.querySelector(".c-pwd-gen__slider");
const sliderDecrementBtn = document.querySelector(".c-pwd-gen--decrement");
const sliderIncrementBtn = document.querySelector(".c-pwd-gen--increment");

// Refresh and copy buttons
const refreshBtn = document.getElementById("refreshBtn");
const copyBtn = document.getElementById("copyBtn");

// Secure storage variables
const saveBtn = document.getElementById("saveBtn");
const saveDialog = document.getElementById("saveDialog");
const saveForm = document.getElementById("saveForm");
const websiteInput = document.getElementById("websiteInput");
const usernameInput = document.getElementById("usernameInput");
const savedPasswordInput = document.getElementById("savedPasswordInput");
const masterPasswordInput = document.getElementById("masterPasswordInput");
const confirmMasterPasswordInput = document.getElementById("confirmMasterPasswordInput");
const confirmMasterPasswordField = document.getElementById("confirmMasterPasswordField");
const vaultInstructions = document.getElementById("vaultInstructions");
const saveError = document.getElementById("saveError");
const saveStatus = document.getElementById("saveStatus");
const cancelSaveBtn = document.getElementById("cancelSaveBtn");
const viewVaultBtn = document.getElementById("viewVaultBtn");
const vaultDialog = document.getElementById("vaultDialog");
const vaultUnlockForm = document.getElementById("vaultUnlockForm");
const vaultMasterPasswordInput = document.getElementById("vaultMasterPasswordInput");
const vaultUnlockInstructions = document.getElementById("vaultUnlockInstructions");
const vaultError = document.getElementById("vaultError");
const vaultEntries = document.getElementById("vaultEntries");
const closeVaultBtn = document.getElementById("closeVaultBtn");
const strengthVeryWeak = document.getElementById("veryWeak");
const strengthWeak = document.getElementById("weak");
const strengthGood = document.getElementById("good");
const strengthStrong = document.getElementById("strong");
const strengthVeryStrong = document.getElementById("veryStrong");
let unlockedVault = null;

// Random password generator function
function generatePassword(length, useLowercase, useUppercase, useNumbers, useSymbols, avoidAmbiguous) {
    let characters = "";
    if (useLowercase) characters += lowerAlphabet;
    if (useUppercase) characters += upperAlphabet;
    if (useNumbers) characters += numbers;
    if (useSymbols) characters += symbols;
    if (avoidAmbiguous) {
        characters = characters.replace(/[lI10O|]/g, '');
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        // Cryptographically secure random number generator
        const range = Math.floor(0x100000000 / characters.length) * characters.length;
        const randomValue = new Uint32Array(1);
        do {
            crypto.getRandomValues(randomValue);
        } while (randomValue[0] >= range);
        const randomIndex = randomValue[0] % characters.length;
        password += characters[randomIndex];
    }
    evaluatePasswordStrength(password);
    return password;
}

function evaluatePasswordStrength(password) {
    
    const length = password.length;
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

    let entropy = length * (Math.log(poolSize || 1) / Math.log(2));
    let normalizedPassword = password.toLowerCase();
    for (const seq of SEQUENCES) {
        for (let i = 0; i <= seq.length - 3; i++) {
            const subSeq = seq.substring(i, i + 3);
            if (normalizedPassword.includes(subSeq)) {
                entropy -= 5;
            }
        }
    }

    const repeats = password.match(/(.)\1{2,}/g);
    if (repeats) {
        entropy -= (repeats.join('').length * 2);
    }

    entropy = Math.max(0, Math.round(entropy));
    if (entropy < 25) { strengthVeryWeak.style="display: block;"; strengthWeak.style="display: none;"; strengthGood.style="display: none;"; strengthStrong.style="display: none;"; strengthVeryStrong.style="display: none;";}
    else if (entropy >= 25 && entropy < 40) { strengthVeryWeak.style="display: none;"; strengthWeak.style="display: block;"; strengthGood.style="display: none;"; strengthStrong.style="display: none;"; strengthVeryStrong.style="display: none;"; }
    else if (entropy >= 40 && entropy < 60) { strengthVeryWeak.style="display: none;"; strengthWeak.style="display: none;"; strengthGood.style="display: block;"; strengthStrong.style="display: none;"; strengthVeryStrong.style="display: none;"; }
    else if (entropy >= 60 && entropy < 80) { strengthVeryWeak.style="display: none;"; strengthWeak.style="display: none;"; strengthGood.style="display: none;"; strengthStrong.style="display: block;"; strengthVeryStrong.style="display: none;"; }
    else if (entropy >= 80) { strengthVeryWeak.style="display: none;"; strengthWeak.style="display: none;"; strengthGood.style="display: none;"; strengthStrong.style="display: none;"; strengthVeryStrong.style="display: block;"; } 

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

// Event listener for length slider
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
    passwordText.value = generatePassword(value, useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
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
    passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
});

// Event listeners for checkboxes
useLowercase.addEventListener('change', () => {
    useLowercase.checked = document.getElementById("lowercase").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useLowercase.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
});

useUppercase.addEventListener('change', () => {
    useUppercase.checked = document.getElementById("uppercase").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useUppercase.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
});

useNumbers.addEventListener('change', () => {
    useNumbers.checked = document.getElementById("numbers").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useNumbers.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
});

useSymbols.addEventListener('change', () => {
    useSymbols.checked = document.getElementById("specials").checked;
    checkNumBoxesChecked();
    if (numBoxesChecked === 0) {
        useSymbols.checked = true;
    }
    else passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
});

avoidAmbiguous.addEventListener('change', () => {
    avoidAmbiguous.checked = document.getElementById("ambiguous").checked;
    passwordText.value = generatePassword(parseInt(slider.value), useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
});

// Event listener for the copy button 
copyBtn.addEventListener('click', function () {
    copyText();
});

// Event listener for the save button
saveBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let isNewVault;
    try {
        isNewVault = !PasswordVaultStorage.hasVault();
    } catch (error) {
        saveStatus.textContent = error.message || "Encrypted vault storage is not available.";
        return;
    }

    saveForm.reset();
    saveError.hidden = true;
    saveError.textContent = "";
    saveStatus.textContent = "";
    savedPasswordInput.value = passwordText.value;
    confirmMasterPasswordField.hidden = !isNewVault;
    confirmMasterPasswordInput.required = isNewVault;
    masterPasswordInput.autocomplete = isNewVault ? "new-password" : "current-password";
    vaultInstructions.textContent = isNewVault
        ? "Create a master password to protect your password entries (at least 12 characters)."
        : "Enter your master password to unlock your encrypted vault.";
    masterPasswordInput.minLength = isNewVault ? 12 : 1;
    saveDialog.showModal();
    websiteInput.focus();
});

cancelSaveBtn.addEventListener('click', () => {
    saveDialog.close();
});

saveDialog.addEventListener('close', () => {
    masterPasswordInput.value = "";
    confirmMasterPasswordInput.value = "";
});

// Secure storage event listeners
saveForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    saveError.hidden = true;
    saveError.textContent = "";

    let isNewVault;
    try {
        isNewVault = !PasswordVaultStorage.hasVault();
    } catch (error) {
        saveError.textContent = error.message || "Encrypted vault storage is not available.";
        saveError.hidden = false;
        return;
    }

    if (isNewVault && masterPasswordInput.value !== confirmMasterPasswordInput.value) {
        saveError.textContent = "The master passwords do not match.";
        saveError.hidden = false;
        confirmMasterPasswordInput.focus();
        return;
    }

    if (!websiteInput.value.trim() || !usernameInput.value.trim()) {
        saveError.textContent = "Enter both a website and a username.";
        saveError.hidden = false;
        (websiteInput.value.trim() ? usernameInput : websiteInput).focus();
        return;
    }

    const submitButton = saveForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
        await PasswordVaultStorage.saveEntry(masterPasswordInput.value, {
            website: websiteInput.value.trim(),
            username: usernameInput.value.trim(),
            password: savedPasswordInput.value
        });
        saveDialog.close();
        saveBtn.textContent = "Saved!"
        
        setTimeout(() => {
            saveBtn.textContent = "Save";
        }, 2000);
        
    } catch (error) {
        saveError.textContent = error.message || "Unable to save the password.";
        saveError.hidden = false;
    } finally {
        submitButton.disabled = false;
        masterPasswordInput.value = "";
        confirmMasterPasswordInput.value = "";
    }
});

viewVaultBtn.addEventListener('click', () => {
    try {
        if (!PasswordVaultStorage.hasVault()) {
            alert("There are no saved passwords in this browser yet.");
            return;
        }
    } catch (error) {
        saveStatus.textContent = error.message || "Encrypted vault storage is not available.";
        return;
    }

    vaultUnlockForm.reset();
    unlockedVault = null;
    vaultUnlockForm.hidden = false;
    vaultUnlockInstructions.hidden = false;
    vaultEntries.hidden = true;
    vaultEntries.replaceChildren();
    vaultError.hidden = true;
    vaultError.textContent = "";
    vaultDialog.showModal();
    vaultMasterPasswordInput.focus();
});

vaultUnlockForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    vaultError.hidden = true;
    vaultError.textContent = "";

    const submitButton = vaultUnlockForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
        unlockedVault = await PasswordVaultStorage.unlock(vaultMasterPasswordInput.value);
        const entries = await unlockedVault.getEntries();
        renderVaultEntries(entries);
        vaultUnlockForm.hidden = true;
        vaultUnlockInstructions.hidden = true;
        vaultEntries.hidden = false;
    } catch (error) {
        unlockedVault = null;
        vaultError.textContent = error.message || "Unable to unlock the vault.";
        vaultError.hidden = false;
    } finally {
        submitButton.disabled = false;
        vaultMasterPasswordInput.value = "";
    }
});


// Build vault entries within the modal popup
function renderVaultEntries(entries) {
    vaultEntries.replaceChildren();
    if (entries.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = "There are no saved passwords in this vault.";
        vaultEntries.append(emptyMessage);
        return;
    }

    entries.forEach((entry, index) => {
        const card = document.createElement('article');
        card.className = "vault-entry";
        card.dataset.index = String(index);

        const details = document.createElement('div');
        details.className = "vault-entry__details";
        const website = document.createElement('p');
        website.textContent = "Website: ";
        const websiteText = document.createElement('span');
        websiteText.className = "vault-entry__text";
        websiteText.textContent = `${entry.website}`;
        const username = document.createElement('p');
        username.textContent = "Username: ";
        const usernameText = document.createElement('span');
        usernameText.className = "vault-entry__text";
        usernameText.textContent = `${entry.username}`;
        const password = document.createElement('p');
        password.className = "vault-entry__password";
        password.textContent = `Password: `;
        const passwordText = document.createElement('span');
        passwordText.className = "vault-entry__text";
        passwordText.textContent = `${entry.password}`;
        const actions = document.createElement('div');
        actions.className = "vault-entry__actions";
        const editButton = document.createElement('button');
        editButton.className = "vault-dialog__button";
        editButton.type = "button";
        editButton.dataset.vaultAction = "edit";
        editButton.textContent = "Edit";
        const deleteButton = document.createElement('button');
        deleteButton.className = "vault-dialog__button";
        deleteButton.type = "button";
        deleteButton.dataset.vaultAction = "delete";
        deleteButton.textContent = "Delete";
        website.append(websiteText);
        username.append(usernameText);
        password.append(passwordText);
        actions.append(editButton, deleteButton);
        details.append(website, username, password, actions);

        const editForm = document.createElement('form');
        editForm.className = "vault-entry__edit-form vault-dialog__form";
        editForm.hidden = true;
        editForm.innerHTML = `
            <label class="vault-dialog__field">
                Website
                <input name="website" type="text" autocomplete="url" required>
            </label>
            <label class="vault-dialog__field">
                Username
                <input name="username" type="text" autocomplete="username" required>
            </label>
            <label class="vault-dialog__field">
                Password
                <input name="password" type="text" autocomplete="off" required>
            </label>
            <div class="vault-entry__actions">
                <button class="vault-dialog__button vault-dialog__button--primary" type="submit">Save changes</button>
                <button class="vault-dialog__button" type="button" data-vault-action="cancel-edit">Cancel</button>
            </div>
        `;
        editForm.elements.website.value = entry.website;
        editForm.elements.username.value = entry.username;
        editForm.elements.password.value = entry.password;

        const deleteConfirmation = document.createElement('div');
        deleteConfirmation.className = "vault-entry__delete-confirmation";
        deleteConfirmation.hidden = true;
        const confirmationText = document.createElement('p');
        confirmationText.textContent = "Delete this saved password? This cannot be undone.";
        const confirmationActions = document.createElement('div');
        confirmationActions.className = "vault-entry__actions";
        const confirmDeleteButton = document.createElement('button');
        confirmDeleteButton.className = "vault-dialog__button vault-dialog__button--primary";
        confirmDeleteButton.type = "button";
        confirmDeleteButton.dataset.vaultAction = "confirm-delete";
        confirmDeleteButton.textContent = "Delete password";
        const cancelDeleteButton = document.createElement('button');
        cancelDeleteButton.className = "vault-dialog__button";
        cancelDeleteButton.type = "button";
        cancelDeleteButton.dataset.vaultAction = "cancel-delete";
        cancelDeleteButton.textContent = "Keep password";
        confirmationActions.append(confirmDeleteButton, cancelDeleteButton);
        deleteConfirmation.append(confirmationText, confirmationActions);

        card.append(details, editForm, deleteConfirmation);
        vaultEntries.append(card);
    });
}

// Edit and delete functionality
vaultEntries.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-vault-action]');
    if (!button) {
        return;
    }

    const card = button.closest('.vault-entry');
    const details = card.querySelector('.vault-entry__details');
    const editForm = card.querySelector('.vault-entry__edit-form');
    const deleteConfirmation = card.querySelector('.vault-entry__delete-confirmation');
    const action = button.dataset.vaultAction;

    if (action === "edit") {
        details.hidden = true;
        deleteConfirmation.hidden = true;
        editForm.hidden = false;
        editForm.elements.website.focus();
    } else if (action === "cancel-edit") {
        details.hidden = false;
        editForm.hidden = true;
    } else if (action === "delete") {
        details.hidden = true;
        editForm.hidden = true;
        deleteConfirmation.hidden = false;
    } else if (action === "cancel-delete") {
        details.hidden = false;
        deleteConfirmation.hidden = true;
    } else if (action === "confirm-delete") {
        button.disabled = true;
        vaultError.hidden = true;
        try {
            await unlockedVault.deleteEntry(Number(card.dataset.index));
            renderVaultEntries(await unlockedVault.getEntries());
        } catch (error) {
            vaultError.textContent = error.message || "Unable to delete the password.";
            vaultError.hidden = false;
            button.disabled = false;
        }
    }
});

vaultEntries.addEventListener('submit', async (event) => {
    const form = event.target.closest('.vault-entry__edit-form');
    if (!form) {
        return;
    }
    event.preventDefault();

    const card = form.closest('.vault-entry');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    vaultError.hidden = true;
    try {
        await unlockedVault.updateEntry(Number(card.dataset.index), {
            website: form.elements.website.value.trim(),
            username: form.elements.username.value.trim(),
            password: form.elements.password.value
        });
        renderVaultEntries(await unlockedVault.getEntries());
    } catch (error) {
        vaultError.textContent = error.message || "Unable to update the password.";
        vaultError.hidden = false;
        submitButton.disabled = false;
    }
});

closeVaultBtn.addEventListener('click', () => {
    vaultDialog.close();
});

vaultDialog.addEventListener('close', () => {
    unlockedVault = null;
    vaultMasterPasswordInput.value = "";
    vaultEntries.replaceChildren();
    vaultEntries.hidden = true;
    vaultUnlockForm.hidden = false;
    vaultUnlockInstructions.hidden = false;
    vaultError.hidden = true;
    vaultError.textContent = "";
});

// Generate a new password when the page loads
updateSliderBackground();
passwordText.value = generatePassword(20, useLowercase.checked, useUppercase.checked, useNumbers.checked, useSymbols.checked, avoidAmbiguous.checked);
