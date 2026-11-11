#Requires AutoHotkey v2.0
#SingleInstance Force

DashboardURL := "https://provisioning-pendencias-mvx.carloshsgandracode.chatgpt.site/"
SupersetURL := "https://dashboard.mundivox.com/superset/dashboard/195/"
ERPURL := "https://erp.mundivox.com/"

^+d::Run DashboardURL
^+s::Run SupersetURL
^+e::Run ERPURL

^+v::{
    oldClip := A_Clipboard
    A_Clipboard := ""
    Send "^c"
    if !ClipWait(1) {
        A_Clipboard := oldClip
        MsgBox "Selecione ou copie primeiro o código do cliente/projeto.", "MVX Provisioning", 48
        return
    }
    code := Trim(A_Clipboard)
    A_Clipboard := oldClip
    if !RegExMatch(code, "^\d{3,15}$") {
        MsgBox "O texto selecionado não parece um código numérico válido.", "MVX Provisioning", 48
        return
    }
    Run DashboardURL "?action=verify&project=" code
}

TraySetIcon "shell32.dll", 14
A_TrayMenu.Delete()
A_TrayMenu.Add("Abrir Dashboard (Ctrl+Shift+D)", (*) => Run(DashboardURL))
A_TrayMenu.Add("Abrir Superset (Ctrl+Shift+S)", (*) => Run(SupersetURL))
A_TrayMenu.Add("Abrir ERP (Ctrl+Shift+E)", (*) => Run(ERPURL))
A_TrayMenu.Add()
A_TrayMenu.Add("Sair", (*) => ExitApp())

MsgBox "Central MVX iniciada.`n`nCtrl+Shift+D: Dashboard`nCtrl+Shift+S: Superset`nCtrl+Shift+E: ERP`nCtrl+Shift+V: verificar código selecionado", "MVX Provisioning"
