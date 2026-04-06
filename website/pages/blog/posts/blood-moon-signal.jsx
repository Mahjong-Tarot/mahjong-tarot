// Redirects to the updated post
export async function getServerSideProps() {
  return { redirect: { destination: '/blog/posts/blood-moon-rising-in-the-year-of-the-fire-horse', permanent: true } };
}
export default function Redirect() { return null; }
