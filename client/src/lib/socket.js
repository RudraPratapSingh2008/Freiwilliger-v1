import { io } from 'socket.io-client'
import store from '../app/store'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// One physical connection per namespace, sharing the same JWT.
const sockets = { chat: null, notify: null }
let currentToken = null
let unsubscribeFromStore = null

const socketOptions = (token) => ({
  auth: { token },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity, // keep retrying — connectSocket() re-runs with a fresh token on refresh
})

const wireDebugHandlers = (socket, label) => {
  socket.on('connect', () => console.log(`[socket:${label}] connected`))
  socket.on('disconnect', (reason) => console.log(`[socket:${label}] disconnected:`, reason))
  socket.on('connect_error', (err) => console.error(`[socket:${label}] connect_error:`, err.message))
}

/**
 * connectSocket(token)
 * Opens (or reuses) the /chat and /notify namespace connections, authenticated
 * with the given access token. Safe to call again with a new token — e.g.
 * after axios refreshes the access token on a 401 — it will tear down the old
 * connections and reconnect with the new one.
 */
export const connectSocket = (token) => {
  if (!token) return null

  if (token === currentToken && sockets.chat?.connected && sockets.notify?.connected) {
    return sockets.chat
  }

  // Tear down any existing connections (old token) before reconnecting.
  sockets.chat?.disconnect()
  sockets.notify?.disconnect()

  currentToken = token

  sockets.chat = io(`${SOCKET_URL}/chat`, socketOptions(token))
  sockets.notify = io(`${SOCKET_URL}/notify`, socketOptions(token))

  wireDebugHandlers(sockets.chat, 'chat')
  wireDebugHandlers(sockets.notify, 'notify')

  // Auto-reconnect on token refresh: whenever the Redux store gets a new
  // accessToken (axios's 401 -> /auth/refresh-token -> setCredentials flow),
  // reconnect both namespaces with it. Subscribed once, reused across calls.
  if (!unsubscribeFromStore) {
    unsubscribeFromStore = store.subscribe(() => {
      const latestToken = store.getState().auth.accessToken
      if (latestToken && latestToken !== currentToken) {
        connectSocket(latestToken)
      }
    })
  }

  return sockets.chat
}

export const disconnectSocket = () => {
  sockets.chat?.disconnect()
  sockets.notify?.disconnect()
  sockets.chat = null
  sockets.notify = null
  currentToken = null
}

/**
 * getSocket(namespace?)
 * namespace: 'chat' (default) | 'notify'
 * Kept backward-compatible with existing `getSocket()` callers, which get
 * the /chat socket by default.
 */
export const getSocket = (namespace = 'chat') => sockets[namespace] || null

export const getChatSocket = () => sockets.chat
export const getNotifySocket = () => sockets.notify