let timbrature = JSON.parse(localStorage.getItem('timbrature')) || [];

function salvaLocalStorage() {
  localStorage.setItem('timbrature', JSON.stringify(timbrature));
}

function getDataGGMMYYYY(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// DOM Elements
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

  if (modificaIndex >= 0 || (dataVal && oraVal)) {
    btnSalva.disabled = false;
  } else {
    btnSalva.disabled = true;
  }
}

document.getElementById("data").addEventListener("input", controllaSalvabilita);
document.getElementById("ora").addEventListener("input", controllaSalvabilita);
controllaSalvabilita();

// Pulsanti principali
btnEntrata.onclick = () => aggiungiTimbratura(new Date(), "Entrata", "");
btnUscita.onclick = () => aggiungiTimbratura(new Date(), "Uscita", "");

btnPersonalizza.onclick = () => {
  boxPersonalizza.style.display = boxPersonalizza.style.display === "none" ? "block" : "none";
  formTimbratura.reset();
  modificaIndex = -1;
  contaCaratteri.innerText = "0/50 caratteri";
  controllaSalvabilita();

  // Centra tutto tranne descrizione
  const inputs = boxPersonalizza.querySelectorAll("input, select");
  inputs.forEach(inp => {
    if(inp.id !== "descrizione") inp.style.textAlign = "center";
    else inp.style.textAlign = "left";
  });
};

// Conta caratteri
descrizioneInput.addEventListener("input", () => {
  const len = descrizioneInput.value.length;
  contaCaratteri.innerText = `${len}/50 caratteri`;
});

// Salvataggio form
formTimbratura.onsubmit = (e) => {
  e.preventDefault();

  const dataInput = document.getElementById("data").value;
  const ora = document.getElementById("ora").value;
  const tipo = document.getElementById("tipo").value;
  const descrizione = document.getElementById("descrizione").value;

  const [yyyy, mm, dd] = dataInput.split("-");
  const data = `${dd}/${mm}/${yyyy}`.trim();

  const newEntry = {
    data,
    ora: ora.trim(),
    tipo: tipo.trim(),
    descrizione: descrizione.trim()
  };

  if (modificaIndex >= 0) {
    timbrature[modificaIndex] = newEntry;
  } else {
    const index = timbrature.findIndex(t =>
      t.data.trim() === data &&
      t.tipo.trim().toLowerCase() === tipo.trim().toLowerCase()
    );

    if (index >= 0) {
      timbrature[index] = newEntry;
    } else {
      timbrature.push(newEntry);
    }
  }

  salvaLocalStorage();
  modificaIndex = -1;
  formTimbratura.reset();
  contaCaratteri.innerText = "0/50 caratteri";
  boxPersonalizza.style.display = "none";
  mostraRiepilogo();
  controllaSalvabilita();
};

btnAnnulla.onclick = () => {
  formTimbratura.reset();
  contaCaratteri.innerText = "0/50 caratteri";
  modificaIndex = -1;
  boxPersonalizza.style.display = "none";
  controllaSalvabilita();
};

function aggiungiTimbratura(date, tipo, descrizione) {
  const data = getDataGGMMYYYY(date);
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
  const [gg, mm, yyyy] = data.split("/").map(p => p.trim());
  const isoDate = `${yyyy}-${mm}-${gg}T${ora || "00:00"}:00`;
  return new Date(isoDate);
}

function mostraRiepilogo() {
  const riepilogo = document.getElementById("riepilogo");
  riepilogo.innerHTML = "";

  const filtrate = filtroData.value
    ? timbrature.filter(t => {
        const [yyyy, mm, dd] = filtroData.value.split("-");
        const dataFiltro = `${dd}/${mm}/${yyyy}`;
        return t.data === dataFiltro;
      })
    : timbrature;

  const perData = {};
  filtrate.forEach(t => {
    if (!perData[t.data]) perData[t.data] = [];
    perData[t.data].push(t);
  });

  Object.keys(perData)
    .sort((a, b) => {
      const [ggA, mmA, yyyyA] = a.split("/");
      const [ggB, mmB, yyyyB] = b.split("/");
      const dataA = new Date(parseInt(yyyyA), parseInt(mmA) - 1, parseInt(ggA));
      const dataB = new Date(parseInt(yyyyB), parseInt(mmB) - 1, parseInt(ggB));
      return dataB - dataA;
    })
    .forEach(data => {
      const card = document.createElement("div");
      card.className = "card";

      const titoloWrapper = document.createElement("div");
      titoloWrapper.style.textAlign = "center";

      const titolo = document.createElement("h3");
      titolo.textContent = data;
      titoloWrapper.appendChild(titolo);
      card.appendChild(titoloWrapper);

      const separatore = document.createElement("hr");
      separatore.style.border = "1px solid black";
      separatore.style.margin = "10px 0";
      card.appendChild(separatore);

      const wrapper = document.createElement("div");
      wrapper.className = "card-entry-exit";

      const createBox = (tipoObj, tipo) => {
        const box = document.createElement("div");
        box.className = "entry-exit-box";
        box.classList.add(tipo.toLowerCase());

        const tipoTitolo = document.createElement("div");
        tipoTitolo.textContent = tipo.toUpperCase();

        const oraDiv = document.createElement("div");
        oraDiv.textContent = tipoObj.ora;
        oraDiv.className = "ora";

        const descDiv = document.createElement("div");
        descDiv.textContent = tipoObj.descrizione ? `(${tipoObj.descrizione.trim()})` : "";
        descDiv.className = "descrizione";

        const azioni = document.createElement("div");
        azioni.className = "azioni";

        const btnMod = document.createElement("button");
        btnMod.className = "modifica";
        btnMod.textContent = "Modifica";
        btnMod.onclick = () => modificaTimbratura(tipoObj);

        const btnDel = document.createElement("button");
        btnDel.className = "elimina";
        btnDel.textContent = "Elimina";
        btnDel.onclick = () => {
          const index = timbrature.indexOf(tipoObj);
          if (index >= 0) {
            timbrature.splice(index, 1);
            salvaLocalStorage();
            mostraRiepilogo();
          }
        };

        azioni.appendChild(btnMod);
        azioni.appendChild(btnDel);

        box.appendChild(tipoTitolo);
        box.appendChild(oraDiv);
        box.appendChild(descDiv);
        box.appendChild(azioni);

        return box;
      };

      const entrataObj = perData[data].find(e => e.tipo === "Entrata");
      const uscitaObj = perData[data].find(e => e.tipo === "Uscita");

      if (entrataObj) wrapper.appendChild(createBox(entrataObj, "Entrata"));
      if (uscitaObj) wrapper.appendChild(createBox(uscitaObj, "Uscita"));

      card.appendChild(wrapper);

      if (entrataObj && uscitaObj) {
        const inTime = parseDateTime(entrataObj.data, entrataObj.ora);
        const outTime = parseDateTime(uscitaObj.data, uscitaObj.ora);

        let diffMs;
        if (outTime >= inTime) {
          diffMs = outTime - inTime;
        } else {
          diffMs = (outTime.getTime() + 24 * 60 * 60 * 1000) - inTime.getTime();
        }

        const diffH = Math.floor(diffMs / (1000 * 60 * 60));
        const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const separatore2 = document.createElement("hr");
        separatore2.style.border = "1px solid black";
        card.appendChild(separatore2);

        const totOre = document.createElement("p");
        totOre.textContent = `⏳ Totale ore-minuti di lavoro: ${diffH}h ${diffM}m `;
        totOre.style.cssText = `
          font-weight: bold;
          margin-top: 10px;
          text-align: center;
          width: 100%;
          font-size: 1.1rem;
        `;
        card.appendChild(totOre);
      }

      riepilogo.appendChild(card);
    });
}

function modificaTimbratura(t) {
  const parts = t.data.split("/").map(p => p.trim());
  const [gg, mm, yyyy] = parts;
  document.getElementById("data").value = `${yyyy}-${mm}-${gg}`;
  document.getElementById("ora").value = t.ora;
  document.getElementById("tipo").value = t.tipo;
  document.getElementById("descrizione").value = t.descrizione;
  contaCaratteri.innerText = `${t.descrizione.length}/50 caratteri`;
  modificaIndex = timbrature.indexOf(t);

  boxPersonalizza.style.display = "block";
  btnAnnulla.disabled = false;
  controllaSalvabilita();

  // Centra tutto tranne descrizione
  const inputs = boxPersonalizza.querySelectorAll("input, select");
  inputs.forEach(inp => {
    if(inp.id !== "descrizione") inp.style.textAlign = "center";
    else inp.style.textAlign = "left";
  });

  boxPersonalizza.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

filtroData.onchange = mostraRiepilogo;

btnResetFiltro.onclick = () => {
  filtroData.value = "";
  mostraRiepilogo();
};

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('✅ Service Worker registrato!'))
    .catch(err => console.error('❌ Errore nel Service Worker:', err));
}

mostraRiepilogo();
