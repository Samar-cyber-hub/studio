// This page has been removed as the Media Generation feature is deleted.
// This file can be deleted.
// To prevent build errors, we redirect to another page.
import { redirect } from 'next/navigation';

export default function ObsoleteMediaGenerationPage() {
  redirect('/smart-chat'); // Or any other valid page
  return null;
}
