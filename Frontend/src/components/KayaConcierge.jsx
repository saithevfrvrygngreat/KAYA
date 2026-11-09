import { useState, useRef, useEffect } from 'react'

const queryTrainer = {
  why: 'At **KaYa**, we believe living spaces should not merely be decorated, but masterfully harmonized. Through our bespoke material selections, customizable canvas modules, and multi-modal **AI Spatial Harmonizer**, we curate pure environmental tranquility tailored exclusively to your sensory profile. We offer true quiet luxury for estates, reading zones, and styling nooks.',
  what: 'KaYa represents the absolute frontier of quiet architectural luxury. We provide tailor-made products like custom cotton rag canvas wall arts, solid teak hexagonal mirrors, hand-knotted macrame details, and warm artisan ceramic lighting coordinates that you can design and personalize using our AI Art Spec generators.',
  spatial: 'KaYa’s **Bespoke Spatial Harmonizer** is a multi-modal neural space planner. By uploading your room dimensions, specifying lighting configurations, and setting your aesthetic objective, our AI analyzes the coordinates and curates perfect spatial swatches, styling tips, and catalog complements in real-time.',
  order: 'Simply browse our collection in the **Products** section. Click **Customize** on any piece (like our Custom Canvas Wall Art, table lamps, or throws) to open the KaYa Design Studio. Here you can generate bespoke patterns using our integrated AI Art Spec Generator, choose sizes/finishes, and add the personalized result directly to your cart.',
  payment: 'We support fully secured transactions via Credit/Debit Cards, UPI, Google Pay, and Paytm, fully protected with 256-bit SSL encryption. All transactions are securely routed via Razorpay for ultimate peace of mind.',
  cart: 'To view your selected items, click the shopping bag icon in the header navbar. If you have custom pieces, you will see your generated colors, frames, and sizes loaded dynamically, ready for checkout.'
}

export default function KayaConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome to **KaYa**. I am your personal space harmonizer.<br><br>I am trained to answer questions about why KaYa is the ultimate sanctuary for bespoke home decor, how our AI Room Harmonizer works, or guide you through your catalog selections. How can I inspire your space today?'
    }
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const processBotResponse = (query) => {
    const lower = query.toLowerCase()
    let answer = ''

    if (lower.includes('why') || lower.includes('purpose') || lower.includes('website is for') || lower.includes('reason')) {
      answer = queryTrainer.why
    } else if (lower.includes('what is') && (lower.includes('kaya') || lower.includes('this site'))) {
      answer = queryTrainer.what
    } else if (lower.includes('harmonizer') || lower.includes('spatial') || lower.includes('room designer') || lower.includes('ai planner') || lower.includes('ai')) {
      answer = queryTrainer.spatial
    } else if (lower.includes('how to') || lower.includes('order') || lower.includes('buy') || lower.includes('customize')) {
      answer = queryTrainer.order
    } else if (lower.includes('pay') || lower.includes('payment') || lower.includes('secure') || lower.includes('razorpay')) {
      answer = queryTrainer.payment
    } else if (lower.includes('cart') || lower.includes('checkout') || lower.includes('bag')) {
      answer = queryTrainer.cart
    } else {
      answer = 'That is an interesting aesthetic perspective. Pairings of warm alabaster tones, organic oak foundations, and custom canvas pieces from KaYa will serve your estate beautifully.<br><br>Would you like to try customizing a custom frame or run coordinates through our **Bespoke Spatial Harmonizer**?'
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: answer }])
    }, 600)
  }

  const handleSend = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : input).trim()
    if (!text) return
    setMessages((prev) => [...prev, { sender: 'user', text }])
    if (typeof textToSend !== 'string') setInput('')
    processBotResponse(text)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          id="kaya-chat-window"
          className="w-[350px] h-[480px] bg-white/95 dark:bg-stone-950/95 border border-stone-200 dark:border-stone-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-stone-900 to-stone-950 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">temp_preferences_custom</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-white border border-stone-900"></span>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-stone-100">KaYa Concierge</h3>
                <p className="text-[9px] text-stone-400 font-medium">Bespoke Design Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div id="kaya-chat-messages" className="flex-1 p-5 overflow-y-auto space-y-4 text-xs scrollbar-thin">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-amber-500 text-[14px]">temp_preferences_custom</span>
                  </div>
                )}
                <div
                  className={
                    msg.sender === 'user'
                      ? 'bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl rounded-tr-none text-stone-800 dark:text-stone-200 max-w-[85%] leading-relaxed font-semibold'
                      : 'bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-900 p-4 rounded-2xl rounded-tl-none text-stone-700 dark:text-stone-300 leading-relaxed max-w-[85%]'
                  }
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}

            {/* Pre-programmed FAQ chips */}
            <div className="flex flex-wrap gap-2 pt-2" id="chat-faq-chips">
              {[
                'Why KaYa?',
                'What is the Spatial Harmonizer?',
                'How to order customizable products?',
                'Secure payment options?'
              ].map((faq) => (
                <button
                  key={faq}
                  onClick={() => handleSend(faq)}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl transition-all font-semibold hover:border-amber-500/40 text-[9px]"
                >
                  {faq}
                </button>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-4 py-2.5 rounded-xl text-xs text-primary focus:outline-none focus:border-amber-500/60"
              placeholder="Ask about KaYa, styling, custom canvas..."
            />
            <button
              onClick={() => handleSend()}
              className="bg-stone-900 text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Circle Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 relative group border border-amber-500/20"
        aria-label="Open KaYa Concierge"
      >
        <span className="material-symbols-outlined text-[24px]">forum</span>
        <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-500 border border-stone-900 animate-pulse"></span>
        <span className="absolute right-16 bg-stone-900 text-white font-label-sm uppercase tracking-widest text-[9px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
          KaYa Concierge
        </span>
      </button>
    </div>
  )
}

