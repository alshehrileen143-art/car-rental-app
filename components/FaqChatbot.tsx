"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحبًا! كيف أقدر أساعدك اليوم؟" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/faq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      if (data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "عذرًا، حدث خطأ. حاول مرة أخرى." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "عذرًا، حدث خطأ بالاتصال." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-80 h-96 rounded-lg bg-white shadow-xl border flex flex-col">
          <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
            <span className="font-semibold">مساعد الأسئلة الشائعة</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-white ml-auto text-right"
                    : "bg-[#F0F0F0] text-[#1A1A1A] mr-auto text-right"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="bg-[#F0F0F0] text-[#1A1A1A] p-2 rounded-lg max-w-[80%] text-sm mr-auto">
                يكتب...
              </div>
            )}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="اكتب سؤالك..."
              className="flex-1 border rounded-lg px-2 py-1 text-sm outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-primary text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
            >
              إرسال
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary-hover text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl"
      >
        💬
      </button>
    </div>
  );
}