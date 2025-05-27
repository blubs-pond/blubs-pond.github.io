const fs = require("fs");
const path = require("path");
const { convertCodeToSvg } = require("js2flowchart");

// Source folder = one level up from this script (i.e. repo root)
const sourceDir = path.join(__dirname, "..");

// Output folder = inside docs/
const outDir = path.join(__dirname, "flowcharts");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Get all .js files in sourceDir except this script
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith(".js") && f !== "generateFlowchart.js");

files.forEach(file => {
  const filePath = path.join(sourceDir, file);
  const code = fs.readFileSync(filePath, "utf8");
  const svg = convertCodeToSvg(code);
  const filename = path.parse(file).name + ".svg";
  fs.writeFileSync(path.join(outDir, filename), svg);
});

const indexHTML = `
<!DOCTYPE html>
<html>
<head><title>Flowcharts</title></head>
<body>
  <h1>Flowcharts</h1>
  <ul>
    ${files.map(f => {
      const name = path.parse(f).name;
      return `<li><a href="${name}.svg" target="_blank">${name}</a></li>`;
    }).join("\n")}
  </ul>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, "index.html"), indexHTML);
console.log("✅ Flowcharts generated in /docs/flowcharts");
