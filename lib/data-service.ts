export interface AthleteRoutine {
  id: string;
  athleteId: string;
  date: string;
  title: string;
  duration: string;
  diet: string;
  completed: boolean;
  coachVerified: boolean;
  exercises: { name: string; sets: string; reps: string; notes: string }[];
}

const MOCK_DB_KEY = "gympro_routines_db";

export const dataService = {
  getRoutines: (): AthleteRoutine[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(MOCK_DB_KEY);
    if (!data) {
      // Seed initial data for Athlete 9012
      const initial: AthleteRoutine[] = [
        {
          id: "r1",
          athleteId: "3", // ID of Juan in auth-context
          date: new Date().toISOString().split("T")[0],
          title: "Día 1: Pierna y Glúteo",
          duration: "60-75 min",
          diet: "Post-entreno: Batido de proteína con plátano y creatina. Cena ligera con pollo a la plancha.",
          completed: false,
          coachVerified: false,
          exercises: [
            { name: "Calentamiento Dinámico", sets: "1", reps: "5-10 min", notes: "Movilidad" },
            { name: "Sentadilla Libre", sets: "4", reps: "10-12", notes: "Controlar bajada" },
            { name: "Prensa Inclinada", sets: "4", reps: "12", notes: "Pies separados" },
          ]
        }
      ];
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveRoutine: (routine: AthleteRoutine) => {
    const routines = dataService.getRoutines();
    const index = routines.findIndex(r => r.id === routine.id);
    if (index >= 0) {
      routines[index] = routine;
    } else {
      routines.push(routine);
    }
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(routines));
  },

  markCompletedByAthlete: (id: string) => {
    const routines = dataService.getRoutines();
    const r = routines.find(x => x.id === id);
    if (r) {
      r.completed = true;
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(routines));
    }
  },

  verifyByCoach: (id: string) => {
    const routines = dataService.getRoutines();
    const r = routines.find(x => x.id === id);
    if (r) {
      r.completed = true; // In case athlete forgot
      r.coachVerified = true;
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(routines));
    }
  }
}

// -----------------------------------------------------
// ATHLETES MODULE MOCK DB
// -----------------------------------------------------

export interface BiometricRecord {
  date: string
  weight: number
  height: number
  chest?: number
  waist?: number
  hips?: number
}

export interface AthleteProfile {
  id: string
  cedula: string
  name: string
  gender: 'M' | 'F'
  coachId: string | null
  phone?: string
  address?: string
  membershipStart: string
  membershipEnd: string
  membershipType?: string // Ej. "Mensual", "Anual"
  lastLogin?: string // Ej. "2026-08-30 (Móvil)"
  attendancePercentage: number
  biometrics: BiometricRecord[]
  profilePicture?: string
}

const ATHLETES_DB_KEY = "gympro_athletes_db";

export const athleteService = {
  getAthletes: (): AthleteProfile[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(ATHLETES_DB_KEY);
    if (!data) {
      const initial: AthleteProfile[] = [
        {
          id: '3', // ID del Atleta de prueba
          cedula: '9012',
          name: 'Atleta Juan',
          gender: 'M',
          coachId: '2', // Entrenador Carlos
          phone: '3001234567',
          address: 'Calle Falsa 123',
          membershipStart: '2026-08-01',
          membershipEnd: '2026-09-01',
          membershipType: 'Mensual PRO',
          lastLogin: 'Ayer (Móvil)',
          attendancePercentage: 85,
          biometrics: [
            { date: '2026-08-01', weight: 80, height: 180 },
            { date: '2026-08-15', weight: 79, height: 180 }
          ]
        },
        {
          id: '4',
          cedula: '9013',
          name: 'María Pérez',
          gender: 'F',
          coachId: null,
          phone: '3009876543',
          address: 'Av Siempre Viva 742',
          membershipStart: '2026-08-15',
          membershipEnd: '2026-11-15',
          membershipType: 'Trimestral',
          lastLogin: 'Hace 2 horas (Web)',
          attendancePercentage: 92,
          biometrics: [
            { date: '2026-08-15', weight: 62, height: 165, chest: 90, waist: 65, hips: 95 }
          ]
        }
      ];
      localStorage.setItem(ATHLETES_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  getAthleteById: (id: string): AthleteProfile | null => {
    return athleteService.getAthletes().find(a => a.id === id) || null;
  },

  updateAthlete: (profile: AthleteProfile) => {
    const athletes = athleteService.getAthletes();
    const index = athletes.findIndex(a => a.id === profile.id);
    if (index >= 0) {
      athletes[index] = profile;
    } else {
      athletes.push(profile);
    }
    localStorage.setItem(ATHLETES_DB_KEY, JSON.stringify(athletes));
  }
}
