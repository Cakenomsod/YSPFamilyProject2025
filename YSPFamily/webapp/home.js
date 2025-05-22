import { auth} from '../login/firebase-login.js';
import {onAuthStateChanged,  signOut} from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';

const nameEl = document.getElementById("name");
const nicknameEl = document.getElementById("nickname");
const emailEl = document.getElementById("email");

const littleNameEl = document.getElementById("littleName");
const littleNicknameEl = document.getElementById("littleNickname");
const littlenumberEl = document.getElementById("littleNumber");

const OLDNicknameEl = document.getElementById("OLDNickname");
const OLDNumberEl = document.getElementById("OLDNumber");

const PNameEl = document.getElementById("PName");
const PNicknameEl = document.getElementById("PNickname");
const PNumberEl = document.getElementById("PNumber");
const PFakenameEl = document.getElementById("PFakename");

const userEmailBtn = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");


let role = "P";




const usersDataRaw = localStorage.getItem("loggedInUser");

const usersData = JSON.parse(usersDataRaw);


if(usersData.Fakename === undefined){
  role = "N";
}else if(usersData.Name === undefined){
  role = "O";
}

userEmailBtn.textContent = usersData.Email || "-";
nameEl.textContent = usersData.Name || "-";
nicknameEl.textContent = usersData.Nickname || "-";
emailEl.textContent = usersData.Email || "-";

if(role === "P"){
  document.getElementById("littleContainer").style.display = "block";
  document.getElementById("OLDContainer").style.display = "block";

  const usersDataNRaw = localStorage.getItem("companionUser");
  const usersDataOLDRaw = localStorage.getItem("companionUserOLD");

  const usersDataN = JSON.parse(usersDataNRaw);
  const usersDataO = JSON.parse(usersDataOLDRaw);

  console.log("Role:", role);
  console.log("Logged in user:", usersData);
  console.log("Companion user:", usersDataN);
  console.log("Companion OLD:", usersDataO);

  littleNameEl.textContent = usersDataN.Name || "-";
  littleNicknameEl.textContent = usersDataN.Nickname || "-";
  littlenumberEl.textContent = usersDataN.Number || "-";

  OLDNicknameEl.textContent = usersDataO.Nickname || "-";
  OLDNumberEl.textContent = usersDataO.Number || "-";

  hintLink.href = "./p/hint/phint.html";
  chatLink.href = "./p/chat/pchat.html";

  logoutBtn.addEventListener("click", async () => {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("companionUser");
  localStorage.removeItem("companionUserOLD");
  await signOut(auth);
  window.location.href = "../index.html";
});

}else if(role === "N"){
  const usersDataPRaw = localStorage.getItem("companionUser");
  const usersDataOLDRaw = localStorage.getItem("companionUserOLD");

  const usersDataN = JSON.parse(usersDataPRaw);
  const usersDataO = JSON.parse(usersDataOLDRaw);

  console.log("Role:", role);
  console.log("Logged in user:", usersData);

  hintLink.href = "./n/hint/nhint.html";
  chatLink.href = "./n/chat/nchat.html";

  logoutBtn.addEventListener("click", async () => {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("companionUser");
  localStorage.removeItem("companionUserOLD");
  await signOut(auth);
  window.location.href = "../index.html";
});

}else if(role === "O"){
  document.getElementById("littleContainer").style.display = "block";
  document.getElementById("PContainer").style.display = "block";

  const usersDataNRaw = localStorage.getItem("companionUserM.4");
  const usersDataPRaw = localStorage.getItem("companionUserM.5");

  const usersDataN = JSON.parse(usersDataNRaw);
  const usersDataP = JSON.parse(usersDataPRaw);

  console.log("Role:", role);
  console.log("Logged in user:", usersData);
  console.log("Companion N:", usersDataN);
  console.log("Companion P:", usersDataP);

  littleNameEl.textContent = usersDataN.Name || "-";
  littleNicknameEl.textContent = usersDataN.Nickname || "-";
  littlenumberEl.textContent = usersDataN.Number || "-";

  PNameEl.textContent = usersDataP.Name || "-";
  PNicknameEl.textContent = usersDataP.Nickname || "-";
  PFakenameEl.textContent = usersDataP.Fakename || "-";
  PNumberEl.textContent = usersDataP.NumberClass || "-";

  hintLink.href = "./o/hint/ohint.html";
  chatLink.href = "./o/chat/ochat.html";

  logoutBtn.addEventListener("click", async () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("companionUserM.4");
    localStorage.removeItem("companionUserM.5");
    await signOut(auth);
    window.location.href = "../index.html";
  });

}