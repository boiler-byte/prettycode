# prettycode. – Progressive Web App

Dies ist die PWA-Version der originalen HTML-Anwendung. Alle bestehenden Code-Editor- und Formatierungsfunktionen bleiben erhalten.

## Start und Installation

1. Alle Dateien **mit unveränderter Ordnerstruktur** auf einen Webserver mit **HTTPS** laden. Alternativ lokal starten: `python3 -m http.server 8080` im Ordner `prettycode-pwa`, anschließend `http://localhost:8080` öffnen.
2. Die Anwendung im Browser öffnen und über **Installieren** (oder das Browsermenü) als App hinzufügen. Auf iPhone/iPad Safari: **Teilen → Zum Home-Bildschirm**.
3. Für den erweiterten Offline-Betrieb das **Schieberegler-Symbol** in der Toolbar öffnen und auf **Offline vorbereiten** klicken, während eine Internetverbindung besteht.

**Wichtig:** Die `index.html` allein über `file://` zu öffnen reicht für die PWA-Installation nicht aus. Service Worker benötigen HTTPS oder localhost.

## Offline-Verhalten

- App-Oberfläche, Icons und Manifest werden beim Installieren des Service Workers lokal zwischengespeichert und sind danach offline abrufbar.
- Über **Offline vorbereiten** werden die fest versionierten Bibliotheken für HTML, CSS, JavaScript, MySQL, PHP, JSON und XML sowie deren Syntaxfarben vorbereitet. Falls ein CDN nicht erreichbar ist, versucht der Service Worker einen zweiten CDN-Host. Die Rückmeldung zeigt, ob alle Dateien gespeichert wurden.
- **Python/Black** nutzt Pyodide und Python-Wheels, die zunächst online geladen werden müssen. Der Service Worker speichert heruntergeladene Abhängigkeiten nach Möglichkeit zwischen; eine vollständige offline nutzbare Python-Laufzeit wird **nicht** garantiert.
- Die formatierte Eingabe wird ausschließlich im Browser verarbeitet, **nicht** im Offline-Cache gespeichert. Bei einem Neuladen können ungespeicherte Eingaben verloren gehen – Ergebnisse bei Bedarf herunterladen.
- Browser können den Cache bei Speicherknappheit löschen. Danach ggf. erneut online öffnen und „Offline vorbereiten“ ausführen.

## Dateien

- `index.html`: originale Anwendung mit PWA-Integration
- `manifest.webmanifest`: Metadaten zur App-Installation
- `sw.js`: Offline-Cache und Vorladen der Bibliotheken
- `icons/`: Installationsicons und Favicon

Die Web-App verwendet weiterhin die von der Originalversion festgelegten externen Bibliotheksversionen. Für Deployment mit strikter Content Security Policy müssen die dort verwendeten CDN-Hosts freigegeben oder die Bibliotheken lokal gebündelt werden.
