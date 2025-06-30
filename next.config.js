/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true, //! change this back after actual deploy.
    dirs: ["src"],
  },
  //   output: "export", //! enable this if fully doing offline for android/ios.
};

export default config;
