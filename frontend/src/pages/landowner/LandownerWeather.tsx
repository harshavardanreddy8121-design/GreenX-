import AdminFarmWeather from '@/pages/admin/AdminFarmWeather';

// Thin wrapper: delegates to the shared AdminFarmWeather detail page
// with the landowner role context and correct back-navigation path.
export default function LandownerWeather() {
  return <AdminFarmWeather role="landowner" backPath="/landowner" />;
}
