import { useLocation } from 'react-router-dom';
import AdminFarmWeather from '@/pages/admin/AdminFarmWeather';

export default function ExpertWeather() {
  const location = useLocation();
  const farm = location.state?.farm;
  return <AdminFarmWeather role="expert" backPath="/expert" farm={farm} />;
}
