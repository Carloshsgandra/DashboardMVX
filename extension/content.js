(() => {
  if (window.top !== window) return;
  const host = location.hostname;
  const norm = s => String(s || "").replace(/\s+/g, " ").trim();
  const fold = s => norm(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  function readSuperset() {
    const tables = [...document.querySelectorAll("table")];
    const headerTable = tables.find(t => t.querySelectorAll("th").length >= 15);
    if (!headerTable) return [];
    const headers = [...headerTable.querySelectorAll("th")].map(x => norm(x.textContent));
    const rows = tables.flatMap(t => [...t.querySelectorAll("tr")]).map(tr => [...tr.querySelectorAll("td")]);
    const found = new Map();
    for (const cells of rows) {
      if (cells.length !== headers.length) continue;
      const r = Object.fromEntries(headers.map((h, i) => [h, norm(cells[i].textContent)]));
      const filial = fold(r["Filial"]), service = norm(r["Serviço"]), svc = fold(service);
      const speeds = [...svc.matchAll(/(\d+(?:[.,]\d+)?)\s*(G|M)(?![A-Z])/g)].map(m => Number(m[1].replace(',', '.')) * (m[2] === 'G' ? 1000 : 1));
      const maxMbps = speeds.length ? Math.max(...speeds) : 0;
      const rjSp = filial === "RIO DE JANEIRO" || filial === "SAO PAULO";
      const regionalOk = rjSp ? (maxMbps > 1000 || svc.includes("MARD")) : !svc.includes("L2L");
      const cfg = fold(r["Equipamento Configurado?"]);
      if (!regionalOk || cfg === "REALIZADO" || cfg === "CANCELADO") continue;
      const projectId = r["Projetos ID"], customerCode = r["Cod Cliente"], referenceId = r["Referencia ID"];
      if (!projectId) continue;
      const key = [projectId, customerCode, referenceId].join("-");
      found.set(key, {
        task_key: key,
        project_id: projectId,
        activity_id: r["Projetos Atividades ID"],
        reference_id: referenceId,
        customer_code: customerCode,
        filial: r["Filial"],
        project_name: r["Projeto"],
        service,
        appointment_start: r["Data Início Agendamento"],
        superset_equipment_status: r["Equipamento Configurado?"],
        source_updated_at: new Date().toISOString()
      });
    }
    return [...found.values()];
  }

  async function snapshot() {
    const items = readSuperset();
    if (items.length) chrome.runtime.sendMessage({ type: "PX_SUPERSET_SNAPSHOT", payload: { items } });
  }

  function docs(root = document, out = []) {
    out.push(root);
    for (const frame of root.querySelectorAll("iframe")) {
      try { if (frame.contentDocument) docs(frame.contentDocument, out); } catch (_) {}
    }
    return out;
  }

  function setInput(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter ? setter.call(input, value) : input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true }));
  }

  function parseConfiguration() {
    for (const d of docs()) {
      const candidates = [...d.querySelectorAll("p,td,div,span")].filter(e => fold(e.textContent) === "CONFIGURACAO DE EQUIPAMENTO");
      for (const el of candidates) {
        let node = el, best = "";
        for (let i = 0; node && i < 8; i++, node = node.parentElement) {
          const text = fold(node.innerText || node.textContent);
          if (text.includes("CONFIGURACAO DE EQUIPAMENTO") && text.length < 1400) best = text;
          if (/FINALIZADA|PENDENTE|AGUARDANDO|ANDAMENTO|CANCELADA/.test(text) && text.length < 900) { best = text; break; }
        }
        const status = (best.match(/FINALIZADA|PENDENTE|AGUARDANDO|ANDAMENTO|CANCELADA/) || ["NAO_ENCONTRADA"])[0];
        const ids = best.match(/\b\d{5,9}\b/g) || [];
        return { erp_status: status, erp_activity_id: ids[0] || "" };
      }
    }
    return { erp_status: "NAO_ENCONTRADA", erp_activity_id: "" };
  }

  async function verify(projectId) {
    const all = docs();
    const input = all.flatMap(d => [...d.querySelectorAll('input[placeholder*="Pesquisar"],input[placeholder*="pesquisar"]')]).find(i => i.offsetParent !== null) || all.flatMap(d => [...d.querySelectorAll('input[placeholder*="Pesquisar"],input[placeholder*="pesquisar"]')])[0];
    if (!input) throw new Error("Campo Pesquisar do ERP não encontrado.");
    input.focus(); setInput(input, projectId);
    await new Promise(r => setTimeout(r, 3200));
    return parseConfiguration();
  }

  if (host === "dashboard.mundivox.com") {
    snapshot(); setInterval(snapshot, 20000);
    new MutationObserver(() => { clearTimeout(window.__pxSnap); window.__pxSnap = setTimeout(snapshot, 1200); }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (host === "erp.mundivox.com") {
    chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
      if (msg.type !== "PX_DO_VERIFY") return;
      verify(msg.payload.project_id).then(sendResponse).catch(e => sendResponse({ erp_status: "NAO_ENCONTRADA", erp_activity_id: "", error: e.message }));
      return true;
    });
  }
  if (host === "carloshsgandra.github.io" && location.pathname.startsWith("/DashboardMVX")) {
    window.addEventListener("message", e => {
      if (e.source === window && e.origin === location.origin && e.data?.source === "px-dashboard") chrome.runtime.sendMessage({ type: "PX_DASH_REQUEST", payload: e.data });
    });
    chrome.runtime.onMessage.addListener(msg => {
      if (msg.type?.startsWith("PX_")) window.postMessage({ source: "px-extension", type: msg.type, payload: msg.payload }, location.origin);
    });
  }
})();
