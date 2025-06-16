let timbrature = JSON.parse(localStorage.getItem("timbrature")) || [];
let modificaIndex = null;

document.getElementById("btnEntrata").addEventListener("click", () => aggiungiTimbratura("Entrata"));
document.getElementById("btnUscita").addEventListener("click", () => aggiungiTimbratura("Uscita"));
document.getElementById("btnPersonalizza").addEventListener("click", togglePersonalizza);

document.getElementById("formTimbratura").addEventListener("submit", function (e) {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const ora = document.getElementById("ora").value;
  let descrizione = document.getElementById("descrizione").value.trim();
  const tipo = document.getElementById("tipo").value;

  if (!data || !ora || !tipo) return;

  if (descrizione && !descrizione.startsWith("(")) {
    descrizione = `(${descrizione})`;
  } else if (!descrizione) {
    descrizione = "";
  }

  const nuovaTimbratura = { data, ora, tipo, descrizione };

  if (modificaIndex !== null) {
    timbrature[modificaIndex] = nuovaTimbratura;
    modificaIndex = null;
  } else {
    timbrature.push(nuovaTimbratura);
  }

  salvaDati();
  this.reset();
  document.getElementById("btnAnnulla").disabled = true;
  mostraRiepilogo();
});

document.getElementById("btnAnnulla").addEventListener("click", function () {
  document.getElementById("formTimbratura").reset();
  this.disabled = true;
  modificaIndex = null;
});

["data", "ora", "descrizione", "tipo"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    const filled = ["data", "ora", "tipo"].every(i => document.getElementById(i).value);
    document.getElementById("btnAnnulla").disabled = !filled;
  });
});

function aggiungiTimbratura(tipo) {
  const now = new Date();
  const data = now.toISOString().split("T")[0];
  const ora = now.toTimeString().slice(0, 5);
  const nuova = {
    data,
    ora,
    tipo,
    descrizione: "(Nessuna descrizione)"
  };
  timbrature.push(nuova);
  salvaDati();
  mostraRiepilogo();
  document.getElementById("boxPersonalizza").style.display = "none";
}

function togglePersonalizza() {
  const box = document.getElementById("boxPersonalizza");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function mostraRiepilogo() {
  const container = document.getElementById("riepilogo");
  container.innerHTML = "";

  const raggruppate = {};

  timbrature.forEach((t, index) => {
    if (!raggruppate[t.data]) raggruppate[t.data] = [];
    raggruppate[t.data].push({ ...t, index });
  });

  Object.keys(raggruppate).sort((a, b) => new Date(b) - new Date(a)).forEach(data => {
    const card = document.createElement("div");
    card.className = "card";

    const titolo = document.createElement("h3");
    const [yyyy, mm, dd] = data.split("-");
    titolo.textContent = `${dd}/${mm}/${yyyy}`;
    card.appendChild(titolo);

    const entrata = raggruppate[data].find(t => t.tipo === "Entrata");
    const uscita = raggruppate[data].find(t => t.tipo === "Uscita");

    [entrata, uscita].forEach(item => {
      if (item) {
        const p = document.createElement("p");
        p.innerHTML = `<strong style="color:${item.tipo === "Entrata" ? "green" : "red"}">${item.tipo.toUpperCase()}</strong> — ${item.ora} ${item.descrizione}`;

        const btnMod = document.createElement("button");
        btnMod.textContent = "✏️";
        btnMod.className = "modifica";
        btnMod.addEventListener("click", () => caricaPerModifica(item.index));

        const btnDel = document.createElement("button");
        btnDel.textContent = "🗑️";
        btnDel.className = "elimina";
        btnDel.addEventListener("click", () => {
          timbrature.splice(item.index, 1);
          salvaDati();
          mostraRiepilogo();
        });

        const spanBtns = document.createElement("span");
        spanBtns.className = "azioni";
        spanBtns.appendChild(btnMod);
        spanBtns.appendChild(btnDel);

        p.appendChild(spanBtns);
        card.appendChild(p);
      }
    });

    // Calcolo ore lavorate
    const totaleOre = document.createElement("p");
    if (entrata && uscita) {
      const [h1, m1] = entrata.ora.split(":").map(Number);
      const [h2, m2] = uscita.ora.split(":").map(Number);
      let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff < 0) diff += 1440;
      const ore = Math.floor(diff / 60);
      const minuti = diff % 60;
      totaleOre.textContent = `Totale ore lavorate: ${ore}h ${minuti}m`;
    } else {
      totaleOre.textContent = "Totale ore lavorate: …";
    }
    totaleOre.style.fontWeight = "bold";
    card.appendChild(totaleOre);

    container.appendChild(card);
  });
}

function caricaPerModifica(index) {
  const t = timbrature[index];
  document.getElementById("data").value = t.data;
  document.getElementById("ora").value = t.ora;
  document.getElementById("descrizione").value = t.descrizione.replace(/[()]/g, "");
  document.getElementById("tipo").value = t.tipo;
  modificaIndex = index;
  document.getElementById("btnAnnulla").disabled = false;
  document.getElementById("boxPersonalizza").style.display = "block";
}

// 🔒 Salva su localStorage
function salvaDati() {
  localStorage.setItem("timbrature", JSON.stringify(timbrature));
}

// 🔁 Mostra i dati salvati subito
mostraRiepilogo();