import { auth, provider, db } from './firebase-login.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

localStorage.removeItem("loggedInUser");
localStorage.removeItem("companionUser");

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  if (isInAppBrowser()) {
    alert("❌ ไม่สามารถเข้าสู่ระบบผ่านแอป LINE, Facebook หรือ Instagram ได้\n\n✅ กรุณาเปิดเว็บไซต์นี้ผ่าน Chrome หรือ Safari แล้วลองใหม่อีกครั้ง");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    datausers(user.email);
  } catch (error) {
    console.error("Login failed:", error);
    alert("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
  }
});

  function isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /FBAN|FBAV|Instagram|Line/i.test(ua);
  }

  if (isInAppBrowser()) {
    document.querySelector(".login").style.display = "none";
    document.getElementById("inAppBrowserBlock").style.display = "block";
  }

async function datausers(email) {
  const usersNRef = collection(db, "users", "members", "usersN");
  const usersPRef = collection(db, "users", "members", "usersP");
  const usersOLDRef = collection(db, "users", "members", "usersOLD");

  const [snapshotN, snapshotP, snapshotOLD] = await Promise.all([
    getDocs(usersNRef),
    getDocs(usersPRef),
    getDocs(usersOLDRef),
  ]);

  let foundOLD = false;
  let foundP = false;
  let foundN = false;

  let userDocData = null;
  let compaID = null;
  let Emailcompa = null;
  let EmailcompaOLD = null;

  let EmailcompaN;
  let EmailcompaP;

  snapshotN.forEach(data => {
    const datasave = data.data();
    if (datasave.Email === email) {
      userDocData = datasave;
      userDocData.Number = data.id;
      foundN = true;
    }
  });

  snapshotP.forEach(data => {
    const datasave = data.data();
    if (datasave.Email === email) {
      userDocData = datasave;
      userDocData.Number = data.id;
      foundP = true;
    }
  });

  snapshotOLD.forEach(data => {
    const datasave = data.data();
    if (datasave.Email === email) {
      userDocData = datasave;
      userDocData.Number = data.id;
      foundOLD = true;
    }
  });

  let companionCol;

  if (foundN) {
    companionCol = query(
      collection(db, "companion"),
      where("EmailM4", "==", email)
    );
  }

  if (foundP) {
    companionCol = query(
      collection(db, "companion"),
      where("EmailM5", "==", email)
    );
  }

  if (foundOLD) {
    companionCol = query(
      collection(db, "companion"),
      where("EmailM6", "==", email)
    );
  }

  if (foundN || foundP || foundOLD) {
    const companion = await getDocs(companionCol);

    if (!companion.empty) {
      const compadata = companion.docs[0].data();
      compaID = companion.docs[0].id;

      if (foundN) {
        Emailcompa = compadata.EmailM5;
        EmailcompaOLD = compadata.EmailM6;
      }
      if (foundP) {
        Emailcompa = compadata.EmailM4;
        EmailcompaOLD = compadata.EmailM6;
      }

      if(foundOLD) {
        EmailcompaN = compadata.EmailM4;
        EmailcompaP = compadata.EmailM5;

      }


    } else {
      console.warn("ไม่พบข้อมูล companion สำหรับ email นี้");
      compaID = null;
      Emailcompa = null;
    }

  } else {
    window.location.href = "../register/register.html";
    return; // หยุดทำงานต่อ
  }


  if (foundN) {

    const companionColP = query(
      collection(db, "users", "members", "usersP"),
      where("Email", "==", Emailcompa)
    );

    const companionColOLD = query(
      collection(db, "users", "members", "usersOLD"),
      where("Email", "==", EmailcompaOLD)
    );

    const companionP = await getDocs(companionColP);
    const companionOLD = await getDocs(companionColOLD);

    if (companionP.empty) {
      alert("ไม่พบข้อมูลพี่รหัส");
      return;
    }

    if(companionOLD.empty){
      alert("พี่แก่ๆหาย!!!");
      return;
    }

    const userDocDataP = companionP.docs[0].data();
    const usersDocDataOLD = companionOLD.docs[0].data();


    const numberP = companionP.docs[0].id;
    const numberOLD = companionOLD.docs[0].id;

    let numberPafter;
    if (numberP === 4) {
      numberPafter = 36;
    } else if (numberP > 4) {
      numberPafter = numberP - 1;
    } else {
      numberPafter = numberP;
    }

    let usersData = {
      Email: userDocData.Email,
      Name: userDocData.Name,
      Nickname: userDocData.Nickname,
      Number: userDocData.Number,
      companionID: compaID
    };

    let usersDataP = {
      Fakename: userDocDataP.Fakename,
      NumberData: numberP,         //เลขที่ในคลัง
      NumberClass: numberPafter    //เลขที่ในห้อง
    };

    let usersDataOLD = {
      Fakename: usersDocDataOLD.Fakename,
      Number: numberOLD
    }

    localStorage.setItem("loggedInUser", JSON.stringify(usersData));
    localStorage.setItem("companionUser", JSON.stringify(usersDataP));
    localStorage.setItem("companionUserOLD", JSON.stringify(usersDataOLD));

    
    window.location.href = "../webapp/home.html";


  } else if (foundP) {

    const companionColN = query(
      collection(db, "users", "members", "usersN"),
      where("Email", "==", Emailcompa)
    );

    const companionColOLD = query(
      collection(db, "users", "members", "usersOLD"),
      where("Email", "==", EmailcompaOLD)
    );


    const companionN = await getDocs(companionColN);
    const companionOLD = await getDocs(companionColOLD);

    if (companionN.empty) {
      alert("ไม่พบน้องรหัส");
      return;
    }

    
    if(companionOLD.empty){
      alert("พี่แก่ๆหาย!!!");
      return;
    }

    const userDocDataN = companionN.docs[0].data();
    const usersDocDataOLD = companionOLD.docs[0].data();

    const numberP = userDocData.Number;
    const numberOLD = companionOLD.docs[0].id;

    let numberPafter;
    if (numberP === "4") {
      numberPafter = 36;
    } else if (numberP > "4") {
      numberPafter = numberP - 1;
    } else {
      numberPafter = numberP;
    }

    let usersData = {
      Email: userDocData.Email,
      Name: userDocData.Name,
      Nickname: userDocData.Nickname,
      Fakename: userDocData.Fakename,
      NumberData: numberP,
      NumberClass: numberPafter,
      companionID: compaID
    };

    let usersDataN = {
      Email: userDocDataN.Email,
      Name: userDocDataN.Name,
      Nickname: userDocDataN.Nickname,
      Number: companionN.docs[0].id
    };

    let usersDataOLD = {
      Email: usersDocDataOLD.Email,
      Nickname: usersDocDataOLD.Nickname,
      Number: numberOLD,
      Fakename: usersDocDataOLD.Fakename
    }

    localStorage.setItem("loggedInUser", JSON.stringify(usersData));
    localStorage.setItem("companionUser", JSON.stringify(usersDataN));
    localStorage.setItem("companionUserOLD", JSON.stringify(usersDataOLD));


    window.location.href = "../webapp/home.html";



  } else if (foundOLD) {

    const companionColN = query(
      collection(db, "users", "members", "usersN"),
      where("Email", "==", EmailcompaN)
    );

    const companionColP = query(
      collection(db, "users", "members", "usersP"),
      where("Email", "==", EmailcompaP)
    );

    const companionP = await getDocs(companionColP);
    const companionN = await getDocs(companionColN);

    if (companionN.empty) {
      alert("น้องม.4หายค้าบ");
      return;
    }

    
    if(companionP.empty){
      alert("น้องม.5หายค้าบ");
      return;
    }

    const userDocDataN = companionN.docs[0].data();
    const userDocDataP = companionP.docs[0].data();

    const numberP = parseInt(companionP.docs[0].id);

    let numberPafter;
    if (numberP === "4") {
      numberPafter = 36;
    } else if (numberP > "4") {
      numberPafter = numberP - 1;
    } else {
      numberPafter = numberP;
    }

    let usersData = {
      Email: userDocData.Email,
      Nickname: userDocData.Nickname,
      Number: userDocData.Number,
      Fakename: userDocData.Fakename,
      companionID: compaID
    };



    let usersDataN = {
      Email: userDocDataN.Email,
      Name: userDocDataN.Name,
      Nickname: userDocDataN.Nickname,
      Number: companionN.docs[0].id,
      
    };

    let usersDataP = {
      Name: userDocDataP.Name,
      Nickname: userDocDataP.Nickname,
      Fakename: userDocDataP.Fakename,
      NumberData: companionP.docs[0].id,
      NumberClass: (companionP.docs[0].id === "4") ? 36 : ((companionP.docs[0].id > 4) ? companionP.docs[0].id - 1 : companionP.docs[0].id)
    };

    localStorage.setItem("loggedInUser", JSON.stringify(usersData));
    localStorage.setItem("companionUserM.4", JSON.stringify(usersDataN));
    localStorage.setItem("companionUserM.5", JSON.stringify(usersDataP));
    
    window.location.href = "../webapp/home.html";


  } else {
    alert("ไม่พบคู่รหัสที่ตรงกับข้อมูลของคุณ");
  }
}
