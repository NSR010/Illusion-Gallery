
// We are importing the necessary functions from the official Firebase CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// for new user:import getdoc to read a single document for our login check
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// --- our firebase configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyA7rb5OXdQ2tbD296ZAJxmddDQ6kI9YSok",
    authDomain: "gallery-of-wonders.firebaseapp.com",
    projectId: "gallery-of-wonders",
    storageBucket: "gallery-of-wonders.firebasestorage.app",
    messagingSenderId: "1099019550255",
    appId: "1:1099019550255:web:6cbbdf1f333373ae6e50da"
};

// --- initialize database ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("Firebase Initialized Successfully!");


let loginForm, signupForm, toggleLoginButton, toggleSignupButton, messageBox, loadingIndicator, recoverLink;


// --- ui function helper ---
const showMessage = (message, isError = false) => {
    messageBox.textContent = message;
    messageBox.className = `mt-4 p-3 rounded-lg text-white font-semibold transition-all duration-300 ${isError ? 'bg-red-600' : 'bg-green-600'}`;
    messageBox.style.display = 'block';
    setTimeout(() => { messageBox.style.display = 'none'; }, 5000);
};
const setLoading = (isLoading) => {
    loadingIndicator.classList.toggle('hidden', !isLoading);
    document.querySelectorAll('button[type="submit"], a').forEach(el => el.style.pointerEvents = isLoading ? 'none' : 'auto');
};
const toggleView = (showLogin) => {
    loginForm.classList.toggle('hidden', !showLogin);
    signupForm.classList.toggle('hidden', showLogin);
    toggleLoginButton.classList.toggle('toggle-active', showLogin);
    toggleSignupButton.classList.toggle('toggle-active', !showLogin);
    messageBox.style.display = 'none';
};


//--authentication functions ---
// Note: The signup function has been modified to include a setup flag and redirect to setup page.
// The login function has been modified to check the setup flag and redirect accordingly.

const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const username = document.getElementById('signup-username').value;

    if (password !== confirmPassword) {
        showMessage("Error: Passwords do not match.", true);
        setLoading(false);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });

        //changes for setup page redirection
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            username,
            email,
            createdAt: new Date().toISOString(),
            profileSetupComplete: false // New flag to track setup completion
        });
        

        showMessage(`Welcome, ${username}! Let's set up your profile.`, false);
        setTimeout(() => {
            window.location.href = "../setup/setup.html";
        }, 1500);
        // ------------------------------------

    } catch (error) {
        console.error("Signup failed:", error);
        let errorMessage = "An unknown error occurred during signup.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password must be at least 6 characters long.';
        }
        showMessage(`Signup Error: ${errorMessage}`, true);
        setLoading(false);
    }
};
// The login function has been modified to check the setup flag and redirect accordingly.
const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

       
        // After login, we check Firestore to see if the user has completed setup.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().profileSetupComplete) {
            // If setup IS complete, go to the dashboard.
            showMessage("Login successful! Redirecting to your dashboard...", false);
            setTimeout(() => {
                window.location.href = "../dashboard/dashboard.html";
            }, 1500);
        } else {
            // If setup is NOT complete, go to the setup page.
            showMessage("Login successful! Let's finish setting up your profile...", false);
            setTimeout(() => {
                window.location.href = "../setup/setup.html";
            }, 1500);
        }
        // ------------------------------------

    } catch (error) {
        console.error("Login failed:", error);
        showMessage('Login Error: Invalid email or password.', true);
        setLoading(false); // Only re-enable form on error
    }
};

// --- PASSWORD RECOVERY ---
const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    const email = prompt("Please enter the email address for your account:");

    if (email) {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            showMessage("Password reset email sent! Please check your inbox.", false);
        } catch (error) {
            console.error("Password reset failed:", error);
            showMessage("Error: Could not send reset email. Please check the address.", true);
        } finally {
            setLoading(false);
        }
    }
};


// --- INITIALIZATION ---

const main = () => {
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    toggleLoginButton = document.getElementById('toggle-login');
    toggleSignupButton = document.getElementById('toggle-signup');
    messageBox = document.getElementById('message-box');
    loadingIndicator = document.getElementById('loading-indicator');
    recoverLink = document.getElementById('recover-link');

    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    toggleLoginButton.addEventListener('click', () => toggleView(true));
    toggleSignupButton.addEventListener('click', () => toggleView(false));
    recoverLink.addEventListener('click', handlePasswordRecovery);

    toggleView(true);
};

// This is the entry point. It waits for the HTML to be loaded before running our script.
document.addEventListener("DOMContentLoaded", main);

