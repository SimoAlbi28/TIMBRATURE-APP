let timbrature = JSON.parse(localStorage.getItem('timbrature')) || [];

function salvaLocalStorage() {
  localStorage.setItem('timbrature', JSON.stringify(timbrature));
}

const btnEntrata = document.getElementById("btnEntrata");
const btnUscita = document.getElementById("btnUscita");
const btnPersonalizza = document.getElementById("btnPersonalizza");
const boxPersonalizza = document.getElementById("boxPersonalizza");
const formTimbratura = document.getElementById("formTimbratura");
const btnAnnulla = document.getElementById("btnAnnulla");
const contaCaratteri = document.getElementById("contaCaratteri");
const descrizioneInput = document.getElementById("descrizione");
const filtroData = document.getElementById("filtroData");
const btnResetFiltro = document.getElementById("btnResetFiltro");
const btnSalva = document.getElementById("btnSalva");

let modificaIndex = -1;

function controllaSalvabilita() {
  const dataVal = document.getElementById("data").value;
  const oraVal = document.getElementById("ora").value;
  btnSalva.disabled = !(dataVal && oraVal);
}
document.getElementById("data").addEventListener("input", controllaSalvabilita);
document.getElementById("ora").addEventListener("input", controllaSalvabilita);
controllaSalvabilita();

btnEntrata.onclick = () => aggiungiTimbratura(new Date(), "Entrata", "");
btnUscita.onclick = () => aggiungiTimbratura(new Date(), "Uscita", "");
btnPersonalizza.onclick = () => {
  boxPersonalizza.style.display = boxPersonalizza.style.display === "none" ? "block" : "none";
  formTimbratura.reset();
  modificaIndex = -1;
  contaCaratteri.innerText = "0/30 caratteri";
  controllaSalvabilita();
};

descrizioneInput.addEventListener("input", () => {
  const len = descrizioneInput.value.length;
  contaCaratteri.innerText = `${len}/30 caratteri`;
});

formTimbratura.onsubmit = (e) => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const ora = document.getElementById("ora").value;
  const tipo = document.getElementById("tipo").value;
  const descrizione = document.getElementById("descrizione").value;

  if (modificaIndex >= 0) {
    timbrature[modificaIndex] = { data: data, ora: ora, tipo, descrizione };
  } else {
    timbrature.push({ data: data, ora: ora, tipo, descrizione });
  }

  salvaLocalStorage();

  modificaIndex = -1;
  formTimbratura.reset();
  contaCaratteri.innerText = "0/30 caratteri";
  boxPersonalizza.style.display = "none";
  mostraRiepilogo();
  controllaSalvabilita();
};

btnAnnulla.onclick = () => {
  formTimbratura.reset();
  contaCaratteri.innerText = "0/30 caratteri";
  modificaIndex = -1;
  boxPersonalizza.style.display = "none";
  controllaSalvabilita();
};

function aggiungiTimbratura(date, tipo, descrizione) {
  const data = date.toISOString().slice(0, 10);
  const ora = date.toTimeString().slice(0, 5);

  const indexEsistente = timbrature.findIndex(t => t.data === data && t.tipo === tipo);

  if (indexEsistente >= 0) {
    timbrature[indexEsistente].ora = ora;
    timbrature[indexEsistente].descrizione = descrizione;
  } else {
    timbrature.push({ data, ora, tipo, descrizione });
  }

  salvaLocalStorage();
  mostraRiepilogo();
  boxPersonalizza.style.display = "none";
}

function parseDateTime(data, ora) {
  if (!ora.includes(':')) return new Date(`${data}T00:00:00`);
  if (ora.length === 4) ora = '0' + ora;
  return new Date(`${data}T${ora}:00`);
}

function mostraRiepilogo() {
  const riepilogo = document.getElementById("riepilogo");
  riepilogo.innerHTML = "";

  const filtrate = filtroData.value ? timbrature.filter(t => t.data === filtroData.value) : timbrature;

  const perData = {};
  filtrate.forEach(t => {
    if (!perData[t.data]) perData[t.data] = [];
    perData[t.data].push(t);
  });

  Object.keys(perData)
    .sort((a, b) => new Date(b) - new Date(a))
    .forEach(data => {
      const card = document.createElement("div");
      card.className = "card";

      const [yyyy, mm, gg] = data.split("-");
      const dataFormattata = `${gg}/${mm}/${yyyy}`;

      const titolo = document.createElement("h3");
      titolo.textContent = dataFormattata;
      titolo.style.backgroundColor = "yellow";
      card.appendChild(titolo);
      const separatore = document.createElement("hr");
      separatore.style.border = "1px solid black";
      card.appendChild(separatore);

      let entrataObj = perData[data].find(e => e.tipo === "Entrata");
      let uscitaObj = perData[data].find(e => e.tipo === "Uscita");

      ["Entrata", "Uscita"].forEach(tipo => {
        const t = perData[data].find(e => e.tipo === tipo);
        if (t) {
          const p = document.createElement("p");
          const span = document.createElement("span");
          span.innerHTML = `<strong style="color:${tipo === "Entrata" ? "rgb(21, 247, 0)" : "rgb(255, 35, 35)"}">${tipo.toUpperCase()}</strong> ${t.ora} ${t.descrizione ? `(${t.descrizione})` : ""}`;

          const azioni = document.createElement("span");
          azioni.className = "azioni";

          const btnMod = document.createElement("button");
          btnMod.className = "modifica";
          btnMod.textContent = "Modifica";
          btnMod.onclick = () => modificaTimbratura(t);

          const btnDel = document.createElement("button");
          btnDel.className = "elimina";
          btnDel.textContent = "Elimina";
          btnDel.onclick = () => {
            const index = timbrature.indexOf(t);
            if (index >= 0) {
              timbrature.splice(index, 1);
              salvaLocalStorage();
              mostraRiepilogo();
            }
          };

          azioni.appendChild(btnMod);
          azioni.appendChild(btnDel);
          p.appendChild(span);
          p.appendChild(azioni);
          card.appendChild(p);
        }
      });

      if (entrataObj && uscitaObj) {
        const inTime = parseDateTime(entrataObj.data, entrataObj.ora);
        const outTime = parseDateTime(uscitaObj.data, uscitaObj.ora);
        let diffMs = outTime - inTime;
        if (diffMs < 0) diffMs = 0;

        const diffH = Math.floor(diffMs / (1000 * 60 * 60));
        const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const totOre = document.createElement("p");
        totOre.style.fontWeight = "bold";
        totOre.style.marginTop = "10px";
        const separatore = document.createElement("hr");
        separatore.style.border = "1px solid black";
        card.appendChild(separatore);
        totOre.textContent = `⏳ Totale ore - min di lavoro: ${diffH}h ${diffM}m`;
        card.appendChild(totOre);
      }

      riepilogo.appendChild(card);
    });
}

function modificaTimbratura(t) {
  document.getElementById("data").value = t.data;
  document.getElementById("ora").value = t.ora;
  document.getElementById("tipo").value = t.tipo;
  document.getElementById("descrizione").value = t.descrizione;
  contaCaratteri.innerText = `${t.descrizione.length}/30 caratteri`;
  modificaIndex = timbrature.indexOf(t);
  boxPersonalizza.style.display = "block";
  btnAnnulla.disabled = false;
  controllaSalvabilita();
}

filtroData.onchange = mostraRiepilogo;
btnResetFiltro.onclick = () => {
  filtroData.value = "";
  mostraRiepilogo();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('✅ Service Worker registrato!'))
    .catch(err => console.error('❌ Errore nel Service Worker:', err));
}

mostraRiepilogo();
