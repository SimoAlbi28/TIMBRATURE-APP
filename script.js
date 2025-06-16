// Variabili globali
let timbrature = [];
let modificaIndex = null;
let filtroData = "";

document.addEventListener("DOMContentLoaded", () => {
  // Carica dati da localStorage
  const datiSalvati = localStorage.getItem("timbrature");
  if (datiSalvati) timbrature = JSON.parse(datiSalvati);

  // Elementi DOM
  const btnEntrata = document.getElementById("btnEntrata");
  const btnUscita = document.getElementById("btnUscita");
  const btnPersonalizza = document.getElementById("btnPersonalizza");
  const boxPersonalizza = document.getElementById("boxPersonalizza");
  const formTimbratura = document.getElementById("formTimbratura");
  const btnSalva = document.getElementById("btnSalva");
  const btnAnnulla = document.getElementById("btnAnnulla");

  const filtroInput = document.getElementById("filtroData");
  const btnResetFiltro = document.getElementById("btnResetFiltro");

  // Funzioni helper
  function salvaDati() {
    localStorage.setItem("timbrature", JSON.stringify(timbrature));
  }

  function resetForm() {
    formTimbratura.reset();
    modificaIndex = null;
    btnAnnulla.disabled = true;
  }

  function mostraRiepilogo() {
    const container = document.getElementById("riepilogo");
    container.innerHTML = "";

    // Raggruppa timbrature per data
    const gruppi = {};
    timbrature.forEach((t, i) => {
      if (filtroData && t.data !== filtroData) return; // Applica filtro
      if (!gruppi[t.data]) gruppi[t.data] = [];
      gruppi[t.data].push({ ...t, index: i });
    });

    if (Object.keys(gruppi).length === 0) {
      container.innerHTML =
        "<p style='text-align:center; color:red; display:flex; justify-content:center; align-items:center; height:100px; margin:0;'>Nessun risultato trovato.</p>";
      return;
    }
    
    // Ordina date discendente e mostra
    Object.keys(gruppi)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach((data) => {
        const card = document.createElement("div");
        card.className = "card";

        const [yyyy, mm, dd] = data.split("-");
        const titolo = document.createElement("h3");
        titolo.textContent = `${dd}/${mm}/${yyyy}`;
        card.appendChild(titolo);

        const entrata = gruppi[data].find((t) => t.tipo === "Entrata");
        const uscita = gruppi[data].find((t) => t.tipo === "Uscita");

        [entrata, uscita].forEach((item) => {
          if (!item) return;
          const p = document.createElement("p");
          p.innerHTML = `<strong style="color:${
            item.tipo === "Entrata" ? "green" : "red"
          }">${item.tipo.toUpperCase()}</strong> — ${item.ora} ${
            item.descrizione || ""
          }`;

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
        });

        // Calcola ore lavorate se entrata e uscita presenti
        const totOre = document.createElement("p");
        if (entrata && uscita) {
          const [h1, m1] = entrata.ora.split(":").map(Number);
          const [h2, m2] = uscita.ora.split(":").map(Number);
          let diff = h2 * 60 + m2 - (h1 * 60 + m1);
          if (diff < 0) diff += 1440;
          totOre.textContent = `Totale ore lavorate: ${Math.floor(diff / 60)}h ${
            diff % 60
          }m`;
        } else {
          totOre.textContent = "Totale ore lavorate: …";
        }
        totOre.style.fontWeight = "bold";
        card.appendChild(totOre);

        container.appendChild(card);
      });
  }

  function caricaPerModifica(index) {
    modificaIndex = index;
    const t = timbrature[index];
    document.getElementById("data").value = t.data;
    document.getElementById("ora").value = t.ora;
    document.getElementById("descrizione").value = t.descrizione || "";
    document.getElementById("tipo").value = t.tipo;

    boxPersonalizza.style.display = "block";
    btnAnnulla.disabled = false;
  }

  // Event listeners

  btnEntrata.addEventListener("click", () => {
    const now = new Date();
    const data = now.toISOString().slice(0, 10);
    const ora = now.toTimeString().slice(0, 5);
    timbrature.push({ data, ora, tipo: "Entrata", descrizione: "" });
    salvaDati();
    mostraRiepilogo();
    if (boxPersonalizza.style.display === "block") boxPersonalizza.style.display = "none";
  });

  btnUscita.addEventListener("click", () => {
    const now = new Date();
    const data = now.toISOString().slice(0, 10);
    const ora = now.toTimeString().slice(0, 5);
    timbrature.push({ data, ora, tipo: "Uscita", descrizione: "" });
    salvaDati();
    mostraRiepilogo();
    if (boxPersonalizza.style.display === "block") boxPersonalizza.style.display = "none";
  });

  btnPersonalizza.addEventListener("click", () => {
    if (boxPersonalizza.style.display === "block") {
      boxPersonalizza.style.display = "none";
    } else {
      boxPersonalizza.style.display = "block";
    }
  });

  formTimbratura.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = document.getElementById("data").value;
    const ora = document.getElementById("ora").value;
    const descrizione = document.getElementById("descrizione").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!data || !ora || !tipo) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    if (modificaIndex !== null) {
      timbrature[modificaIndex] = { data, ora, tipo, descrizione };
    } else {
      timbrature.push({ data, ora, tipo, descrizione });
    }

    salvaDati();
    mostraRiepilogo();
    resetForm();
    boxPersonalizza.style.display = "none";
  });

  btnAnnulla.addEventListener("click", () => {
    resetForm();
    boxPersonalizza.style.display = "none";
  });

  // Abilita/disabilita bottone Annulla nel form personalizzato
  formTimbratura.addEventListener("input", () => {
    const dataVal = document.getElementById("data").value;
    const oraVal = document.getElementById("ora").value;
    const tipoVal = document.getElementById("tipo").value;
    btnAnnulla.disabled = !(dataVal || oraVal || tipoVal);
  });

  // Filtra in tempo reale per data
  filtroInput.addEventListener("input", () => {
    filtroData = filtroInput.value;
    mostraRiepilogo();
  });

  // Reset filtro data
  btnResetFiltro.addEventListener("click", () => {
    filtroData = "";
    filtroInput.value = "";
    mostraRiepilogo();
  });

  // Primo caricamento
  mostraRiepilogo();
  resetForm();
});
