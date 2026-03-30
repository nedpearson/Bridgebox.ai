import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, "supabase", "migrations");
const files = fs.readdirSync(dir);

const renames = [
  { startsWith: "20260323194425_", newPrefix: "20260326030001_" },
  { startsWith: "20260325183800_", newPrefix: "20260326030002_" },
  { startsWith: "20260325190000_", newPrefix: "20260326030003_" },
  { startsWith: "20260325220000_", newPrefix: "20260326030004_" },
  { startsWith: "20260326000000_", newPrefix: "20260326030005_" },
];

files.forEach((file) => {
  renames.forEach((rename) => {
    if (file.startsWith(rename.startsWith)) {
      const newFile =
        rename.newPrefix + file.substring(rename.startsWith.length);
      fs.renameSync(path.join(dir, file), path.join(dir, newFile));
      console.log(`Renamed ${file} to ${newFile}`);
    }
  });
});
