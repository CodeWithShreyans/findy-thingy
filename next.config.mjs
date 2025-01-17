import million from "million/compiler"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs")

/** @type {import("next").NextConfig} */
const Nextconfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ["libsql"],
    },
}

export default million.next(Nextconfig)
