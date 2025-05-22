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
  localStorage.removeItem("companionUserM.4");
  localStorage.removeItem("companionUserM.5");
  await signOut(auth);
  window.location.href = "../../../index.html";
});

const usersDataRaw = localStorage.getItem("loggedInUser");
const usersDataPRaw = localStorage.getItem("companionUserM.5");
const usersDataNRaw = localStorage.getItem("companionUserM.4");


const usersData = JSON.parse(usersDataRaw);
const usersDataN = JSON.parse(usersDataNRaw);
const usersDataP = JSON.parse(usersDataPRaw);


console.log("Logged in user :", usersData);
console.log("companionUserM.5", usersDataN);
console.log("companionUserM.4", usersDataP);

let usersFakename = usersData.Fakename;
let usersNumber = usersData.Number;

let PNumber = usersDataP.NumberData;
let PFakename = usersDataP.Fakename;

let NNumber = usersDataN.Number;
let NNickname = usersDataN.Nickname;

userEmailBtn.textContent = usersData.Email;

loadChat();


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

  const messagesRef = collection(db, "chat", "members", "usersOLD", usersNumber, "messages");
  const snapshot = await getDocs(messagesRef);
  const count = snapshot.size;
  const nextID = (count + 1).toString();

  await setDoc(
    doc(messagesRef, nextID),
    {
      text: text,
      timestamp: serverTimestamp(),
      isImage: isImage,
    }
  );

}



async function loadChat() {
  const chatBox = document.getElementById("chatBox");
  const yourRef = collection(db, "chat", "members", "usersOLD", usersNumber, "messages");
  const NRef = collection(db, "chat", "members", "usersN", NNumber, "messages");
  const PRef = collection(db, "chat", "members", "usersP", PNumber, "messages");

  let allMessagesMap = new Map();

  function renderMessages() {
  const allMessages = Array.from(allMessagesMap.values());
  const sorted = allMessages.sort((a, b) => {
    const timeA = a.timestamp?.toMillis?.() || 0;
    const timeB = b.timestamp?.toMillis?.() || 0;
    return timeA - timeB;
  });

  chatBox.innerHTML = "";
  sorted.forEach((msg) => {
    const div = document.createElement("div");
    div.classList.add("chat-message");
    //P = P(other), N = N(other), O = you
    div.classList.add(msg.sender === "O" ? "you" : "other");

    const timeStr = msg.timestamp?.toDate().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit"
    }) || "รอส่ง...";

    const content = msg.isImage
      ? `<img src="${msg.text}" alt="image" style="max-width:100%; border-radius:8px;">`
      : `<div class="message-text">${msg.text}</div>`;

    div.innerHTML = `
      <div class="sender-name">
        ${msg.sender === "O" ? usersFakename : 
            msg.sender === "P" ? PFakename : 
            NNickname}
        </div>
      ${content}
      <div class="timestamp">${timeStr}</div>
    `;

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}
  onSnapshot(yourRef, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      allMessagesMap.set("O_" + doc.id, { ...data, sender: "O", id: doc.id });
    });
    renderMessages();
  });

  onSnapshot(NRef, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      allMessagesMap.set("N_" + doc.id, { ...data, sender: "N", id: doc.id });
    });
    renderMessages();
  });

  onSnapshot(PRef, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      allMessagesMap.set("P_" + doc.id, { ...data, sender: "P", id: doc.id });
    });
    renderMessages();
  });
}







document.getElementById("uploadImageBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];

  // ตรวจสอบว่าได้เลือกไฟล์หรือยัง
  if (!file) {
    alert("กรุณาเลือกไฟล์ก่อนอัปโหลด");
    return;
  }

  // ปิดปุ่มอัปโหลดเพื่อป้องกันการกดซ้ำ
  const uploadButton = document.getElementById("uploadImageBtn");
  uploadButton.disabled = true; // ปิดปุ่ม

  // แสดงสถานะกำลังส่ง
  const statusMessage = document.createElement("div");
  statusMessage.id = "statusMessage";
  statusMessage.textContent = "กำลังส่งรูป...";
  document.body.appendChild(statusMessage); // สามารถเพิ่มสถานะที่ตำแหน่งใดๆ

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "YSPFamily"); // ✅ preset จริง

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dyunh7cfy/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!data.secure_url) {
      console.error("⛔ ไม่ได้ secure_url:", data);
      alert("ไม่สามารถอัปโหลดรูปได้ (secure_url หาย)");
      return;
    }

    console.log("✅ อัปโหลดสำเร็จ:", data.secure_url);

    await sendMessageWithAutoNumber(data.secure_url, true); // ส่ง URL ของรูป
    fileInput.value = ""; // เคลียร์ input

  } catch (err) {
    console.error("❌ อัปโหลดรูปผิดพลาด:", err);
    alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
  } finally {
    // เปิดปุ่มเมื่อการอัปโหลดเสร็จ
    uploadButton.disabled = false;
    statusMessage.textContent = "อัปโหลดเสร็จสิ้น";
    setTimeout(() => {
      statusMessage.remove(); // ลบสถานะหลังจากการอัปโหลดเสร็จ
    }, 3000); // ลบข้อความหลัง 3 วินาที
  }
});

