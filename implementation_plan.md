# Implementation Plan - Password Combinatorics and Login Decision Tree

This plan outlines the changes needed to integrate two main features required by the assignment specs:
1. **Password Combinatorics Simulator ($S^N$)**: Calculate and visualize the search space of password combinations in the Cryptography Lab.
2. **Interactive Login Decision Tree**: Visual flowchart representing the conditional logic of login otentikasi ($L$) in the Login Form.

## User Review Required

> [!IMPORTANT]
> The features will be implemented purely in client-side React code so that it works seamlessly both with and without the mock backend. The visual style will match the existing dark glassmorphic design theme.

---

## Proposed Changes

### 1. Crypto Utility

#### [MODIFY] [crypto.js](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20(5)/MTK%20for%20real/src/utils/crypto.js)
* Add a new utility function `analyzePasswordCombinations(password)` to compute:
  * Length $N$ of password.
  * Character set size $S$ (detects lowercase `26`, uppercase `26`, numbers `10`, symbols `32`).
  * Total combinations $S^N$.
  * Entropy and estimated time to crack at $10^9$ guesses/second.

---

### 2. UI Components

#### [MODIFY] [CryptoLab.jsx](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20(5)/MTK%20for%20real/src/components/CryptoLab.jsx)
* Add a visual card section for **Kombinatorika Kekuatan Password ($S^N$)** inside the CryptoLab component.
* Display the breakdown of detected sets:
  * Numbers ($0-9$, size: 10)
  * Lowercase letters ($a-z$, size: 26)
  * Uppercase letters ($A-Z$, size: 26)
  * Symbols ($!@#\$...$, size: 32)
* Render the mathematical formula with current values, e.g., $62^8 = 2.18 \times 10^{14}$ combinations.
* Render a safety classification and estimated Brute Force cracking time.

#### [MODIFY] [LoginForm.jsx](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20(5)/MTK%20for%20real/src/components/LoginForm.jsx)
* Create an interactive **Pohon Keputusan (Decision Tree) Login** widget using SVG or CSS Flexbox inside the LoginForm panel.
* Connect decision nodes:
  * **Start** $\to$ **Credentials Valid? ($p$)** $\to$ **Account Active? ($q$)** $\to$ **Remember Device? ($r$)** $\to$ **Captcha Valid? ($s$)** $\to$ **Decision (Success / Denied)**.
* Highlight active nodes and branches in green (True path) or red (False path) in real-time as the user types username, password, checkbox, role, and captcha.

---

## Verification Plan

### Manual Verification
1. Run the application locally.
2. Open the **XOR Cryptography Lab** tab, type a password, and verify that the character set size ($S$), length ($N$), and total combinations ($S^N$) are computed and displayed correctly.
3. Open the login panel, type different usernames (e.g., `budi`, `siti`, `gede`), check/uncheck the "Remember Device" checkbox, and fill the Captcha.
4. Verify that the **Decision Tree** highlights the exact logical path taken based on the input values.
