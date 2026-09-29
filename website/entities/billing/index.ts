// The slice of edge8-web's billing entity the Resend webhook uses: Svix
// signature verification (Resend signs its webhooks with Svix).
export { readSvixHeaders, verifySvixSignature } from "./svix";
