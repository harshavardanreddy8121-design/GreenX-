import { useLocation } from 'react-router-dom';
import AdminFarmWeather from '@/pages/admin/AdminFarmWeather';

export default function FieldManagerWeather() {
  const location = useLocation();
  const farm = location.state?.farm;
  return <AdminFarmWeather role="fieldmanager" backPath="/fieldmanager" farm={farm} />;
}
