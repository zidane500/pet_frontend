import Echo from "laravel-echo";
import Pusher from "pusher-js";
import client from "../api/client";

type ReverbEcho = Echo<"reverb">;

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

let echoInstance: ReverbEcho | null = null;

function envString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : fallback;
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error("Broadcasting authentication failed.");
}

export function getEcho(): ReverbEcho | null {
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

  echoInstance = new Echo<"reverb">({
    broadcaster: "reverb",
    key,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS,
    enabledTransports: ["ws", "wss"],

    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        client
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(null, response.data);
          })
          .catch((error) => {
            callback(toError(error), null);
          });
      },
    }),
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
