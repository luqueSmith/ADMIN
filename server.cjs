var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var DB_FILE = import_path.default.join(process.cwd(), "database.json");
var PORT = 3e3;
var DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/12225/12225881.png";
function hashToken(token) {
  return import_crypto.default.createHash("sha256").update(token).digest("hex");
}
var initialSeed = [
  {
    id: "app-1",
    nickname: "XenonGamer99",
    date: new Date(Date.now() - 3 * 3600 * 1050 * 24).toISOString(),
    status: "approved",
    notes: "Excelente comportamiento hist\xF3rico en el canal de discord general.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&q=80&w=150",
    ip: "192.168.1.10",
    tokenHash: hashToken("mock-token-1"),
    bio: "Jugador competitivo de shooters. Me gusta organizar torneos y velar por el juego limpio en la comunidad."
  },
  {
    id: "app-2",
    nickname: "Valery_Strike",
    date: new Date(Date.now() - 1 * 3600 * 1050 * 24).toISOString(),
    status: "pending",
    notes: "Activa en los torneos los fines de semana.",
    rating: 4,
    avatarUrl: DEFAULT_AVATAR,
    ip: "192.168.1.11",
    tokenHash: hashToken("mock-token-2"),
    bio: "Veterana de MMORPGs y defensora de la buena convivencia en los chats de voz."
  },
  {
    id: "app-3",
    nickname: "Ghost_Sniper_PRO",
    date: new Date(Date.now() - 8 * 3600 * 1e3).toISOString(),
    status: "pending",
    avatarUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=150",
    ip: "192.168.1.12",
    tokenHash: hashToken("mock-token-3"),
    bio: "Especialista en t\xE1cticas. Moderador con experiencia previa en servidores grandes de Discord."
  },
  {
    id: "app-4",
    nickname: "NekoKitten",
    date: new Date(Date.now() - 1 * 3600 * 1e3).toISOString(),
    status: "rejected",
    notes: "Reportes antiguos por spam en el foro principal.",
    rating: 2,
    avatarUrl: DEFAULT_AVATAR,
    ip: "192.168.1.13",
    tokenHash: hashToken("mock-token-4"),
    bio: "Estudiante de dise\xF1o gr\xE1fico, apasionada de los videojuegos retro y el mantenimiento del orden."
  }
];
function readDB() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), "utf8");
      return initialSeed;
    }
    const data = import_fs.default.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return [];
  }
}
function writeDB(data) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = forwarded.split(",");
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}
function cleanHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
async function start() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ limit: "10mb", extended: true }));
  app.set("trust proxy", true);
  function validateNickname(name) {
    if (!name) {
      return "El nombre dentro del grupo es obligatorio.";
    }
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 30) {
      return "El apodo debe tener entre 3 y 30 caracteres.";
    }
    const linkRegex = /(https?:\/\/|www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,5}|[a-zA-Z0-9-]+\.(com|net|org|edu|gov|io|info|me|cl|mx|co|es))\b/i;
    if (linkRegex.test(trimmed)) {
      return "No se permiten enlaces o p\xE1ginas web en el apodo.";
    }
    const phoneRegex = /(\+?\d[\s-]?){7,}/;
    if (phoneRegex.test(trimmed)) {
      return "No se permiten n\xFAmeros de tel\xE9fono en el apodo.";
    }
    const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z0-9]{2,}/;
    if (emailRegex.test(trimmed)) {
      return "No se permiten correos electr\xF3nicos en el apodo.";
    }
    const spanishProfanity = [
      "pendejo",
      "mierda",
      "puto",
      "puta",
      "cabron",
      "cabr\xF3n",
      "culero",
      "maricon",
      "maric\xF3n",
      "imbecil",
      "imb\xE9cil",
      "perra",
      "malparido",
      "hdp",
      "hpta",
      "hp",
      "asshole",
      "bitch",
      "fuck",
      "shit",
      "gonorrea",
      "idiota"
    ];
    const normalizedName = trimmed.toLowerCase();
    const hasProfanity = spanishProfanity.some((word) => normalizedName.includes(word));
    if (hasProfanity) {
      return "El apodo contiene palabras inadecuadas u ofensivas.";
    }
    const hasAlphanumeric = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(trimmed);
    if (!hasAlphanumeric) {
      return "El apodo no puede estar formado \xFAnicamente por s\xEDmbolos.";
    }
    return null;
  }
  app.get("/api/applications", (req, res) => {
    const db = readDB();
    const publicList = db.map(({ id, nickname, date, avatarUrl, bio }) => ({
      id,
      nickname,
      date,
      avatarUrl: avatarUrl || DEFAULT_AVATAR,
      bio: bio || ""
    }));
    publicList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(publicList);
  });
  app.get("/api/applications/me", (req, res) => {
    const token = req.header("x-auth-token") || req.query.token;
    if (!token) {
      return res.status(401).json({ error: "Falta el token de autorizaci\xF3n." });
    }
    const db = readDB();
    const hashed = hashToken(token);
    const applicant = db.find((app2) => app2.tokenHash === hashed);
    if (!applicant) {
      return res.status(404).json({ error: "No se encontr\xF3 ning\xFAn perfil asociado a este token." });
    }
    res.json({
      success: true,
      application: {
        id: applicant.id,
        nickname: applicant.nickname,
        date: applicant.date,
        status: applicant.status,
        avatarUrl: applicant.avatarUrl || DEFAULT_AVATAR,
        bio: applicant.bio || ""
      }
    });
  });
  app.post("/api/applications", (req, res) => {
    const rawIp = getClientIp(req);
    const { nickname, avatarUrl, bio } = req.body;
    const validationError = validateNickname(nickname);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    if (bio && typeof bio === "string" && bio.length > 200) {
      return res.status(400).json({ error: "La descripci\xF3n/biograf\xEDa no puede superar los 200 caracteres." });
    }
    const name = nickname.trim();
    const db = readDB();
    if (rawIp) {
      const duplicate = db.find((app2) => app2.ip === rawIp);
      if (duplicate) {
        return res.status(400).json({ error: "\u26A0\uFE0F Ya existe una postulaci\xF3n registrada desde esta conexi\xF3n. Si perdiste el acceso para editar tu perfil, comun\xEDcate con un administrador." });
      }
    }
    const cleanName = cleanHTML(name);
    const cleanBio = bio ? cleanHTML(bio.trim()) : "";
    const secureToken = "tok_" + import_crypto.default.randomBytes(36).toString("hex");
    const securedHash = hashToken(secureToken);
    const newApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nickname: cleanName,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending",
      avatarUrl: avatarUrl ? avatarUrl.trim() : DEFAULT_AVATAR,
      ip: rawIp || null,
      tokenHash: securedHash,
      bio: cleanBio
    };
    db.push(newApplication);
    writeDB(db);
    res.json({
      success: true,
      token: secureToken,
      application: {
        id: newApplication.id,
        nickname: newApplication.nickname,
        date: newApplication.date,
        status: newApplication.status,
        avatarUrl: newApplication.avatarUrl,
        bio: newApplication.bio
      }
    });
  });
  app.put("/api/applications/me/update", (req, res) => {
    const token = req.header("x-auth-token");
    const { nickname, avatarUrl, bio } = req.body;
    if (!token) {
      return res.status(401).json({ error: "Falta el token para autorizar la edici\xF3n." });
    }
    const validationError = validateNickname(nickname);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    if (bio && typeof bio === "string" && bio.length > 200) {
      return res.status(400).json({ error: "La descripci\xF3n/biograf\xEDa no puede superar los 200 caracteres." });
    }
    const name = nickname.trim();
    const cleanName = cleanHTML(name);
    const cleanBio = bio ? cleanHTML(bio.trim()) : "";
    const db = readDB();
    const hashed = hashToken(token);
    const index = db.findIndex((app2) => app2.tokenHash === hashed);
    if (index === -1) {
      return res.status(403).json({ error: "Token inv\xE1lido o expirado. No tienes autorizaci\xF3n para realizar cambios." });
    }
    db[index].nickname = cleanName;
    db[index].avatarUrl = avatarUrl ? avatarUrl.trim() : DEFAULT_AVATAR;
    db[index].bio = cleanBio;
    writeDB(db);
    res.json({
      success: true,
      message: "Tu perfil ha sido actualizado con \xE9xito.",
      application: {
        id: db[index].id,
        nickname: db[index].nickname,
        date: db[index].date,
        status: db[index].status,
        avatarUrl: db[index].avatarUrl,
        bio: db[index].bio || ""
      }
    });
  });
  app.post("/api/admin/auth", (req, res) => {
    const { passcode } = req.body;
    if (passcode === "#Smith099") {
      res.json({ success: true, token: "admin-secret-access-token" });
    } else {
      res.status(401).json({ error: "Contrase\xF1a incorrecta. Intente de nuevo." });
    }
  });
  app.get("/api/admin/applications", (req, res) => {
    const db = readDB();
    const sorted = [...db].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sorted);
  });
  app.put("/api/admin/applications/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes, rating } = req.body;
    const db = readDB();
    const index = db.findIndex((app2) => app2.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Postulaci\xF3n no encontrada." });
    }
    if (status) db[index].status = status;
    if (notes !== void 0) db[index].notes = notes;
    if (rating !== void 0) db[index].rating = rating;
    writeDB(db);
    res.json({ success: true, application: db[index] });
  });
  app.post("/api/admin/applications/:id/regen-token", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const index = db.findIndex((app2) => app2.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Postulaci\xF3n no encontrada." });
    }
    const newRawToken = "tok_" + import_crypto.default.randomBytes(36).toString("hex");
    db[index].tokenHash = hashToken(newRawToken);
    writeDB(db);
    res.json({
      success: true,
      rawToken: newRawToken,
      message: "Se gener\xF3 un nuevo enlace de edici\xF3n. El anterior ha quedado invalidado."
    });
  });
  app.post("/api/admin/applications/:id/unlock-ip", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const index = db.findIndex((app2) => app2.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Postulaci\xF3n no encontrada." });
    }
    db[index].ip = null;
    writeDB(db);
    res.json({ success: true, message: "IP liberada con \xE9xito.", application: db[index] });
  });
  app.delete("/api/admin/applications/:id", (req, res) => {
    const { id } = req.params;
    let db = readDB();
    const initialLength = db.length;
    db = db.filter((app2) => app2.id !== id);
    if (db.length === initialLength) {
      return res.status(404).json({ error: "Postulaci\xF3n no encontrada." });
    }
    writeDB(db);
    res.json({ success: true, message: "Postulaci\xF3n eliminada." });
  });
  app.post("/api/admin/seed", (req, res) => {
    const db = readDB();
    const names = ["MasterGamerr_V", "PentaKill_Lover", "Zero_Cool", "Sky_Blade", "NexusFrenzy"];
    const avatars = [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=150",
      DEFAULT_AVATAR
    ];
    const randomName = `${names[Math.floor(Math.random() * names.length)]}_${Math.floor(10 + Math.random() * 90)}`;
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const mockSeedToken = "tok_seeded_" + Math.random().toString(36).substring(2);
    const seedApp = {
      id: `app-${Date.now()}`,
      nickname: randomName,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending",
      avatarUrl: randomAvatar,
      ip: `seeded-${Math.floor(Math.random() * 1e3)}`,
      tokenHash: hashToken(mockSeedToken)
    };
    db.push(seedApp);
    writeDB(db);
    res.json({ success: true, application: seedApp });
  });
  app.post("/api/admin/reset", (req, res) => {
    writeDB(initialSeed);
    res.json({ success: true, applications: initialSeed });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server loaded running on: http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
