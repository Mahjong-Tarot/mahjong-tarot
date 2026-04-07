import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/blog/posts/blood-moon-rising-in-the-year-of-the-fire-horse');
  }, [router]);
  return null;
}
