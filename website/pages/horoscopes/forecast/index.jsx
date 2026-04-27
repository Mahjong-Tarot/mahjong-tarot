import { todayInLA } from '../../../lib/horoscopes';

export default function ForecastIndex() { return null; }

export async function getServerSideProps() {
  const month = todayInLA().slice(0, 7);
  return {
    redirect: { destination: `/horoscopes/forecast/${month}`, permanent: false },
  };
}
