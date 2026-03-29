import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Use polling so file changes from external editors/tools (e.g. opencode)
  // are picked up reliably by the dev server watcher
  watchOptions: {
    usePolling: true,
    interval: 500,
  },
}

export default nextConfig
