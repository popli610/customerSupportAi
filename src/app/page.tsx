import Login from "@/components/auth/Login";
import ChatToggle from "../components/Chat/ChatToggle";
import { ChatBoxRAG } from "@/components/Chat/ChatBoxRAG";

const Home: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center">
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Customer Support Chatbot
        </h1>
        <Login />
        <div>

          <ChatBoxRAG />
          <ChatToggle />
        </div>

      </main>
    </div>
  );
};

export default Home;
