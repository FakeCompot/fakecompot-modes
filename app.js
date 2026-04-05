// --- Данные модов сохраняем в localStorage ---
let files = JSON.parse(localStorage.getItem("files") || "[]");
let role = null;
let nick = "";

// --- Сохраняем изменения ---
function save() {
    localStorage.setItem("files", JSON.stringify(files));
}

// --- Получаем параметр из URL (?mod=НазваниеМода) ---
function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// --- Основной рендер ---
function render() {
    const app = document.getElementById("app");
    const modParam = getParam("mod");

    // Если открыт конкретный мод по ссылке
    if(modParam){
        const f = files.find(x=>x.title===modParam);
        if(!f){ 
            app.innerHTML="<div class='files-panel'>МОД НЕ НАЙДЕН</div>"; 
            return; 
        }
        app.innerHTML = `
            <div class="file-page">
                <h2>${f.title}</h2>
                <a class="button" href="#" onclick="downloadFile('${f.name}')">СКАЧАТЬ</a><br>
                <a class="button" href="${window.location.pathname}">← НАЗАД</a>
            </div>
        `;
        return;
    }

    // Если нужно войти
    if(!role){
        app.innerHTML = `
        <div class="auth-screen">
            <div style="font-size:1.3rem;">ВХОД НА САЙТ</div>
            <input id="nick" placeholder="Никнейм">
            <div id="err" class="error-message" style="display:none;"></div>
            <button id="go">ПРОДОЛЖИТЬ</button>
        </div>`;

        document.getElementById("go").onclick = ()=>{
            const n=document.getElementById("nick").value.trim();
            if(!n){ 
                document.getElementById("err").style.display="block"; 
                document.getElementById("err").innerText="ВВЕДИ НИК"; 
                return; 
            }
            role = (n==="rtQu27") ? "admin" : "user";
            nick = n;
            render();
        };
        return;
    }

    // Главная панель
    let html = `<button onclick="logout()">ВЫЙТИ</button>`;
    if(role==="admin"){
        html+=`
        <div class="admin-panel">
            <input id="title" placeholder="Название мода">
            <input id="file" type="file">
            <button onclick="upload()">ЗАГРУЗИТЬ</button>
        </div>`;
    }

    html+=`<div class="files-panel">`;
    if(files.length===0){ html+="<div>НЕТ ФАЙЛОВ</div>"; }
    files.forEach(f=>{
        html+=`
        <div class="file-card">
            <div>${f.title}</div>
            <a class="button" href="?mod=${encodeURIComponent(f.title)}">ПЕРЕЙТИ</a>
        </div>`;
    });
    html+="</div>";
    app.innerHTML = html;
}

// --- Выход ---
function logout(){ 
    role=null; 
    render(); 
}

// --- Загрузка нового мода ---
function upload(){
    const t = document.getElementById("title").value;
    const f = document.getElementById("file").files[0];
    if(!t||!f) return;
    const r = new FileReader();
    r.onload = e=>{
        files.push({ title:t, data:e.target.result.split(',')[1], name:f.name, type:f.type });
        save();
        render();
    };
    r.readAsDataURL(f);
}

// --- Скачать мод ---
function downloadFile(name){
    const f = files.find(x=>x.name===name);
    if(!f||!f.data) return;
    const b = atob(f.data);
    const arr = new Uint8Array(b.length);
    for(let i=0;i<b.length;i++) arr[i]=b.charCodeAt(i);
    const blob = new Blob([arr], {type:f.type});
    const a=document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = f.name;
    a.click();
}

// --- Запуск ---
render();