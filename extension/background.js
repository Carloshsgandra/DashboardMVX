const SITE = "https://provisioning-pendencias-mvx.carloshsgandracode.chatgpt.site/";

chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: SITE }));

async function dashboardTabs() {
  return chrome.tabs.query({ url: SITE + "*" });
}

async function forward(type, payload) {
  for (const tab of await dashboardTabs()) {
    try { await chrome.tabs.sendMessage(tab.id, { type, payload }); } catch (_) {}
  }
}

async function findErp() {
  const tabs = await chrome.tabs.query({ url: "https://erp.mundivox.com/*" });
  if (tabs[0]) return tabs[0];
  return chrome.tabs.create({ url: "https://erp.mundivox.com/" });
}

async function verifyOne(item) {
  const tab = await findErp();
  if (tab.status !== "complete") await new Promise(r => setTimeout(r, 3500));
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: "PX_DO_VERIFY", payload: item });
    if (!result) throw new Error("A página do ERP não respondeu.");
    await forward("PX_ERP_RESULT", { ...item, ...result, actor: "Extensão ERP" });
  } catch (error) {
    await forward("PX_ERROR", { message: "Falha ao consultar ERP: " + error.message });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "PX_SUPERSET_SNAPSHOT") {
      await chrome.storage.local.set({ supersetItems: msg.payload.items, supersetAt: Date.now() });
      sendResponse({ ok: true });
    }
    if (msg.type === "PX_DASH_REQUEST") {
      const { type, payload } = msg.payload;
      if (type === "PX_PULL_SUPERSET") {
        const data = await chrome.storage.local.get(["supersetItems", "supersetAt"]);
        await forward("PX_IMPORT_RESULT", { items: data.supersetItems || [], capturedAt: data.supersetAt });
      }
      if (type === "PX_VERIFY_ERP") await verifyOne(payload);
      if (type === "PX_VERIFY_BATCH") {
        for (const item of (payload.items || []).slice(0, 50)) {
          await verifyOne(item);
          await new Promise(r => setTimeout(r, 900));
        }
      }
      sendResponse({ ok: true });
    }
  })().catch(error => sendResponse({ ok: false, error: error.message }));
  return true;
});
