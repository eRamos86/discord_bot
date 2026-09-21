import { createContext } from "../../src/framework/context/createContext.ts";

const client = { user: { id: "1" } } as any;

const args = { raw: ["a", "b", "c"], amount: 15, query: "hello world" };

async function probe(label: string, a: Record<string, any>) {
    const ctx: any = await createContext({ client, args: a } as any);
    console.log(`--- ${label} ---`);
    try { console.log("length:", ctx.args.length); } catch (e) { console.log("length threw:", e.message); }
    try { console.log("[0]:", ctx.args[0], "[2]:", ctx.args[2]); } catch (e) { console.log("index threw:", e.message); }
    try { console.log("join:", JSON.stringify(ctx.args.join(" "))); } catch (e) { console.log("join threw:", e.message); }
    try { console.log("slice:", JSON.stringify(ctx.args.slice(1))); } catch (e) { console.log("slice threw:", e.message); }
    try { console.log("callable('amount'):", ctx.args("amount")); } catch (e) { console.log("call threw:", e.message); }
    try { console.log("getString('query'):", ctx.args.getString("query")); } catch (e) { console.log("getString threw:", e.message); }
    try { console.log("row[0]:", ctx.args.raw[0]); } catch (e) { console.log("raw threw:", e.message); }
    try { console.log("spread:", JSON.stringify([...ctx.args])); } catch (e) { console.log("spread threw:", e.message); }
    try { console.log("name prop (values):", ctx.args.amount); } catch (e) { console.log("prop threw:", e.message); }
    let n = 0; for (const x of ctx.args) { n++; }
    console.log("for..of count:", n);
}

await probe("with raw + named", args);
await probe("empty raw", { raw: [], foo: 1 });