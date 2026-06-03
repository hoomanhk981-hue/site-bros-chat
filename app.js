import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* 🔥 Firebase Config (همون خودت) */
const firebaseConfig = {
  apiKey: "AIzaSyAXrgdDlLidZIlEirrXlMJl4iCTnwnFQV0",
  authDomain: "site-bros-chat3.firebaseapp.com",
  projectId: "site-bros-chat3",
  storageBucket: "site-bros-chat3.firebasestorage.app",
  messagingSenderId: "861204300432",
  appId: "1:861204300432:web:44c74610dd1a5b04c5ce15"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* STATE */
let currentUser = "";
let currentChat = "";

/* LOGIN */
window.login = async () => {
  const name = document.getElementById("usernameInput").value.trim();
  if(!name) return;

  currentUser = name;

  await setDoc(doc(db,"users",name), {
    name:name
  });

  localStorage.setItem("user",name);

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("chatBox").classList.remove("hidden");

  loadUsers();
};

/* LOAD USERS */
async function loadUsers(){
  const snap = await getDocs(collection(db,"users"));
  const box = document.getElementById("usersList");

  box.innerHTML = "";

  snap.forEach(u=>{
    if(u.id !== currentUser){
      const btn = document.createElement("button");
      btn.innerText = u.id;
      btn.onclick = ()=>openChat(u.id);
      box.appendChild(btn);
    }
  });
}

/* CHAT ID */
function getChatId(u1,u2){
  return [u1,u2].sort().join("_");
}

/* OPEN CHAT */
window.openChat = (user)=>{
  currentChat = getChatId(currentUser,user);

  document.getElementById("chatHeader").innerText =
    "چت با " + user;

  listenMessages();
};

/* SEND MESSAGE */
window.sendMessage = async ()=>{

  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if(!text || !currentChat) return;

  await addDoc(
    collection(db,"chats",currentChat,"messages"),
    {
      sender:currentUser,
      text:text,
      time:Date.now()
    }
  );

  input.value="";
};

/* LISTEN MESSAGES REALTIME */
function listenMessages(){

  const q = query(
    collection(db,"chats",currentChat,"messages"),
    orderBy("time")
  );

  onSnapshot(q,(snap)=>{
    const box = document.getElementById("messages");
    box.innerHTML = "";

    snap.forEach(m=>{
      const div = document.createElement("div");
      div.className = "msg";
      div.innerText = `${m.data().sender}: ${m.data().text}`;
      box.appendChild(div);
    });
  });
}
