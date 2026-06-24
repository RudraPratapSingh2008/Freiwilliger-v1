import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { connectSocket, getChatSocket } from '../lib/socket'

/**
 * useSocket(conversationId)
 * Joins conv:{conversationId} on mount, leaves it on unmount (or whenever
 * conversationId changes). Requires the user to be authenticated — pulls the
 * access token from Redux to (re)connect the shared /chat socket if needed.
 *
 * Returns: { messages, sendMessage, isTyping, onlineUsers, setTyping }
 * (setTyping is a small addition beyond the original spec, since the chat
 * UI needs a way to actually emit the 'typing' event — see ChatWindow.jsx.)
 */
const useSocket = (conversationId) => {
    const accessToken = useSelector((state) => state.auth.accessToken)
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([])
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        if (!conversationId || !accessToken) return

        let socket = getChatSocket()
        if (!socket?.connected) {
            socket = connectSocket(accessToken)
        }
        if (!socket) return

        socket.emit('join:conversation', conversationId)

        const handleNewMessage = (message) => {
            if (message.conversationId === conversationId) {
                setMessages((prev) => [...prev, message])
            }
        }

        const handleTyping = ({ conversationId: convId, isTyping: typing }) => {
            if (convId !== conversationId) return
            setIsTyping(typing)
            clearTimeout(typingTimeoutRef.current)
            if (typing) {
                // Safety net in case a corresponding "stopped typing" event is dropped
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000)
            }
        }

        const handlePresence = ({ conversationId: convId, onlineUsers: users }) => {
            if (convId === conversationId) {
                setOnlineUsers(users)
            }
        }

        const handleJoinError = (err) => {
            console.error('[useSocket] join:conversation failed:', err?.message)
        }

        socket.on('new:message', handleNewMessage)
        socket.on('user:typing', handleTyping)
        socket.on('presence:update', handlePresence)
        socket.on('error:join', handleJoinError)

        return () => {
            socket.emit('leave:conversation', conversationId)
            socket.off('new:message', handleNewMessage)
            socket.off('user:typing', handleTyping)
            socket.off('presence:update', handlePresence)
            socket.off('error:join', handleJoinError)
            clearTimeout(typingTimeoutRef.current)
            setMessages([])
            setIsTyping(false)
            setOnlineUsers([])
        }
    }, [conversationId, accessToken])

    const sendMessage = useCallback(
        (text, attachments = []) => {
            const socket = getChatSocket()
            if (!socket?.connected || !conversationId) return
            if (!text?.trim() && attachments.length === 0) return
            socket.emit('send:message', { conversationId, text, attachments })
        },
        [conversationId]
    )

    const setTyping = useCallback(
        (typing) => {
            const socket = getChatSocket()
            if (!socket?.connected || !conversationId) return
            socket.emit('typing', { conversationId, isTyping: typing })
        },
        [conversationId]
    )

    return { messages, sendMessage, isTyping, onlineUsers, setTyping }
}

export default useSocket