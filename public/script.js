const firebaseConfig = {
  apiKey: "AIzaSyAJf8USgSPgEPOF3YltKpO4F4DQVfVMgDM",
  authDomain: "simplechatapp-bb706.firebaseapp.com",
  databaseURL: "https://simplechatapp-bb706-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "simplechatapp-bb706",
  storageBucket: "simplechatapp-bb706.appspot.com",
  messagingSenderId: "106804331153",
  appId: "1:106804331153:web:8601b1047b6750d5987530"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("messages");
const auth = firebase.auth();

let username = "";

// Authentication Functions
function signUp() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signed up successfully!");
      document.getElementById("auth-area").style.display = "none";
      document.getElementById("username-area").style.display = "block";
    })
    .catch(error => alert(error.message));
}

function signIn() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signed in successfully!");
      document.getElementById("auth-area").style.display = "none";
      document.getElementById("username-area").style.display = "block";
    })
    .catch(error => alert(error.message));
}

// Monitor Auth State
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("signout-btn").style.display = "inline-block"; // Show sign out button
    if (username === "") {
      // Try to load username from localStorage
      username = localStorage.getItem("chatUsername") || "";
    }
    if (username === "") {
      document.getElementById("username-area").style.display = "block";
      document.getElementById("chat-container").style.display = "none";
    } else {
      document.getElementById("username-area").style.display = "none";
      document.getElementById("chat-container").style.display = "flex";
    }
  } else {
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("username-area").style.display = "none";
    document.getElementById("chat-container").style.display = "none";
    document.getElementById("signout-btn").style.display = "none"; // Hide sign out button
    username = "";
  }
});

// Username Setup
function setUsername() {
  const input = document.getElementById("usernameInput");
  if (input.value.trim() !== "") {
    username = input.value.trim();
    localStorage.setItem("chatUsername", username);
    document.getElementById("username-area").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
  } else {
    alert("Please enter a username");
  }
}

// Format timestamp into "HH:MM AM/PM"
function formatTimestamp(ts) {
  const date = new Date(ts);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

// Send Message
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value;
  if (message.trim() !== "" && username !== "") {
    messagesRef.push({
      username: username,
      text: message,
      timestamp: Date.now()
    });
    messageInput.value = "";
  } else if (username === "") {
    alert("Please set a username first.");
  }
}

// Listen for new messages
messagesRef.on("child_added", function(snapshot) {
  const data = snapshot.val();
  const chatBox = document.getElementById("chat-box");

  const messageDiv = document.createElement("div");
  
  const timeStr = formatTimestamp(data.timestamp);

  // Style differently if the message is from the current user
  if (data.username === username) {
    messageDiv.style.alignSelf = "flex-end";
    messageDiv.style.backgroundColor = "#d0f0fd";
  } else {
    messageDiv.style.alignSelf = "flex-start";
    messageDiv.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  }

  messageDiv.style.padding = "5px 10px";
  messageDiv.style.margin = "5px";
  messageDiv.style.borderRadius = "10px";
  messageDiv.style.maxWidth = "70%";
  messageDiv.style.wordWrap = "break-word";

  messageDiv.innerHTML = `<strong>${data.username}:</strong> ${data.text} <span style="font-size: 0.75em; color: gray; float: right; margin-left: 10px;">${timeStr}</span>`;
  chatBox.appendChild(messageDiv);

  chatBox.scrollTop = chatBox.scrollHeight;
});


// Theme toggle
const themeToggleBtn = document.getElementById("theme-toggle");

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
});

// Load theme and username on startup
window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  const savedUsername = localStorage.getItem("chatUsername");
  if (savedUsername) {
    username = savedUsername;
  }
};

// Send message when Enter key is pressed
document.getElementById("messageInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevents newline (optional)
    sendMessage();
  }
});

// Sign Out Functionality
document.getElementById("signout-btn").addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.removeItem("chatUsername");
    username = "";
    document.getElementById("auth-area").style.display = "block";
    document.getElementById("username-area").style.display = "none";
    document.getElementById("chat-container").style.display = "none";
    document.getElementById("signout-btn").style.display = "none";
    alert("Signed out successfully.");
  }).catch(error => {
    alert("Sign out error: " + error.message);
  });
});
