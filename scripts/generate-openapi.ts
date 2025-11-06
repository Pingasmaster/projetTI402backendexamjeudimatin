import { writeFileSync } from "fs";
import { resolve } from "path";
import { swaggerSpec } from "../src/swagger";

const outputPath = resolve(__dirname, "..", "openapi.json");

writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf8");

console.log(`OpenAPI spec generated at ${outputPath}`);
