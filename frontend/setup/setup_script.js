
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyA7rb5OXdQ2tbD296ZAJxmddDQ6kI9YSok",
    authDomain: "gallery-of-wonders.firebaseapp.com",
    projectId: "gallery-of-wonders",
    storageBucket: "gallery-of-wonders.firebasestorage.app",
    messagingSenderId: "1099019550255",
    appId: "1:1099019550255:web:6cbbdf1f333373ae6e50da"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in.
        currentUser = user;
        console.log("User is logged in:", user.uid);
    } else {
        // No user is signed in. Redirect them.
        console.log("No user logged in, redirecting...");
        window.location.href = '../signin_frontend/signin.html';
    }
});

const showMessage = (message, isError = false) => {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.className = `mt-4 p-3 rounded-lg text-white font-semibold transition-all duration-300 ${isError ? 'bg-red-600' : 'bg-green-600'}`;
    messageBox.style.display = 'block';
};


// --- form submission handler ---
const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
        showMessage("Error: You are not logged in.", true);
        return;
    }

    const setupForm = document.getElementById('setup-form');
    const submitButton = setupForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    // 1. Get the selected role
    const selectedRole = setupForm.querySelector('input[name="user-role"]:checked');
    if (!selectedRole) {
        showMessage("Please select your role.", true);
        submitButton.disabled = false;
        submitButton.textContent = "Complete Setup";
        return;
    }

    // 2. Get the selected interests
    const selectedInterests = Array.from(setupForm.querySelectorAll('input[name="user-interest"]:checked'))
                                  .map(checkbox => checkbox.value);

    if (selectedInterests.length === 0) {
        showMessage("Please select at least one interest.", true);
        submitButton.disabled = false;
        submitButton.textContent = "Complete Setup";
        return;
    }
     if (selectedInterests.length > 3) {
        showMessage("Please select no more than 3 interests.", true);
        submitButton.disabled = false;
        submitButton.textContent = "Complete Setup";
        return;
    }

    // 3. Prepare data to save to Firestore
    const userPreferences = {
        role: selectedRole.value,
        interests: selectedInterests,
        profileSetupComplete: true // A flag to prevent showing this page again
    };

    // 4. Save the data to the user's profile
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, userPreferences);

        showMessage("Profile updated! Redirecting to your dashboard...", false);
        
        // 5. Redirect to the dashboard
        setTimeout(() => {
            window.location.href = '../dashboard/dashboard.html';
        }, 2000);

    } catch (error) {
        console.error("Error updating profile: ", error);
        showMessage("An error occurred while saving your preferences.", true);
        submitButton.disabled = false;
        submitButton.textContent = "Complete Setup";
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    setupForm.addEventListener('submit', handleSetupSubmit);
});
