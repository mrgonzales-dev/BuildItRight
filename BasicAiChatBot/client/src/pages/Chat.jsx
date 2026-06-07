import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
    else setMessages([])
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const data = await api.conversation.getAll()
      setConversations(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setInitLoading(false)
    }
  }

  const loadMessages = async (id) => {
    try {
      const data = await api.message.getByConversation(id)
      setMessages(data)
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setLoading(true)

    try {
      const response = await api.ai.chat(selectedId, userMsg)

      setSelectedId(response.conversation.id)

      const updatedMessages = await api.message.getByConversation(response.conversation.id)
      setMessages(updatedMessages)

      setConversations(prev => {
        const exists = prev.find(c => c.id === response.conversation.id)
        if (exists) {
          return prev.map(c => c.id === response.conversation.id ? response.conversation : c)
        }
        return [response.conversation, ...prev]
      })
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to get AI response. Check your API key and try again. Your message was saved but the AI didn\'t respond.')
      loadMessages(selectedId)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const newChat = () => {
    setSelectedId(null)
    setMessages([])
  }

  const deleteConversation = async (e, id) => {
    e.stopPropagation()
    try {
      await api.conversation.delete(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (selectedId === id) {
        const remaining = conversations.filter(c => c.id !== id)
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id)
        } else {
          setSelectedId(null)
          setMessages([])
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }

  const selectedConv = conversations.find(c => c.id === selectedId)

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            AI ChatBot
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={newChat} style={{ width: '100%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Chat
          </button>
        </div>
        <div className="conversation-list">
          {initLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
          ) : conversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet.<br/>Start a new chat!</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedId === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedId(conv.id)}
              >
                <span className="conv-title">{conv.title}</span>
                <button className="conv-delete" onClick={(e) => deleteConversation(e, conv.id)} title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedConv && (
          <div className="chat-header">
            <h3>{selectedConv.title}</h3>
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              <h2>How can I help you today?</h2>
              <p>Ask me anything — I'm powered by Groq AI and ready to assist.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant">
              <div className="loading-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="chat-error-banner">
            {error}
            <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
          </div>
        )}
      </div>
    </div>
  )
}
