// ============================================
// MEDCONNECT - VERSIÓN MOBILE RESPONSIVE
// ============================================
// Optimizada para funcionar perfectamente en celulares y tablets

import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, Search, Pill, QrCode, Download, Menu, LogOut, Activity, Star, Stethoscope, Video, Bell, Plus, X, CheckCircle, AlertCircle, Save, ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================
// DATOS CONSTANTES
// ============================================

const ALLERGY_LIST = [
  'Penicilina', 'Amoxicilina', 'Aspirina', 'Ibuprofeno', 'Sulfonamidas',
  'Polen', 'Ácaros', 'Polvo', 'Moho', 'Caspa de animales',
  'Maní', 'Frutos secos', 'Mariscos', 'Huevo', 'Leche', 'Trigo', 'Soya',
  'Látex', 'Níquel', 'Fragancias'
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const USERS = {
  patients: [{ 
    id: 'p1', 
    email: 'paciente@test.com', 
    password: '123456', 
    type: 'patient',
    profile: {
      fullName: 'Juan Carlos Pérez López',
      phone: '667-123-4567',
      email: 'paciente@test.com',
      birthDate: '1990-03-15',
      bloodType: 'O+',
      allergies: ['Penicilina', 'Polen'],
      surgeries: ['Apendicectomía (2015)'],
      medicalHistory: [
        { date: '2025-11-20', doctor: 'Dra. María González', diagnosis: 'Hipertensión arterial', treatment: 'Losartán 50mg', notes: 'Control en 3 meses' },
        { date: '2025-08-15', doctor: 'Dr. Carlos Ramírez', diagnosis: 'Gastritis aguda', treatment: 'Omeprazol 20mg', notes: 'Dieta blanda' }
      ]
    }
  }],
  doctors: [{ 
    id: 'd1', 
    email: 'doctor@test.com', 
    password: '123456', 
    type: 'doctor',
    profile: {
      fullName: 'Dra. María González Hernández',
      specialty: 'Cardiología',
      license: '12345678',
      phone: '667-987-6543',
      email: 'doctor@test.com'
    }
  }]
};

const SAMPLE_DOCTORS = [
  { id: 1, name: "Dra. María González", specialty: "Cardiología", photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400", rating: 4.8, reviews: 156, experience: "15 años", symptoms: ["dolor de pecho", "hipertensión"] },
  { id: 2, name: "Dr. Carlos Ramírez", specialty: "Medicina General", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400", rating: 4.9, reviews: 203, experience: "12 años", symptoms: ["fiebre", "tos", "gripe"] }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

const generateCode = () => `RX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
const generateQR = (text) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function App() {
  
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  
  // Estados de UI - MOBILE: sidebar cerrado por defecto en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Estados de datos
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Cita con Dra. González mañana a las 10:00 AM', date: '2026-01-15', read: false }
  ]);
  const [doctorAppointments, setDoctorAppointments] = useState([
    { id: 1, patientName: "Juan Pérez", date: "2026-01-15", time: "10:00", type: "Consulta" },
    { id: 2, patientName: "María López", date: "2026-01-18", time: "11:00", type: "Seguimiento" },
    { id: 3, patientName: "Carlos García", date: "2026-01-22", time: "14:00", type: "Primera vez" }
  ]);
  
  // Estados de recetas
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: ''
  });
  const [generatedPrescriptions, setGeneratedPrescriptions] = useState([]);
  const [qrVerificationCode, setQrVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Estados de modales
  const [showVideoCall, setShowVideoCall] = useState(false);
  
  // Estados de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [showAllergySelector, setShowAllergySelector] = useState(false);
  
  // Estados de calendario
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // ============================================
  // MANEJADORES
  // ============================================

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const user = [...USERS.patients, ...USERS.doctors].find(
      u => u.email === loginEmail && u.password === loginPassword
    );
    
    if (user) {
      setCurrentUser(user);
      setUserType(user.type);
      setIsAuthenticated(true);
      setCurrentView(user.type === 'patient' ? 'search' : 'agenda');
      if (user.type === 'patient') setEditedProfile({...user.profile});
    } else {
      setLoginError('Email o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
    setCurrentView('login');
    setSidebarOpen(false);
  };

  const handleSaveProfile = () => {
    setCurrentUser({ ...currentUser, profile: {...editedProfile} });
    setIsEditingProfile(false);
    alert('Perfil actualizado correctamente');
  };

  const handleToggleAllergy = (allergy, remove = false) => {
    setEditedProfile({
      ...editedProfile,
      allergies: remove 
        ? editedProfile.allergies.filter(a => a !== allergy)
        : [...(editedProfile.allergies || []), allergy]
    });
  };

  const filteredDoctors = SAMPLE_DOCTORS.filter(d => 
    [d.name, d.specialty, ...d.symptoms].some(field => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleBookAppointment = (doctor, date, time) => {
    const apt = {
      id: Date.now(),
      patientName: currentUser.profile.fullName,
      doctorName: doctor.name,
      date,
      time,
      type: "Consulta"
    };
    setPatientAppointments([...patientAppointments, apt]);
    setSelectedDoctor(null);
    alert('¡Cita agendada exitosamente!');
  };

  const updateMed = (i, field, value) => {
    const meds = [...newPrescription.medications];
    meds[i][field] = value;
    setNewPrescription({...newPrescription, medications: meds});
  };

  const addMed = () => {
    setNewPrescription({
      ...newPrescription, 
      medications: [...newPrescription.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleGeneratePrescription = () => {
    const code = generateCode();
    const rx = {
      ...newPrescription,
      code,
      qrUrl: generateQR(code),
      doctorName: currentUser.profile.fullName,
      date: new Date().toISOString().split('T')[0]
    };
    
    setGeneratedPrescriptions([...generatedPrescriptions, rx]);
    setPatientPrescriptions([...patientPrescriptions, rx]);
    setNewPrescription({
      patientName: '',
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: ''
    });
    
    alert('Receta generada exitosamente');
  };

  // ============================================
  // CALENDARIO RESPONSIVE
  // ============================================

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const getAppointmentsForDay = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return doctorAppointments.filter(apt => apt.date === dateStr);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <button 
            onClick={() => currentMonth === 0 ? (setCurrentMonth(11), setCurrentYear(currentYear - 1)) : setCurrentMonth(currentMonth - 1)} 
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-2xl font-bold">{monthNames[currentMonth]} {currentYear}</h2>
          <button 
            onClick={() => currentMonth === 11 ? (setCurrentMonth(0), setCurrentYear(currentYear + 1)) : setCurrentMonth(currentMonth + 1)} 
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
            <div key={i} className="text-center font-semibold text-gray-600 py-2 text-xs md:text-base">
              <span className="hidden md:inline">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i]}</span>
              <span className="md:hidden">{day}</span>
            </div>
          ))}
          
          {[...emptyDays, ...days].map((day, i) => {
            const apts = day ? getAppointmentsForDay(day) : [];
            return (
              <div key={i} className={`min-h-12 md:min-h-24 border rounded p-1 md:p-2 ${day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}`}>
                {day && (
                  <>
                    <div className="font-semibold text-gray-700 text-xs md:text-base">{day}</div>
                    {apts.map(apt => (
                      <div key={apt.id} className="text-[10px] md:text-xs bg-indigo-100 text-indigo-800 rounded px-1 py-0.5 mt-1 truncate">
                        <span className="hidden md:inline">{apt.time} </span>{apt.patientName}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================
  // COMPONENTE MENU ITEM RESPONSIVE
  // ============================================

  const MenuItem = ({ icon: Icon, label, view, badge }) => (
    <button 
      onClick={() => {
        setCurrentView(view);
        setSidebarOpen(false); // MOBILE: Cierra el menú al seleccionar
      }} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation ${
        currentView === view ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );

  // ============================================
  // PANTALLA DE LOGIN
  // ============================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-indigo-100 rounded-full mb-4">
              <Activity className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">MedConnect</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">Tu salud, conectada</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
              className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base" 
              required 
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
              className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base" 
              required 
            />
            
            {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
            
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-3 md:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base touch-manipulation"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-6 text-xs md:text-sm text-gray-600 text-center space-y-1">
            <p>Demo - Paciente: paciente@test.com / 123456</p>
            <p>Demo - Doctor: doctor@test.com / 123456</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // DASHBOARD PRINCIPAL RESPONSIVE
  // ============================================

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* MOBILE: Overlay oscuro cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR RESPONSIVE */}
      <div className={`
        fixed md:relative z-50 md:z-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 h-full
      `}>
        
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">MedConnect</h1>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Menú de navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {userType === 'patient' ? (
            <>
              <MenuItem icon={Search} label="Buscar Doctor" view="search" />
              <MenuItem icon={Calendar} label="Mis Citas" view="appointments" />
              <MenuItem icon={Pill} label="Recetas" view="prescriptions" />
              <MenuItem icon={FileText} label="Historial" view="history" />
              <MenuItem icon={Bell} label="Notificaciones" view="notifications" badge={notifications.filter(n => !n.read).length} />
              <MenuItem icon={User} label="Mi Perfil" view="profile" />
            </>
          ) : (
            <>
              <MenuItem icon={Calendar} label="Agenda" view="agenda" />
              <MenuItem icon={User} label="Pacientes" view="patients" />
              <MenuItem icon={Pill} label="Generar Receta" view="prescriptions" />
              <MenuItem icon={FileText} label="Recetas Generadas" view="prescriptions-list" />
              <MenuItem icon={QrCode} label="Verificar QR" view="verify" />
            </>
          )}
        </nav>

        {/* Botón de cerrar sesión */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 w-full touch-manipulation"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto">
        
        {/* MOBILE: Header con botón de menú hamburguesa */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-indigo-600">MedConnect</h2>
          <div className="w-10" /> {/* Espaciador para centrar el título */}
        </div>

        {/* VISTA: BÚSQUEDA DE DOCTORES */}
        {userType === 'patient' && currentView === 'search' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Buscar Doctor</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, especialidad..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border rounded-lg text-base" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex p-4 md:p-6">
                    <img src={doc.photo} alt={doc.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0" />
                    <div className="ml-3 md:ml-4 flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold truncate">{doc.name}</h3>
                      <p className="text-indigo-600 text-sm md:text-base">{doc.specialty}</p>
                      <div className="flex items-center mt-1 md:mt-2">
                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-xs md:text-sm">{doc.rating} ({doc.reviews})</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{doc.experience}</p>
                    </div>
                  </div>
                  <div className="px-4 md:px-6 pb-4 flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => setSelectedDoctor(doc)} 
                      className="flex-1 px-4 py-2.5 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base touch-manipulation"
                    >
                      Agendar Cita
                    </button>
                    <button 
                      onClick={() => setShowVideoCall(true)} 
                      className="flex-1 sm:flex-none px-4 py-2.5 md:py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2 text-base touch-manipulation"
                    >
                      <Video className="w-4 h-4" /> Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: AGENDAR CITA RESPONSIVE */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl md:text-2xl font-bold">Agendar Cita</h3>
                <button 
                  onClick={() => setSelectedDoctor(null)} 
                  className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4 text-sm md:text-base">Doctor: {selectedDoctor.name}</p>
              <div className="space-y-4">
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border rounded-lg text-base" 
                  id="appointmentDate" 
                />
                <select className="w-full px-4 py-3 border rounded-lg text-base" id="appointmentTime">
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                </select>
                <button 
                  onClick={() => {
                    const date = document.getElementById('appointmentDate').value;
                    const time = document.getElementById('appointmentTime').value;
                    if (date) handleBookAppointment(selectedDoctor, date, time);
                  }} 
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base touch-manipulation"
                >
                  Confirmar Cita
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: MIS CITAS */}
        {userType === 'patient' && currentView === 'appointments' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Mis Citas</h1>
            {patientAppointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center text-gray-500">
                No tienes citas agendadas
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {patientAppointments.map(apt => (
                  <div key={apt.id} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold">{apt.doctorName}</h3>
                        <p className="text-gray-600 text-sm md:text-base">{apt.type}</p>
                        <p className="text-xs md:text-sm text-gray-500">{apt.date} a las {apt.time}</p>
                      </div>
                      <button 
                        onClick={() => setShowVideoCall(true)} 
                        className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-base touch-manipulation whitespace-nowrap"
                      >
                        <Video className="w-4 h-4" /> Videollamada
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: MIS RECETAS */}
        {userType === 'patient' && currentView === 'prescriptions' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Mis Recetas</h1>
            {patientPrescriptions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center text-gray-500">
                No tienes recetas
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {patientPrescriptions.map((rx, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold">{rx.diagnosis}</h3>
                        <p className="text-gray-600 text-sm md:text-base">Dr. {rx.doctorName}</p>
                        <p className="text-xs md:text-sm text-gray-500">{rx.date}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPrescription(rx)} 
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base touch-manipulation"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: HISTORIAL MÉDICO */}
        {userType === 'patient' && currentView === 'history' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Historial Médico</h1>
            <div className="grid gap-3 md:gap-4">
              {currentUser.profile.medicalHistory.map((record, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold">{record.diagnosis}</h3>
                    <span className="text-xs md:text-sm text-gray-500">{record.date}</span>
                  </div>
                  <p className="text-gray-600 mb-2 text-sm md:text-base">Doctor: {record.doctor}</p>
                  <p className="text-gray-700 mb-2 text-sm md:text-base"><strong>Tratamiento:</strong> {record.treatment}</p>
                  <p className="text-gray-600 text-sm md:text-base"><strong>Notas:</strong> {record.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: NOTIFICACIONES */}
        {userType === 'patient' && currentView === 'notifications' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Notificaciones</h1>
            <div className="grid gap-3 md:gap-4">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`bg-white rounded-xl shadow-sm p-4 md:p-6 ${!notif.read ? 'border-l-4 border-indigo-600' : ''}`}
                >
                  <p className="text-gray-800 text-sm md:text-base">{notif.message}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">{notif.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: MI PERFIL */}
        {userType === 'patient' && currentView === 'profile' && (
          <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Mi Perfil</h1>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)} 
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base touch-manipulation"
                >
                  Editar Perfil
                </button>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 max-w-2xl">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <input 
                      type="text" 
                      value={editedProfile.fullName} 
                      onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})} 
                      className="w-full px-4 py-2.5 border rounded-lg text-base" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input 
                      type="tel" 
                      value={editedProfile.phone} 
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})} 
                      className="w-full px-4 py-2.5 border rounded-lg text-base" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                    <input 
                      type="date" 
                      value={editedProfile.birthDate} 
                      onChange={(e) => setEditedProfile({...editedProfile, birthDate: e.target.value})} 
                      className="w-full px-4 py-2.5 border rounded-lg text-base" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de sangre</label>
                    <select 
                      value={editedProfile.bloodType} 
                      onChange={(e) => setEditedProfile({...editedProfile, bloodType: e.target.value})} 
                      className="w-full px-4 py-2.5 border rounded-lg text-base"
                    >
                      {BLOOD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editedProfile.allergies || []).map((allergy, i) => (
                        <span key={i} className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                          {allergy}
                          <button 
                            onClick={() => handleToggleAllergy(allergy, true)} 
                            className="hover:text-red-600 touch-manipulation"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => setShowAllergySelector(!showAllergySelector)} 
                      className="text-indigo-600 text-sm font-medium flex items-center gap-1 touch-manipulation"
                    >
                      <Plus className="w-4 h-4" /> Agregar alergia
                    </button>
                    
                    {showAllergySelector && (
                      <div className="mt-2 p-2 border rounded-lg max-h-48 overflow-y-auto">
                        {ALLERGY_LIST.filter(a => !(editedProfile.allergies || []).includes(a)).map(allergy => (
                          <button
                            key={allergy}
                            onClick={() => {
                              handleToggleAllergy(allergy);
                              setShowAllergySelector(false);
                            }}
                            className="block w-full text-left px-3 py-2.5 hover:bg-gray-100 rounded text-base touch-manipulation"
                          >
                            {allergy}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      onClick={handleSaveProfile} 
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-base touch-manipulation"
                    >
                      <Save className="w-5 h-5" /> Guardar
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditedProfile({...currentUser.profile});
                      }} 
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-base touch-manipulation"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="text-base md:text-lg font-medium">{currentUser.profile.fullName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base md:text-lg font-medium break-all">{currentUser.profile.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="text-base md:text-lg font-medium">{currentUser.profile.phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                    <p className="text-base md:text-lg font-medium">{currentUser.profile.birthDate}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Tipo de sangre</p>
                    <p className="text-base md:text-lg font-medium">{currentUser.profile.bloodType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Alergias</p>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.profile.allergies.map((allergy, i) => (
                        <span key={i} className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Cirugías previas</p>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.profile.surgeries.map((surgery, i) => (
                        <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm">
                          {surgery}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: AGENDA (Doctor) */}
        {userType === 'doctor' && currentView === 'agenda' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Mi Agenda</h1>
            {renderCalendar()}
            
            <div className="mt-6 md:mt-8">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Próximas Citas</h2>
              <div className="grid gap-3 md:gap-4">
                {doctorAppointments.map(apt => (
                  <div key={apt.id} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold">{apt.patientName}</h3>
                        <p className="text-gray-600 text-sm md:text-base">{apt.type}</p>
                        <p className="text-xs md:text-sm text-gray-500">{apt.date} a las {apt.time}</p>
                      </div>
                      <button 
                        onClick={() => setShowVideoCall(true)} 
                        className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-base touch-manipulation whitespace-nowrap"
                      >
                        <Video className="w-4 h-4" /> Iniciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA: PACIENTES (Doctor) */}
        {userType === 'doctor' && currentView === 'patients' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Mis Pacientes</h1>
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="relative mb-4 md:mb-6">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  className="w-full pl-10 pr-4 py-3 border rounded-lg text-base" 
                />
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {['Juan Pérez', 'María López', 'Carlos García'].map((name, i) => (
                  <div key={i} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 cursor-pointer touch-manipulation">
                    <h3 className="font-bold text-base md:text-lg">{name}</h3>
                    <p className="text-xs md:text-sm text-gray-600">Última visita: {['2026-01-10', '2026-01-12', '2026-01-14'][i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA: GENERAR RECETA (Doctor) */}
        {userType === 'doctor' && currentView === 'prescriptions' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Generar Receta Médica</h1>
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 max-w-2xl">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del paciente"
                  value={newPrescription.patientName}
                  onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-lg text-base"
                />
                
                <input
                  type="text"
                  placeholder="Diagnóstico"
                  value={newPrescription.diagnosis}
                  onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-lg text-base"
                />
                
                <div className="border rounded-lg p-3 md:p-4">
                  <h3 className="font-bold mb-3 text-base md:text-lg">Medicamentos</h3>
                  {newPrescription.medications.map((m, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Medicamento"
                        value={m.name}
                        onChange={(e) => updateMed(i, 'name', e.target.value)}
                        className="px-3 py-2.5 border rounded-lg text-base"
                      />
                      <input
                        type="text"
                        placeholder="Dosis"
                        value={m.dosage}
                        onChange={(e) => updateMed(i, 'dosage', e.target.value)}
                        className="px-3 py-2.5 border rounded-lg text-base"
                      />
                      <input
                        type="text"
                        placeholder="Frecuencia"
                        value={m.frequency}
                        onChange={(e) => updateMed(i, 'frequency', e.target.value)}
                        className="px-3 py-2.5 border rounded-lg text-base"
                      />
                      <input
                        type="text"
                        placeholder="Duración"
                        value={m.duration}
                        onChange={(e) => updateMed(i, 'duration', e.target.value)}
                        className="px-3 py-2.5 border rounded-lg text-base"
                      />
                    </div>
                  ))}
                  <button 
                    onClick={addMed} 
                    className="text-indigo-600 text-sm md:text-base font-medium touch-manipulation"
                  >
                    + Agregar medicamento
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleGeneratePrescription}
                className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base touch-manipulation"
              >
                Generar Receta con QR
              </button>
            </div>
          </div>
        )}

        {/* VISTA: RECETAS GENERADAS (Doctor) */}
        {userType === 'doctor' && currentView === 'prescriptions-list' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Recetas Generadas</h1>
            {generatedPrescriptions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center text-gray-500">
                No has generado recetas aún
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {generatedPrescriptions.map((rx, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-2">{rx.patientName}</h3>
                    <p className="text-gray-600 mb-2 text-sm md:text-base">{rx.diagnosis}</p>
                    <p className="text-xs md:text-sm font-mono text-gray-500 mb-3">{rx.code}</p>
                    <button 
                      onClick={() => setSelectedPrescription(rx)} 
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base touch-manipulation"
                    >
                      Ver detalle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: VERIFICAR RECETA (Doctor) */}
        {userType === 'doctor' && currentView === 'verify' && (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Verificar Receta</h1>
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 max-w-md">
              <input
                type="text"
                placeholder="Código de receta"
                value={qrVerificationCode}
                onChange={(e) => setQrVerificationCode(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg mb-4 text-base"
              />
              <button
                onClick={() => {
                  const found = generatedPrescriptions.find(p => p.code === qrVerificationCode);
                  setVerificationResult(found || false);
                }}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg text-base touch-manipulation"
              >
                Verificar
              </button>
              
              {verificationResult !== null && (
                <div className={`mt-6 p-4 rounded-lg ${verificationResult ? 'bg-green-50' : 'bg-red-50'}`}>
                  {verificationResult ? (
                    <div>
                      <p className="text-green-800 font-bold text-base">✓ Receta Válida</p>
                      <p className="text-sm text-green-700">Paciente: {verificationResult.patientName}</p>
                      <p className="text-sm text-green-700">Diagnóstico: {verificationResult.diagnosis}</p>
                    </div>
                  ) : (
                    <p className="text-red-800 font-bold text-base">✗ Receta no encontrada</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DETALLE DE RECETA RESPONSIVE */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl md:text-2xl font-bold">Receta Médica</h3>
              <button 
                onClick={() => setSelectedPrescription(null)} 
                className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Paciente</p>
                <p className="font-medium text-base">{selectedPrescription.patientName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Diagnóstico</p>
                <p className="font-medium text-base">{selectedPrescription.diagnosis}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium text-base">{selectedPrescription.doctorName}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold mb-2 text-base">Medicamentos</h4>
                {selectedPrescription.medications.map((m, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-medium text-sm md:text-base">{m.name}</p>
                    <p className="text-xs md:text-sm text-gray-600">{m.dosage} - {m.frequency} por {m.duration}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Código QR</p>
                <img src={selectedPrescription.qrUrl} alt="QR Code" className="mx-auto w-40 h-40 md:w-48 md:h-48" />
                <p className="text-xs font-mono text-gray-500 mt-2 break-all">{selectedPrescription.code}</p>
              </div>
              
              <button
                onClick={() => window.print()}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-base touch-manipulation"
              >
                <Download className="w-5 h-5" />
                Descargar/Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIDEOLLAMADA RESPONSIVE */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-white">Videollamada</h3>
              <button 
                onClick={() => setShowVideoCall(false)} 
                className="p-2 hover:bg-gray-800 rounded-lg touch-manipulation"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex flex-col items-center justify-center">
              <Video className="w-16 h-16 md:w-24 md:h-24 text-gray-600" />
              <p className="text-white mt-4 text-sm md:text-base">Conectando videollamada...</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <button 
                onClick={() => setShowVideoCall(false)} 
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-base touch-manipulation"
              >
                Colgar
              </button>
              <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-base touch-manipulation">
                Silenciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
