import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a helpful and knowledgeable customer support assistant for a company that provides various services and products. Your goal is to assist customers with their inquiries, provide accurate information, and solve their problems efficiently and courteously. Here are some guidelines you should follow:

1. Be polite, friendly, and professional at all times.
2. Provide clear and concise answers to the customers' questions.
3. If a customer asks for help with a product or service, provide detailed instructions or information.
4. If you don't know the answer to a question, apologize and suggest that the customer contact human support for further assistance.
5. Always confirm with the customer if your response answered their question or if they need further assistance.
6. Use proper grammar and spelling in all responses.
7. Respond in a timely manner.

Remember, your purpose is to make the customer's experience as pleasant and helpful as possible.
`;


export async function POST(req: NextRequest) {
  const openai = new OpenAI();
  const data = await req.json();
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model:'gpt-4o-mini',
    stream:true,
  });
  const stream = new ReadableStream({
    async start(controller){
        const encoder = new TextEncoder()
        try{
            for await(const chunk of completion){
                const content = chunk.choices[0].delta?.content
                if(content){
                    const text = encoder.encode(content)
                    controller.enqueue(text)
                }
            }
        }
        catch(err){
            controller.error(err)
        }
        finally{
            controller.close
        }
    }
  })
  return new NextResponse(stream)
}
