const { networkInterfaces } = require("os");

function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  console.log("Available network interfaces with their IPv4 addresses:");
  console.log("----------------------------------------------------");

  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}: ${value.join(", ")}`);
  }

  console.log(
    '\nReplace "YOUR_LOCAL_IP" in apps/frontend/App.tsx with one of these IP addresses.'
  );
  console.log(
    "Typically, you should use the IP address from your primary network interface (e.g., en0 on Mac, eth0 or wlan0 on Linux)."
  );
}

getLocalIpAddress();
