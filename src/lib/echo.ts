import Echo from "laravel-echo";
import Pusher from "pusher-js";
import client from "../api/client";

type AuthorizerCallback = (
  error: boolean | Error | null,
  data?: unknown,
) => void;
type EchoChannel = { name: string };

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

let echoInstance: Echo | null = null;

function envString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : fallback;
}

export function getEcho(): Echo | null {
  const token = localStorage.getItem("petconnect_token");
  const key = envString(import.meta.env.VITE_REVERB_APP_KEY);

  if (!token || !key) return null;
  if (echoInstance) return echoInstance;

  const wsHost = envString(
    import.meta.env.VITE_REVERB_HOST,
    window.location.hostname,
  );
  const wsPort = Number(envString(import.meta.env.VITE_REVERB_PORT, "8090"));
  const scheme = envString(import.meta.env.VITE_REVERB_SCHEME, "http");
  const forceTLS = scheme === "https";

  echoInstance = new Echo({
    broadcaster: "reverb",
    key,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS,
    enabledTransports: ["ws", "wss"],
    authorizer: (channel: EchoChannel) => ({
      authorize: (socketId: string, callback: AuthorizerCallback) => {
        client
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(false, response.data))
          .catch((error) => callback(error, undefined));
      },
    }),
  } as any);

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
