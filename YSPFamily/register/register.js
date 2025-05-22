import { auth, db } from '../login/firebase-login.js';
import {
  collection, getDocs, doc, setDoc, getDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

let user = null;
let selectedDocID = "";
let selectedPath = "";
let selectedData = {};
let level = "";

const levelSelect = document.getElementById("levelSelect");
const nameSelect = document.getElementById("nameSelect");
const aliasInput = document.getElementById("fakename");
const aliasContainer = document.getElementById("aliasContainer");
const summaryDiv = document.getElementById("summary");

// Step Navigation
function showStep(step) {
  document.querySelectorAll("fieldset").forEach((fs, idx) => {
    fs.classList.toggle("active", idx === step - 1);
  });
}

// STEP 1 → 2
document.getElementById("toStep2").addEventListener("click", async () => {
  level = levelSelect.value;
  if (!level) return alert("กรุณาเลือกระดับชั้น");

  let rolePath = "";
  if (level === "4") rolePath = "usersN";
  else if (level === "5") rolePath = "usersP";
  else if (level === "6") rolePath = "usersOLD"; // ✅ เพิ่มรองรับ ม.6
  else return alert("ระดับชั้นไม่ถูกต้อง");

  const colRef = collection(db, "users", "members", rolePath);
  const snapshot = await getDocs(colRef);

  nameSelect.innerHTML = '<option value="" disabled selected>เลือกชื่อของคุณ</option>';
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (!data.Email) {
      const opt = document.createElement("option");
      opt.value = docSnap.id;
      opt.textContent = `${data.Name} (${data.Nickname})`;
      nameSelect.appendChild(opt);
    }
  });

  selectedPath = rolePath;
  showStep(2);
});

// STEP 2 → 3
document.getElementById("toStep3").addEventListener("click", async () => {
  const docID = nameSelect.value;
  if (!docID) return alert("กรุณาเลือกชื่อของคุณ");

  selectedDocID = docID;
  const docRef = doc(db, "users", "members", selectedPath, docID);
  const docSnap = await getDoc(docRef);
  selectedData = docSnap.data();

  // ✅ เงื่อนไขที่มี alias (นามแฝง) คือเฉพาะ ม.5 กับ ม.6
  if (level === "5" || level === "6") {
    aliasContainer.style.display = "block";
    showStep(3);
  } else {
    aliasContainer.style.display = "none";
    aliasInput.value = "";
    showStep(4);
    fillSummary();
  }
});

// STEP 3 → 4
document.getElementById("toStep4").addEventListener("click", () => {
  const alias = aliasInput.value.trim();
  if ((level === "5" || level === "6") && !alias) return alert("กรุณากรอกนามแฝง");
  selectedData.Fakename = alias;
  fillSummary();
  showStep(4);
});

// Summary Fill
function fillSummary() {
  summaryDiv.innerHTML = `
    <p><strong>ชื่อ:</strong> ${selectedData.Name}</p>
    <p><strong>ชื่อเล่น:</strong> ${selectedData.Nickname}</p>
    ${(level === "5" || level === "6") ? `<p><strong>นามแฝง:</strong> ${aliasInput.value}</p>` : ""}
    <p><strong>ระดับชั้น:</strong> ม.${level}</p>
  `;
}

// SUBMIT (register)
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!user || !selectedDocID || !selectedPath) return alert("เกิดข้อผิดพลาด");

  let companionID = selectedDocID;

  if (level === "5") {
    const idNum = parseInt(selectedDocID);
    if (idNum === 4) {
      companionID = "36";
    } else if (idNum > 4) {
      companionID = String(idNum - 1);
    }
  }

  try {
    // ✅ 1. บันทึกข้อมูลผู้ใช้
    const docRef = doc(db, "users", "members", selectedPath, selectedDocID);
    await setDoc(docRef, {
      Email: user.email,
      ...(level === "5" || level === "6" ? { Fakename: aliasInput.value } : {})
    }, { merge: true });

    // ✅ 2. อัปเดต companion ตามระดับชั้น
    if (level === "5") {
      const companionDocRef = doc(db, "companion", "Dual" + companionID);
      await setDoc(companionDocRef, {
        EmailM5: user.email
      }, { merge: true });

    } else if (level === "4") {
      const q = query(collection(db, "companion"), where("M4", "==", Number(companionID)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("ไม่พบข้อมูลคู่รหัสสำหรับเลขที่น้องนี้");
        return;
      }

      const docSnap = querySnapshot.docs[0];
      const companionDocRef = doc(db, "companion", docSnap.id);
      await setDoc(companionDocRef, {
        EmailM4: user.email
      }, { merge: true });

    } else if (level === "6") {
      const q = query(collection(db, "companion"), where("M6", "==", Number(companionID)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("ไม่พบข้อมูลคู่รหัสสำหรับเลขที่น้องนี้");
        return;
      }
      const docSnap = querySnapshot.docs[0];

      const companionDocRef = doc(db, "companion", docSnap.id);
      await setDoc(companionDocRef, {
        EmailM6: user.email
      }, { merge: true });

    }

    alert("ลงทะเบียนสำเร็จ!");
    window.location.href = "../index.html";
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
});


// ตรวจสอบผู้ใช้
onAuthStateChanged(auth, u => {
  if (u) {
    user = u;
  } else {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "../index.html";
  }
});
