import { auth, db } from "../../../login/firebase-login.js";
import {
  collection, getDocs, doc, setDoc, serverTimestamp, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {

  signOut
} from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';


const userEmailBtn = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("companionUserM.4");
  localStorage.removeItem("companionUserM.5");
  await signOut(auth);
  window.location.href = "../../../index.html";
});

const usersDataRaw = localStorage.getItem("loggedInUser");
const usersData = JSON.parse(usersDataRaw);
console.log("Logged in user :", usersData);


userEmailBtn.textContent = usersData.Email;


let compaID = usersData.companionID;
console.log(compaID);


if(compaID){

  loadHints();

}

function loadHints() {
  const chatBox = document.getElementById("chatBox"); // กล่องที่จะแสดงคำใบ้
  const hintRef = collection(db, "companion", compaID, "hint");

  onSnapshot(hintRef, (snapshot) => {
    const hints = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      hints.push({ ...data, id: doc.id });
    });

    // เรียงตาม timestamp
    hints.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);

    // แสดงผล
    chatBox.innerHTML = "";
    hints.forEach((hint) => {
      const messageElement = document.createElement("div");
      messageElement.className = "hint-message";
      messageElement.innerHTML = `<strong>พี่:</strong> ${hint.text}`;
      chatBox.appendChild(messageElement);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
  console.log(hintRef);
}


