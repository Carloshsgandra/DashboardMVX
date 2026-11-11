chrome.storage.local.get(["supersetItems","supersetAt"], data => {
  document.querySelector("#status").textContent = data.supersetAt
    ? `${(data.supersetItems || []).length} atividades elegíveis capturadas em ${new Date(data.supersetAt).toLocaleString("pt-BR")}.`
    : "Nenhuma captura ainda. Abra o Relatório Diário no Superset.";
});
