import { useLocation } from 'react-router-dom';
import AdminFarmWeather from '@/pages/admin/AdminFarmWeather';

export default function WorkerWeather() {
  const location = useLocation();
  const farm = location.state?.farm;
  return <AdminFarmWeather role="worker" backPath="/worker" farm={farm} />;
}
