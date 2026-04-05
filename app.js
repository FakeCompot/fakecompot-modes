// --- ДАННЫЕ ---
let files = []; // моды будут загружаться с сервера
let role = localStorage.getItem("role");
let nick = localStorage.getItem("nick");

// --- СОХРАНЕНИЕ ---
function saveAccount(){
    localStorage.setItem("role", role);
    localStorage.setItem("nick", nick);
}

// --- ПОДГРУЗКА МОДОВ ---
async function loadMods(){
    try {
        const res = await fetch("mods.json");
        const mods = await res.json();
        files = mods; // массив {title, name, data, type}
        render();
    } catch(e){
        console.error("Ошибка загрузки модов:", e);
        files = [];
        render();
    }
}

// --- РЕНДЕР ---
function render(){
    const app = document.getElementById("app");
    const modParam = new URLSearchParams(window.location.search).get("mod");

    if(modParam){
        const title = decodeURIComponent(modParam);
        const f = files.find(x=>x.title===title);
        if(!f){ app.innerHTML="<div class='files-panel'>МОД НЕ НАЙДЕН</div>"; return; }

        app.innerHTML = `
            <div class="file-page">
                <h2>${f.title}</h2>
                <button onclick="downloadFile('${f.name}')">СКАЧАТЬ</button>
                <br><br>
                <a class="button-link" href="${window.location.pathname}">← НАЗАД</a>
            </div>`;
        return;
    }

    // --- ВХОД ---
    if(!role){
        showLogin();
        return;
    }

    // --- ГЛАВНАЯ ---
    let html = `<button onclick="logout()">ВЫЙТИ</button>`;
    if(role==="admin"){
        html += `
            <div class="admin-panel">
                <input id="title" placeholder="Название">
                <input id="file" type="file">
                <button onclick="upload()">ЗАГРУЗИТЬ</button>
            </div>`;
    }

    html += `<div class="files-panel">`;
    if(files.length===0) html += "<div>НЕТ ФАЙЛОВ</div>";

    files.forEach(f=>{
        html += `
            <div class="file-card">
                ${f.title}
                <br>
                <a class="button-link" href="?mod=${encodeURIComponent(f.title)}">ОТКРЫТЬ</a>
            </div>`;
    });
    html += `</div>`;
    app.innerHTML = html;
}

// --- ВХОД ---
function showLogin(){
    document.getElementById("app").innerHTML = `
        <div class="auth-screen">
            <input id="nickInput" placeholder="Ник">
            <div id="pass"></div>
            <button onclick="login()">ВОЙТИ</button>
        </div>`;
}

function login(){
    const n = document.getElementById("nickInput").value.trim();
    if(!n) return;

    if(n==="rtQu27"){
        document.getElementById("pass").innerHTML = `
            <input id="p" placeholder="Пароль">
            <button onclick="checkAdmin('${n}')">OK</button>`;
    } else {
        role="user";
        nick=n;
        saveAccount();
        render();
    }
}

function checkAdmin(n){
    const p = document.getElementById("p").value;
    if(p==="13") role="admin";
    else role="user";
    nick=n;
    saveAccount();
    render();
}

function logout(){
    role=null;
    nick=null;
    saveAccount();
    render();
}

// --- ЗАГРУЗКА ---
function upload(){
    const t=document.getElementById("title").value;
    const f=document.getElementById("file").files[0];
    if(!t||!f) return;

    const r=new FileReader();
    r.onload=e=>{
        files.push({
            title:t,
            data:e.target.result.split(',')[1],
            name:f.name,
            type:f.type
        });
        render();
    };
    r.readAsDataURL(f);
}

// --- СКАЧКА ---
function downloadFile(name){
    const f=files.find(x=>x.name===name);
    if(!f) return;

    const b=atob(f.data);
    const arr=new Uint8Array(b.length);
    for(let i=0;i<b.length;i++) arr[i]=b.charCodeAt(i);

    const blob=new Blob([arr],{type:f.type});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=f.name;
    a.click();
}

// --- СТАРТ ---
loadMods();