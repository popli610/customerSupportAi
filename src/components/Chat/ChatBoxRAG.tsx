'use client'

import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { useChat } from "ai/react"
import { useRef, useEffect } from 'react'
import SendIcon from "@mui/icons-material/Send";
import { useSession } from "next-auth/react";



export function ChatBoxRAG() {

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'api/symptoms',
    onError: (e) => {
      console.log(e)
    }
  })

  const session = useSession()
const fullNameFormatted = session?.data?.user?.name?.split(" ").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(" ") || ''


  const chatParent = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const domNode = chatParent.current
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight
    }
  })

  return !session.data? (
    
      
    <main className="flex flex-col w-[30vw] h-screen max-h-dvh  mt-10 bg-slate-300 
    left-0 rounded-lg">

      <header className="p-4 border-b w-full max-w-3xl mx-auto">
        <h1
          // className="text-2xl text-slate-800 font-bold">
          className="p-5 bg-gradient-to-r from-blue-100 to-white text-gray-900 rounded-t-lg shadow-lg font-bold uppercase">

Medi
<span className="text-blue-500">

KnowBot
</span>
</h1>
      </header>

      <section className="p-4 gap-1">
        <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto items-center">
          <input className="flex-1 min-h-[40px] text-slate-900"
            placeholder="Type your question here..." type="text"
            value={input} onChange={handleInputChange} />
          <button
            type="submit"
            className={`p-3 rounded-full h-12 w-12 mt-2 mr-2 pt-1
              }`}
          >
            <SendIcon
              sx={{
                fontSize: 28, // Size of the icon to match the image
                transform: "rotate(-40deg)", // Optional: add a slight rotation if you want the icon to tilt
              }}
            />
          </button>
          {/* <button className="ml-2 text-slate-800" type="submit">
                        Submit
                    </button> */}
        </form>
      </section>

      <section className="container px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
        <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4">
          {messages.map((m, index) => (
            <div key={index}>
              {m.role === 'user' ? (
                <li key={m.id} className="flex flex-row">
                  <div className="rounded-xl p-4 bg-blue-400 shadow-md flex">
                    <p className="text-slate-100">{m.content}</p>
                  </div>
                </li>
              ) : (
                <li key={m.id} className="flex flex-row-reverse">
                  <div className="rounded-xl p-4 bg-blue-800  shadow-md flex w-3/4">
                    <p className="text-slate-100">{m.content}</p>
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul >
      </section>
    </main>)
    : null
  
}
