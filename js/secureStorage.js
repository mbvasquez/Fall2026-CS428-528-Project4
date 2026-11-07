(function () {
    "use strict";

    const STORAGE_KEY = "passwordGenerator.encryptedVault";
    const PBKDF2_ITERATIONS = 310000;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    function toBase64(bytes) {
        let binary = "";
        bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary);
    }

    function fromBase64(value) {
        const binary = atob(value);
        return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    }

    function getStoredVault() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            throw new Error("Encrypted vault storage is not available in this browser.");
        }
    }

    function readVault() {
        const stored = getStoredVault();
        if (stored === null) {
            return null;
        }

        let vault;
        try {
            vault = JSON.parse(stored);
        } catch (error) {
            throw new Error("The saved vault data is invalid.");
        }

        if (!vault || vault.version !== 1 || typeof vault.salt !== "string" ||
            typeof vault.iv !== "string" || typeof vault.ciphertext !== "string") {
            throw new Error("The saved vault data is invalid.");
        }
        return vault;
    }

    async function deriveKey(masterPassword, salt) {
        const passwordMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(masterPassword),
            "PBKDF2",
            false,
            ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: PBKDF2_ITERATIONS,
                hash: "SHA-256"
            },
            passwordMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    async function encryptEntries(entries, key, salt) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoder.encode(JSON.stringify(entries))
        );
        return {
            version: 1,
            salt: toBase64(salt),
            iv: toBase64(iv),
            ciphertext: toBase64(new Uint8Array(ciphertext))
        };
    }

    function decodeVault(vault) {
        let salt;
        let iv;
        let ciphertext;
        try {
            salt = fromBase64(vault.salt);
            iv = fromBase64(vault.iv);
            ciphertext = fromBase64(vault.ciphertext);
        } catch (error) {
            throw new Error("The saved vault data is invalid.");
        }

        if (salt.length !== 16 || iv.length !== 12 || ciphertext.length === 0) {
            throw new Error("The saved vault data is invalid.");
        }
        return { salt, iv, ciphertext };
    }

    async function decryptEntriesWithKey(key, vault) {
        const { iv, ciphertext } = decodeVault(vault);
        try {
            const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
            const entries = JSON.parse(decoder.decode(plaintext));
            if (!Array.isArray(entries) || entries.some((entry) =>
                !entry || typeof entry.website !== "string" ||
                typeof entry.username !== "string" || typeof entry.password !== "string")) {
                throw new Error("The saved vault data is invalid.");
            }
            return entries;
        } catch (error) {
            if (error instanceof DOMException && error.name === "OperationError") {
                throw new Error("The master password is incorrect or the vault data is damaged.");
            }
            if (error instanceof SyntaxError) {
                throw new Error("The saved vault data is invalid.");
            }
            throw error;
        }
    }

    async function decryptEntries(masterPassword, vault) {
        const { salt } = decodeVault(vault);
        const key = await deriveKey(masterPassword, salt);
        return decryptEntriesWithKey(key, vault);
    }

    async function getEntries(masterPassword) {
        const vault = readVault();
        if (!vault) {
            throw new Error("There are no saved passwords in this browser.");
        }
        return decryptEntries(masterPassword, vault);
    }

    async function unlock(masterPassword) {
        const vault = readVault();
        if (!vault) {
            throw new Error("There are no saved passwords in this browser.");
        }

        const { salt } = decodeVault(vault);
        const key = await deriveKey(masterPassword, salt);
        await decryptEntriesWithKey(key, vault);

        async function changeEntries(change) {
            const latestVault = readVault();
            if (!latestVault || latestVault.salt !== vault.salt) {
                throw new Error("The vault changed. Close it and unlock it again before making changes.");
            }

            const entries = await decryptEntriesWithKey(key, latestVault);
            change(entries);
            const encryptedVault = await encryptEntries(entries, key, salt);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedVault));
            } catch (error) {
                throw new Error("The encrypted vault could not be saved in this browser.");
            }
        }

        return {
            getEntries: async function () {
                const latestVault = readVault();
                if (!latestVault || latestVault.salt !== vault.salt) {
                    throw new Error("The vault changed. Close it and unlock it again to continue.");
                }
                return decryptEntriesWithKey(key, latestVault);
            },
            updateEntry: function (index, entry) {
                if (!Number.isInteger(index) || index < 0 ||
                    !entry || typeof entry.website !== "string" ||
                    typeof entry.username !== "string" || typeof entry.password !== "string") {
                    throw new Error("The password entry is invalid.");
                }
                return changeEntries((entries) => {
                    if (index >= entries.length) {
                        throw new Error("That password entry no longer exists.");
                    }
                    entries[index] = {
                        ...entries[index],
                        website: entry.website,
                        username: entry.username,
                        password: entry.password
                    };
                });
            },
            deleteEntry: function (index) {
                if (!Number.isInteger(index) || index < 0) {
                    throw new Error("The password entry is invalid.");
                }
                return changeEntries((entries) => {
                    if (index >= entries.length) {
                        throw new Error("That password entry no longer exists.");
                    }
                    entries.splice(index, 1);
                });
            }
        };
    }

    async function saveEntry(masterPassword, entry) {
        const vault = readVault();
        let entries = [];
        let salt;
        let key;

        if (vault) {
            entries = await decryptEntries(masterPassword, vault);
            salt = fromBase64(vault.salt);
            key = await deriveKey(masterPassword, salt);
        } else {
            salt = crypto.getRandomValues(new Uint8Array(16));
            key = await deriveKey(masterPassword, salt);
        }

        entries.push({
            website: entry.website,
            username: entry.username,
            password: entry.password,
            savedAt: new Date().toISOString()
        });

        const encryptedVault = await encryptEntries(entries, key, salt);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedVault));
        } catch (error) {
            throw new Error("The encrypted vault could not be saved in this browser.");
        }
    }

    window.PasswordVaultStorage = {
        hasVault: function () {
            return getStoredVault() !== null;
        },
        saveEntry,
        getEntries,
        unlock
    };
})();