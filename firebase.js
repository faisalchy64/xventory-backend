import { createRequire } from "module";
import admin from "firebase-admin";

const requireImport = createRequire(import.meta.url);
const serviceAccount = requireImport("./serviceAccount.json");

export default admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
