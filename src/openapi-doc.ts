// génère et enregistrer la doc OpenAPI
import { writeFileSync } from "fs";
import { resolve } from "path";
import { swaggerSpec } from "../src/swagger";

// openapi.json à la racine du projet
const outputPath = resolve(__dirname, "..", "openapi.json");

// transforme la configuration swagger en json formaté
writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf8");

console.log(`OpenAPI spec generated at ${outputPath}`);
