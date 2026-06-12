import { useLocation } from 'react-router-dom';
import AdminFarmWeather from '@/pages/admin/AdminFarmWeather';

// Thin wrapper: delegates to the shared AdminFarmWeather detail page
// with the landowner role context and correct back-navigation path.
// Receives the specific farm via router location state so the weather
// page always shows the farm the user clicked on, not always the first.
export default function LandownerWeather() {
  const location = useLocation();
  const farm = location.state?.farm;
  return <AdminFarmWeather role="landowner" backPath="/landowner" farm={farm} />;
}
