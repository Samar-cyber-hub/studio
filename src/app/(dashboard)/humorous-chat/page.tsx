
// This route is obsolete and has been merged into /smart-chat.
// This page redirects to the new /smart-chat page.
import { redirect } from 'next/navigation';

export default function ObsoleteHumorousChatPage() {
  redirect('/smart-chat');
  return null; // Redirect will prevent this from rendering
}
