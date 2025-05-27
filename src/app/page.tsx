import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the first feature page, or implement a landing page here.
  redirect('/humorous-chat');
  // Alternatively, for a landing page:
  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen p-8">
  //     <h1 className="text-5xl font-bold text-primary mb-4">Welcome to PopGPT :AI!</h1>
  //     <p className="text-xl text-foreground mb-8 text-center max-w-2xl">
  //       Your friendly AI companion with a touch of humor and powerful tools for code, media, and social media.
  //     </p>
  //     <Link href="/humorous-chat">
  //       <Button size="lg">Start Chatting</Button>
  //     </Link>
  //   </div>
  // );
}
