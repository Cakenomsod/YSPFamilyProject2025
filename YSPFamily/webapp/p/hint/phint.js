import { auth, db } from "../../../login/firebase-login.js";
import {
  collection, getDocs, doc, setDoc, serverTimestamp, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {

  signOut
} from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';


const userEmailBtn = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

document.getElementById("sendBtn").addEventListener("click", handleSend);



logoutBtn.addEventListener("click", async () => {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("companionUser");
  localStorage.removeItem("companionUserOLD");
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
  loadChat();
}



const input = document.getElementById("messageInput");
input.addEventListener("keydown", async (event) => {

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    await handleSend(); // เรียกใช้ handleSend เมื่อกด Enter
  }

});






async function handleSend() {

  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (text === "") {
    alert("กรุณาพิมพ์ข้อความก่อนส่ง");
    return;
  }

  await sendMessageWithAutoNumber(text);
  input.value = ""; // เคลียร์ช่องพิมพ์

}

async function sendMessageWithAutoNumber(text, isImage = false) {

  const messagesRef = collection(db, "companion", compaID, "hint");
  const snapshot = await getDocs(messagesRef);
  const count = snapshot.size;
  const nextID = (count + 1).toString();

  await setDoc(
    doc(messagesRef, nextID),
    {
      text: text,
      timestamp: serverTimestamp()
    }
  );

}


function loadChat() {
  const chatBox = document.getElementById("chatBox");
  const yourRef = collection(db, "companion", compaID, "hint");

  // แผนที่สำหรับเก็บข้อความทั้งหมด
  let allMessagesMap = new Map();

  // ฟังก์ชันเรนเดอร์ข้อความลงหน้าเว็บ
  function renderMessages() {
    // เคลียร์กล่องข้อความก่อน
    chatBox.innerHTML = "";

    // เรียงข้อความตาม timestamp
    const sortedMessages = Array.from(allMessagesMap.values()).sort(
      (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
    );

    // วนลูปแสดงแต่ละข้อความ
    sortedMessages.forEach((msg) => {
      const messageElement = document.createElement("div");
      messageElement.className = "hint-message";
      messageElement.innerHTML = `<strong>พี่:</strong> ${msg.text}`;
      chatBox.appendChild(messageElement);
    });

    // เลื่อนลงล่างสุด
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // ฟังการเปลี่ยนแปลงใน Firestore
  onSnapshot(yourRef, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      allMessagesMap.set("P_" + doc.id, {
        ...data,
        sender: "P",
        id: doc.id,
      });
    });
    renderMessages();
  });
  console.log(yourRef);
}



