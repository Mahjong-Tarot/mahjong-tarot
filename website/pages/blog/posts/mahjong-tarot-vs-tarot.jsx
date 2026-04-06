// Redirects to the blog index
export async function getServerSideProps() {
  return { redirect: { destination: '/blog', permanent: true } };
}
export default function Redirect() { return null; }
