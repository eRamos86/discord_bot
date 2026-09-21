const port = Number(process.env.HEALTH_PORT ?? 3000);
try {
    const response = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(5000) });
    process.exitCode = response.ok ? 0 : 1;
} catch {
    process.exitCode = 1;
}
export {};
