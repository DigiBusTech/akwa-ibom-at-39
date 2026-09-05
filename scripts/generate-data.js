const fs = require("fs");
const path = require("path");

const firstNames = ["Idongesit","Utibe","Emem","Aniekan","Kufre","Itoro","Imaobong","Eno","Mfon","Ini","Ubong","Edidiong","Nsikan","Iniobong","Ekemini","Blessing","Victor","Precious","Bassey","David","Samuel","Daniel","Emmanuel","Grace","Mercy","Joy","Hope","Faith","Godwin","Sunday","Uduak","Ofonime","Anietie","Ekere","Etebong","Enobong","Abasifreke","Edikan"];
const lastNames = ["Ekpo","Bassey","Udoh","Akpan","Effiong","Okon","Inyang","Edet","Asuquo","Essien","Archibong","Umoh","Etuk","Udo","Ekanem","Antia","Attah","Akpabio","Eno","Umana","Ekong","Isong","Usoro","Etukudo","Ntekim","Udom","Otu","Ekwere","Akpanya","Inam"];
const homeLgas = ["Uyo LGA","Eket LGA","Ikot Ekpene LGA","Oron LGA","Abak LGA","Ikot Abasi LGA","Etinan LGA","Itu LGA","Ibiono Ibom LGA","Mkpat Enin LGA","Nsit Ubium LGA","Onna LGA","Esit Eket LGA","Ibesikpo Asutan LGA","Nsit Ibom LGA","Nsit Atai LGA","Ukanafun LGA","Oruk Anam LGA","Ika LGA","Etim Ekpo LGA","Ini LGA","Ikono LGA","Obot Akara LGA","Essien Udim LGA","Urue-Offong/Oruko LGA","Okobo LGA","Mbo LGA","Udung Uko LGA","Ibeno LGA","Eastern Obolo LGA","Uruan LGA"];
const diasporaLocations = ["Houston, USA (Diaspora)","Atlanta, GA (Diaspora)","London, UK (Diaspora)","Toronto, Canada (Diaspora)","Cotonou, Benin Republic (Diaspora)","Dallas, TX (Diaspora)","Manchester, UK (Diaspora)","Johannesburg, South Africa (Diaspora)","Dubai, UAE (Diaspora)","Calgary, Canada (Diaspora)","New York, USA (Diaspora)","Maryland, USA (Diaspora)"];

function getBadge(score) {
  const pct = Math.round((score / 15) * 100);
  if (pct >= 90) return "Pure Akwa Ibom Legend";
  if (pct >= 70) return "Dakkada Ambassador";
  if (pct >= 40) return "Akwa Ibom Citizen";
  return "JJC for Akwa Ibom";
}

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randScore() {
  const r = Math.random();
  if (r < 0.22) return 15;
  if (r < 0.48) return 14;
  if (r < 0.68) return 13;
  if (r < 0.82) return 12;
  if (r < 0.91) return 11;
  if (r < 0.96) return 10;
  if (r < 0.98) return 9;
  return Math.floor(Math.random() * 4) + 5;
}

const wishes = [
  { a: "Obong Victor Attah", l: "Ibesikpo Asutan LGA", w: "Happy 39th Anniversary to the Land of Promise! May our resourcefulness, unity, and heritage continue to inspire the Nigerian federation. Dakkada!", h: 48 },
  { a: "Pastor Umo Eno", l: "Nsit Ubium LGA", w: "Celebrating 39 years of glory, peace, and golden transformation under the ARISE Agenda. God bless Akwa Abasi Ibom State!", h: 36 },
  { a: "Dr. Anietie Akpan", l: "Atlanta, GA (Diaspora)", w: "From the diaspora community in North America, we send heartfelt prayers. Akwa Ibom at 39 is shining brighter than ever on the global map!", h: 28 },
  { a: "Inemesit Udoh", l: "Uyo LGA", w: "Proud to be born and raised in Uyo! 39 cheers to our beloved state. Cleanest, greenest, and most peaceful state in Africa!", h: 20 },
  { a: "Emem Bassey", l: "London, UK (Diaspora)", w: "Distance cannot dampen our heritage pride. Happy 39th Birthday to our dear Land of Promise! From the UK chapter with love.", h: 14 },
  { a: "Sen. Godswill Akpabio", l: "Essien Udim LGA", w: "39 years of uncommon transformation and boundless promise. May Akwa Ibom continue to arise and lead as a beacon of excellence.", h: 8 },
  { a: "Uyouko Nathaniel Ekpo", l: "Cotonou, Benin Republic (Diaspora)", w: "God bless Akwa Abasi Ibom State ayid! From Benin Republic and across West Africa, we celebrate 39 shades of gratitude and visionary progress.", h: 2 }
];

const now = Date.now();
const submissions = [];
for (let i = 0; i < 1238; i++) {
  const user_name = `${randItem(firstNames)} ${randItem(lastNames)}`;
  const lga = Math.random() < 0.22 ? randItem(diasporaLocations) : randItem(homeLgas);
  const score = randScore();
  const timeOffset = Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000));
  submissions.push({
    user_name,
    lga,
    score,
    total_questions: 15,
    badge_title: getBadge(score),
    created_at: new Date(now - timeOffset).toISOString()
  });
}

const dir = path.join(__dirname, "..", "supabase");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. SQL
let sql = `-- Akwa Ibom @ 39 Data Population (7 Wishes, 1238 Quiz Submissions)
INSERT INTO birthday_wishes (author_name, lga, wish_text, is_approved, created_at) VALUES\n`;
sql += wishes.map(w => `  ('${w.a.replace(/'/g, "''")}', '${w.l.replace(/'/g, "''")}', '${w.w.replace(/'/g, "''")}', true, '${new Date(now - w.h * 3600000).toISOString()}')`).join(",\n") + ";\n\n";

for (let b = 0; b < submissions.length; b += 250) {
  const batch = submissions.slice(b, b + 250);
  sql += `INSERT INTO quiz_submissions (user_name, lga, score, total_questions, badge_title, created_at) VALUES\n`;
  sql += batch.map(s => `  ('${s.user_name.replace(/'/g, "''")}', '${s.lga.replace(/'/g, "''")}', ${s.score}, ${s.total_questions}, '${s.badge_title.replace(/'/g, "''")}', '${s.created_at}')`).join(",\n") + ";\n\n";
}
fs.writeFileSync(path.join(dir, "populate_data.sql"), sql, "utf8");

// 2. CSVs
let wCsv = "author_name,lga,wish_text,is_approved,created_at\n";
wishes.forEach(w => { wCsv += `"${w.a}","${w.l}","${w.w.replace(/"/g, '""')}",true,${new Date(now - w.h * 3600000).toISOString()}\n`; });
fs.writeFileSync(path.join(dir, "birthday_wishes_7.csv"), wCsv, "utf8");

let qCsv = "user_name,lga,score,total_questions,badge_title,created_at\n";
submissions.forEach(s => { qCsv += `"${s.user_name}","${s.lga}",${s.score},${s.total_questions},"${s.badge_title}",${s.created_at}\n`; });
fs.writeFileSync(path.join(dir, "quiz_submissions_1238.csv"), qCsv, "utf8");

console.log("Successfully generated populate_data.sql, birthday_wishes_7.csv, and quiz_submissions_1238.csv");
