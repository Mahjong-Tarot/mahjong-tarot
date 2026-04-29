import { todayInLA } from '../../lib/almanac';

export default function AlmanacIndex() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: `/almanac/${todayInLA()}`,
      permanent: false,
    },
  };
}
