const fs = require("fs");
const path = require("path");
const { convertCodeToSvg } = require("js2flowchart");

const outDir = path.join(__dirname, "flowcharts");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "generateFlowchart.js");

files.forEach(file => {
  const code = fs.readFileSync(file, "utf8");
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
console.log("✅ Flowcharts generated in /flowcharts");
