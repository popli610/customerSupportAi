import ChatToggle from "../../components/Chat/ChatToggle";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Customer Support Chatbot
        </h1>
        <ChatToggle />
      </main>
    </div>
  );
};

export default Home;