// Oracle Database Types for Java Backend
// Generated type definitions for database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OracleDatabase = {
  tables: {
    attendance: {
      Row: {
        id: string;
        user_id: string;
        farm_id: string | null;
        check_in: string;
        check_out: string | null;
        note: string | null;
      };
      Insert: {
        id?: string;
        user_id: string;
        farm_id?: string | null;
        check_in?: string;
        check_out?: string | null;
        note?: string | null;
      };
      Update: {
        id?: string;
        user_id?: string;
        farm_id?: string | null;
        check_in?: string;
        check_out?: string | null;
        note?: string | null;
      };
    };
    tasks: {
      Row: {
        id: string;
        farm_id: string;
        assigned_to: string;
        title: string;
        description: string;
        status: string;
        due_date: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        farm_id: string;
        assigned_to: string;
        title: string;
        description?: string;
        status?: string;
        due_date: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        farm_id?: string;
        assigned_to?: string;
        title?: string;
        description?: string;
        status?: string;
        due_date?: string;
        created_at?: string;
      };
    };
    farm_assignments: {
      Row: {
        id: string;
        user_id: string;
        farm_id: string;
        role: string;
        assigned_date: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        farm_id: string;
        role: string;
        assigned_date?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        farm_id?: string;
        role?: string;
        assigned_date?: string;
      };
    };
    farms: {
      Row: {
        id: string;
        name: string;
        location: string;
        village: string;
        area_sqm: number;
        owner_id: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        location: string;
        village: string;
        area_sqm: number;
        owner_id: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        location?: string;
        village?: string;
        area_sqm?: number;
        owner_id?: string;
        created_at?: string;
      };
    };
    equipment_requests: {
      Row: {
        id: string;
        user_id: string;
        farm_id: string;
        equipment_type: string;
        status: string;
        request_date: string;
        priority: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        farm_id: string;
        equipment_type: string;
        status?: string;
        request_date?: string;
        priority?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        farm_id?: string;
        equipment_type?: string;
        status?: string;
        request_date?: string;
        priority?: string;
      };
    };
    users: {
      Row: {
        id: string;
        email: string;
        password_hash: string;
        role: string;
        name: string;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        email: string;
        password_hash: string;
        role: string;
        name: string;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        email?: string;
        password_hash?: string;
        role?: string;
        name?: string;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
}
