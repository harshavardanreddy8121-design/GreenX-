export type AppRole = 'admin' | 'landowner' | 'fieldmanager' | 'expert' | 'worker';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Farm {
  id: string;
  name: string;
  village: string;
  total_land: number;
  crop: string;
  growth_stage: string;
  expected_revenue: number;
  profit_share: number;
  crop_health_score: number;
  sowing_date: string | null;
  harvest_date: string | null;
  soil_ph: number;
  soil_nitrogen: number;
  soil_phosphorus: number;
  soil_potassium: number;
  soil_organic_carbon: number;
  soil_moisture: number;
  contract_summary: string;
  created_by: string | null;
  created_at: string;
}

export interface FarmAssignment {
  id: string;
  farm_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  assigned_to: string;
  farm_id: string;
  status: 'pending' | 'completed';
  due_date: string;
  photo_required: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  farm_id: string | null;
  check_in: string;
  check_out: string | null;
  note: string;
}

export interface Diagnostic {
  id: string;
  farm_id: string;
  expert_id: string;
  pest_risk: string;
  disease_risk: string;
  prescription: string;
  notes: string;
  created_at: string;
}

export interface EquipmentRequest {
  id: string;
  requested_by: string;
  farm_id: string | null;
  category: string;
  item_name: string;
  quantity: string;
  urgency: string;
  note: string;
  status: 'pending' | 'approved' | 'delivered';
  created_at: string;
}

export interface MotorStatus {
  id: string;
  farm_id: string;
  motor_on: boolean;
  pump_type: string;
  last_toggled: string | null;
  toggled_by: string | null;
}
