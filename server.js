/**
 * Stremio Tracker-Boost Addon (Proxy/Wrapper Addon)
 * Compatible con cualquier cliente de Stremio (Android TV, Firestick, iOS, Web, Desktop).
 * Intercepta los streams de Torrentio e inyecta la lista de 134 trackers de ngosang.
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");
const os = require("os");

const PORT = process.env.PORT || 7070;
const LOCAL_TRACKERS_FILE = path.join(__dirname, "trackers.txt");
const PARENT_TRACKERS_FILE = path.join(__dirname, "..", "trackers.txt");

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "127.0.0.1";
}

function loadTrackers() {
    const fileToUse = fs.existsSync(LOCAL_TRACKERS_FILE) ? LOCAL_TRACKERS_FILE : PARENT_TRACKERS_FILE;
    if (!fs.existsSync(fileToUse)) {
        return [
            "tracker:udp://tracker.opentrackr.org:1337/announce",
            "tracker:udp://open.stealth.si:80/announce",
            "tracker:udp://tracker.torrent.eu.org:451/announce"
        ];
    }
    const lines = fs.readFileSync(fileToUse, "utf8").split(/\r?\n/);
    const trackers = [];
    for (let l of lines) {
        l = l.trim();
        if (!l || l.startsWith("#")) continue;
        if (!l.startsWith("tracker:")) {
            l = "tracker:" + l;
        }
        trackers.push(l);
    }
    return Array.from(new Set(trackers));
}

function fetchJson(targetUrl) {
    return new Promise((resolve, reject) => {
        const parsed = url.parse(targetUrl);
        const client = parsed.protocol === "https:" ? https : http;
        const req = client.get(targetUrl, { headers: { "User-Agent": "StremioTrackerBooster/1.0" } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchJson(res.headers.location));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on("error", reject);
        req.setTimeout(8000, () => req.destroy(new Error("Timeout")));
    });
}

const manifest = {
    id: "org.stremio.trackerbooster.addon",
    version: "1.0.0",
    name: "🚀 Tracker Booster (ngosang)",
    description: "Inyecta 134 trackers públicos a cada torrent para maximizar peers y velocidad de descarga.",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    behaviorHints: {
        configurable: true,
        configurationRequired: false
    }
};

async function handleRequest(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        return res.end();
    }

    const parsed = url.parse(req.url, true);
    let pathname = req.headers["x-matched-path"] ||
                   req.headers["x-vercel-matched-path"] ||
                   (parsed.query && parsed.query.path ? (parsed.query.path.startsWith("/") ? parsed.query.path : "/" + parsed.query.path) : null) ||
                   parsed.pathname || "/";

    // En Vercel rewrites, eliminar prefijo /api/index.js si viene en la ruta
    if (pathname.startsWith("/api/index.js")) {
        pathname = pathname.slice("/api/index.js".length) || "/";
    } else if (pathname.startsWith("/api")) {
        pathname = pathname.slice("/api".length) || "/";
    }

    // 1. Manifest: soporta /manifest.json o /{customConfig}/manifest.json
    if (pathname === "/manifest.json" || pathname.endsWith("/manifest.json")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.end(JSON.stringify(manifest));
    }

    // 2. Página de configuración web
    if (pathname === "/" || pathname === "/configure") {
        const trackers = loadTrackers();
        const localIP = getLocalIP();
        const host = req.headers.host || `${localIP}:${PORT}`;
        const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
        const wifiUrl = `http://${localIP}:${PORT}/manifest.json`;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stremio Tracker Booster Addon</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0b0f19;
            color: #e2e8f0;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }
        .container {
            max-width: 680px;
            width: 100%;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }
        h1 { color: #38bdf8; margin: 0 0 10px; display: flex; align-items: center; justify-content: space-between; font-size: 26px; }
        p { line-height: 1.6; color: #94a3b8; font-size: 15px; }
        .badge { background: #0284c7; color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
        .btn {
            display: inline-block;
            background: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            text-align: center;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 16px;
        }
        .btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .box {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 18px;
            margin: 20px 0;
        }
        .box-title { font-weight: 600; color: #f1f5f9; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        code {
            background: #0f172a;
            color: #38bdf8;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 13px;
            word-break: break-all;
        }
        pre {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 12px;
            max-height: 200px;
            overflow-y: auto;
            font-size: 12px;
            color: #7dd3fc;
            line-height: 1.4;
        }
        .copy-input {
            width: 100%;
            background: #0f172a;
            border: 1px solid #334155;
            color: #38bdf8;
            padding: 10px 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            box-sizing: border-box;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Stremio Tracker Booster <span class="badge">${trackers.length} Trackers</span></h1>
        <p>Este addon actúa como un acelerador de torrents para Stremio: intercepta los streams de Torrentio y les añade los <strong>${trackers.length} trackers públicos de ngosang</strong> para conectar con muchísimos más peers y aumentar la velocidad de descarga.</p>

        <div style="margin: 24px 0; text-align: center;">
            <a class="btn" href="stremio://${host}/manifest.json">➕ Instalar en Stremio de este Mac</a>
        </div>

        <div class="box">
            <div class="box-title">📺 ¿Cómo instalarlo en tu Smart TV, Firestick o Móvil?</div>
            <p style="margin: 4px 0 10px;">Si tu televisor o celular está en la misma red Wi-Fi de tu casa, copia esta URL y pégala en el buscador de Stremio en tu TV:</p>
            <input class="copy-input" readonly value="${wifiUrl}" onclick="this.select()">
            <p style="font-size: 12px; color: #64748b; margin-top: 6px;">💡 Al instalarlo con tu cuenta de Stremio iniciada, ¡se sincroniza automáticamente en todos tus dispositivos!</p>
        </div>

        <div class="box">
            <div class="box-title">🌐 Lista de Trackers activos cargados (${trackers.length}):</div>
            <pre>${trackers.map(t => t.replace("tracker:", "")).join("\n")}</pre>
        </div>
    </div>
</body>
</html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.end(html);
    }

    // 3. Streams: soporta /stream/{type}/{id}.json o /{config}/stream/{type}/{id}.json
    const streamMatch = pathname.match(/(?:^|\/stream\/)(?:[^/]+\/)?stream\/([^/]+)\/([^/]+)\.json$/) ||
                        pathname.match(/\/stream\/([^/]+)\/([^/]+)\.json$/);

    if (streamMatch) {
        const type = streamMatch[1];
        const id = streamMatch[2];
        const trackers = loadTrackers();

        // Extraer upstream addon si viene codificado o usar Torrentio oficial
        let upstreamBase = "https://torrentio.strem.fun";
        const parts = pathname.split("/stream/");
        if (parts.length > 1 && parts[0].length > 1) {
            const potentialConfig = parts[0].replace(/^\//, "");
            if (potentialConfig && potentialConfig !== "manifest.json") {
                upstreamBase = `https://torrentio.strem.fun/${potentialConfig}`;
            }
        }

        const upstreamUrl = `${upstreamBase}/stream/${type}/${id}.json`;

        try {
            const data = await fetchJson(upstreamUrl);
            if (data && Array.isArray(data.streams)) {
                data.streams = data.streams.map(stream => {
                    if (stream.infoHash) {
                        const existingSources = stream.sources || [];
                        const dhtSource = "dht:" + stream.infoHash;
                        const mergedSources = Array.from(new Set(existingSources.concat(trackers).concat([dhtSource])));

                        return {
                            ...stream,
                            name: `🚀 ${stream.name || "Torrent"}`,
                            title: `${stream.title || ""}\n⚡ [+${trackers.length} Trackers Extra]`,
                            sources: mergedSources
                        };
                    }
                    return stream;
                });
            }
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            return res.end(JSON.stringify(data || { streams: [] }));
        } catch (err) {
            console.error("[Addon] Error consultando upstream Torrentio:", err.message);
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            return res.end(JSON.stringify({ streams: [] }));
        }
    }

    res.statusCode = 404;
    res.end("Not found");
}

const server = http.createServer(handleRequest);

if (require.main === module) {
    server.listen(PORT, "0.0.0.0", () => {
        const localIP = getLocalIP();
        console.log(`==========================================================`);
        console.log(`  🚀 Stremio Tracker-Boost Addon ACTIVO`);
        console.log(`  En este Mac:   http://127.0.0.1:${PORT}/manifest.json`);
        console.log(`  En tu Wi-Fi:   http://${localIP}:${PORT}/manifest.json`);
        console.log(`  Panel Web:     http://127.0.0.1:${PORT}/configure`);
        console.log(`==========================================================`);
    });
}

module.exports = handleRequest;
