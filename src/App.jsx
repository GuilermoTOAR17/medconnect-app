import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, Search, Pill, QrCode, Download, Menu, LogOut, Activity, Star, Stethoscope, Video, Bell, Plus, X, CheckCircle, AlertCircle, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const ALLERGY_LIST = [
  'Penicilina', 'Amoxicilina', 'Aspirina', 'Ibuprofeno', 'Sulfonamidas',
  'Polen', 'Ácaros', 'Polvo', 'Moho', 'Caspa de animales',
  'Maní', 'Frutos secos', 'Mariscos', 'Huevo', 'Leche', 'Trigo', 'Soya',
  'Látex', 'Níquel', 'Fragancias'
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const USERS = {
  patients: [
    { 
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
    }
  ],
  doctors: [
    { 
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
    }
  ]
};

const SAMPLE_DOCTORS = [
  {
    id: 1,
    name: "Dra. María González",
    specialty: "Cardiología",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    rating: 4.8,
    reviews: 156,
    experience: "15 años",
    symptoms: ["dolor de pecho", "hipertensión"]
  },
  {
    id: 2,
    name: "Dr. Carlos Ramírez",
    specialty: "Medicina General",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    rating: 4.9,
    reviews: 203,
    experience: "12 años",
    symptoms: ["fiebre", "tos", "gripe"]
  }
];

const generateCode = () => `RX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
const generateQR = (text) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: ''
  });
  const [generatedPrescriptions, setGeneratedPrescriptions] = useState([]);
  const [qrVerificationCode, setQrVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [showAllergySelector, setShowAllergySelector] = useState(false);
  
  // Estados para calendario del doctor
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const patient = USERS.patients.find(u => u.email === loginEmail && u.password === loginPassword);
    if (patient) {
      setCurrentUser(patient);
      setUserType('patient');
      setIsAuthenticated(true);
      setCurrentView('search');
      setEditedProfile({...patient.profile});
      return;
    }
    const doctor = USERS.doctors.find(u => u.email === loginEmail && u.password === loginPassword);
    if (doctor) {
      setCurrentUser(doctor);
      setUserType('doctor');
      setIsAuthenticated(true);
      setCurrentView('agenda');
      return;
    }
    setLoginError('Email o contraseña incorrectos');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
    setCurrentView('login');
  };

  const handleSaveProfile = () => {
    setCurrentUser({
      ...currentUser,
      profile: {...editedProfile}
    });
    setIsEditingProfile(false);
    alert('Perfil actualizado correctamente');
  };

  const handleAddAllergy = (allergy) => {
    if (!editedProfile.allergies.includes(allergy)) {
      setEditedProfile({
        ...editedProfile,
        allergies: [...editedProfile.allergies, allergy]
      });
    }
  };

  const handleRemoveAllergy = (allergy) => {
    setEditedProfile({
      ...editedProfile,
      allergies: editedProfile.allergies.filter(a => a !== allergy)
    });
  };

  const filteredDoctors = SAMPLE_DOCTORS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.symptoms.some(s => s.includes(searchTerm.toLowerCase()))
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
    setDoctorAppointments([...doctorAppointments, apt]);
    setNotifications([{
      id: Date.now(),
      message: `Cita con ${doctor.name} el ${date} a las ${time}`,
      date: new Date().toLocaleDateString(),
      read: false
    }, ...notifications]);
    alert('¡Cita agendada!');
    setSelectedDoctor(null);
  };

  const handleGeneratePrescription = () => {
    if (!newPrescription.patientName || !newPrescription.diagnosis) {
      alert('Completa los campos requeridos');
      return;
    }
    const code = generateCode();
    const rx = {
      ...newPrescription,
      code,
      date: new Date().toLocaleDateString('es-MX'),
      doctorName: currentUser.profile.fullName,
      doctorLicense: currentUser.profile.license,
      qrUrl: generateQR(code)
    };
    setGeneratedPrescriptions([...generatedPrescriptions, rx]);
    setPatientPrescriptions([...patientPrescriptions, rx]);
    alert(`Receta generada: ${code}`);
    setCurrentView('prescriptions-list');
    setNewPrescription({
      patientName: '',
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: ''
    });
  };

  const updateMed = (idx, field, val) => {
    const meds = [...newPrescription.medications];
    meds[idx][field] = val;
    setNewPrescription({ ...newPrescription, medications: meds });
  };

  const addMed = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [...newPrescription.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const getAppointmentsForDate = (date) => {
    return doctorAppointments.filter(apt => apt.date === date);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const appointments = getAppointmentsForDate(dateStr);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      
      days.push(
        <div
          key={day}
          className={`p-2 border rounded-lg min-h-20 ${isToday ? 'bg-indigo-50 border-indigo-600' : 'bg-white'} ${appointments.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          {appointments.length > 0 && (
            <div className="space-y-1">
              {appointments.slice(0, 2).map(apt => (
                <div key={apt.id} className="text-xs bg-indigo-100 text-indigo-800 p-1 rounded truncate">
                  {apt.time} - {apt.patientName}
                </div>
              ))}
              {appointments.length > 2 && (
                <div className="text-xs text-gray-500">+{appointments.length - 2} más</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold">{monthNames[currentMonth]} {currentYear}</h3>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Stethoscope className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">MedConnect</h1>
            <p className="text-lg text-gray-600">Plataforma de Salud Digital</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{loginError}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Iniciar Sesión
              </button>
            </form>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">👤 Usuarios de prueba:</p>
              <p className="text-xs text-blue-700 mb-1"><strong>Paciente:</strong> paciente@test.com / 123456</p>
              <p className="text-xs text-blue-700"><strong>Doctor:</strong> doctor@test.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = userType === 'patient' ? [
    { view: 'search', icon: <Search className="w-5 h-5" />, label: 'Buscar' },
    { view: 'appointments', icon: <Calendar className="w-5 h-5" />, label: 'Citas' },
    { view: 'history', icon: <FileText className="w-5 h-5" />, label: 'Historial' },
    { view: 'prescriptions-patient', icon: <Pill className="w-5 h-5" />, label: 'Recetas' },
    { view: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Notificaciones', badge: notifications.filter(n => !n.read).length },
    { view: 'profile', icon: <User className="w-5 h-5" />, label: 'Perfil' }
  ] : [
    { view: 'agenda', icon: <Calendar className="w-5 h-5" />, label: 'Agenda' },
    { view: 'prescriptions', icon: <Pill className="w-5 h-5" />, label: 'Nueva Receta' },
    { view: 'prescriptions-list', icon: <FileText className="w-5 h-5" />, label: 'Mis Recetas' },
    { view: 'verify', icon: <QrCode className="w-5 h-5" />, label: 'Verificar' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r transition-all flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-lg">MedConnect</h2>
              <p className="text-xs text-gray-500 truncate">{currentUser.profile.fullName}</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 relative ${
                currentView === item.view ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
              {item.badge > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Salir</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {userType === 'patient' && currentView === 'search' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Buscar Profesionales</h1>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por especialidad o síntomas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid gap-6">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex gap-6">
                    <img src={doctor.photo} alt={doctor.name} className="w-24 h-24 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{doctor.name}</h3>
                          <p className="text-indigo-600 font-medium">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-bold">{doctor.rating}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Agendar Cita
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedDoctor && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                  <h3 className="text-2xl font-bold mb-4">Agendar Cita</h3>
                  <p className="text-gray-600 mb-6">con {selectedDoctor.name}</p>
                  <div className="space-y-4">
                    <input type="date" id="date" className="w-full px-4 py-2 border rounded-lg" min={new Date().toISOString().split('T')[0]} />
                    <select id="time" className="w-full px-4 py-2 border rounded-lg">
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>02:00 PM</option>
                      <option>03:00 PM</option>
                    </select>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        const d = document.getElementById('date').value;
                        const t = document.getElementById('time').value;
                        if (d) handleBookAppointment(selectedDoctor, d, t);
                      }}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg"
                    >
                      Confirmar
                    </button>
                    <button onClick={() => setSelectedDoctor(null)} className="px-6 py-3 border rounded-lg">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {userType === 'patient' && currentView === 'history' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Historial Clínico</h1>
            <div className="grid gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Información Personal
                  </h3>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      Editar Perfil
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editedProfile.fullName}
                        onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium">{currentUser.profile.fullName}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fecha de Nacimiento</p>
                    {isEditingProfile ? (
                      <input
                        type="date"
                        value={editedProfile.birthDate}
                        onChange={(e) => setEditedProfile({...editedProfile, birthDate: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium">{currentUser.profile.birthDate}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tipo de Sangre</p>
                    {isEditingProfile ? (
                      <select
                        value={editedProfile.bloodType}
                        onChange={(e) => setEditedProfile({...editedProfile, bloodType: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {BLOOD_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="font-medium">{currentUser.profile.bloodType}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium">{currentUser.profile.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{currentUser.profile.email}</p>
                  </div>
                </div>
                {isEditingProfile && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditedProfile({...currentUser.profile});
                      }}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Alergias
                  </h3>
                  {isEditingProfile && (
                    <button
                      onClick={() => setShowAllergySelector(!showAllergySelector)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  )}
                </div>
                {showAllergySelector && isEditingProfile && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-sm font-medium mb-2">Selecciona una alergia:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALLERGY_LIST.filter(a => !editedProfile.allergies.includes(a)).map(allergy => (
                        <button
                          key={allergy}
                          onClick={() => {
                            handleAddAllergy(allergy);
                            setShowAllergySelector(false);
                          }}
                          className="px-3 py-2 bg-white border rounded-lg hover:bg-indigo-50 text-sm text-left"
                        >
                          {allergy}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {(isEditingProfile ? editedProfile.allergies : currentUser.profile.allergies).map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm flex items-center gap-2">
                      {a}
                      {isEditingProfile && (
                        <button
                          onClick={() => handleRemoveAllergy(a)}
                          className="hover:bg-red-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {(isEditingProfile ? editedProfile.allergies : currentUser.profile.allergies).length === 0 && (
                    <p className="text-gray-500 text-sm">No hay alergias registradas</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Cirugías Previas
                </h3>
                <ul className="space-y-2">
                  {currentUser.profile.surgeries.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Historial de Consultas</h3>
                <div className="space-y-4">
                  {currentUser.profile.medicalHistory.map((h, i) => (
                    <div key={i} className="border-l-4 border-indigo-600 pl-4 py-2">
                      <p className="font-semibold">{h.diagnosis}</p>
                      <p className="text-sm text-gray-600">{h.doctor} - {h.date}</p>
                      <p className="text-sm"><strong>Tratamiento:</strong> {h.treatment}</p>
                      <p className="text-sm text-gray-600">{h.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {userType === 'patient' && currentView === 'prescriptions-patient' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Mis Recetas</h1>
            {patientPrescriptions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Pill className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No tienes recetas</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {patientPrescriptions.map((rx, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{rx.diagnosis}</h3>
                        <p className="text-sm text-gray-600">{rx.doctorName} - {rx.date}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        Ver QR
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Medicamentos</h4>
                      {rx.medications.map((m, j) => (
                        <div key={j} className="mb-2">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-gray-600">{m.dosage} - {m.frequency}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {userType === 'patient' && currentView === 'notifications' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Notificaciones</h1>
            <div className="grid gap-4">
              {notifications.map(n => (
                <div key={n.id} className={`bg-white rounded-xl shadow-sm p-6 ${!n.read ? 'border-l-4 border-indigo-600' : ''}`}>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-sm text-gray-500">{n.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {userType === 'doctor' && currentView === 'agenda' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Mi Agenda</h1>
            <div className="bg-white rounded-xl shadow-sm p-6">
              {renderCalendar()}
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Próximas Citas</h2>
              <div className="grid gap-4">
                {doctorAppointments.slice(0, 5).map(apt => (
                  <div key={apt.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {apt.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{apt.patientName}</h3>
                        <p className="text-sm text-gray-600">{apt.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {userType === 'doctor' && currentView === 'prescriptions' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Generar Receta</h1>
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del paciente"
                  value={newPrescription.patientName}
                  onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Diagnóstico"
                  value={newPrescription.diagnosis}
                  onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-3">Medicamentos</h3>
                  {newPrescription.medications.map((m, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Medicamento"
                        value={m.name}
                        onChange={(e) => updateMed(i, 'name', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Dosis"
                        value={m.dosage}
                        onChange={(e) => updateMed(i, 'dosage', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Frecuencia"
                        value={m.frequency}
                        onChange={(e) => updateMed(i, 'frequency', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Duración"
                        value={m.duration}
                        onChange={(e) => updateMed(i, 'duration', e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                  ))}
                  <button onClick={addMed} className="text-indigo-600 text-sm font-medium">+ Agregar</button>
                </div>
              </div>
              <button
                onClick={handleGeneratePrescription}
                className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Generar Receta con QR
              </button>
            </div>
          </div>
        )}

        {userType === 'doctor' && currentView === 'prescriptions-list' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Recetas Generadas</h1>
            <div className="grid gap-4">
              {generatedPrescriptions.map((rx, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-2">{rx.patientName}</h3>
                  <p className="text-gray-600 mb-2">{rx.diagnosis}</p>
                  <p className="text-sm font-mono text-gray-500">{rx.code}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {userType === 'doctor' && currentView === 'verify' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Verificar Receta</h1>
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
              <input
                type="text"
                placeholder="Código de receta"
                value={qrVerificationCode}
                onChange={(e) => setQrVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />
              <button
                onClick={() => {
                  const found = generatedPrescriptions.find(p => p.code === qrVerificationCode);
                  setVerificationResult(found || false);
                }}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg"
              >
                Verificar
              </button>
              {verificationResult !== null && (
                <div className={`mt-6 p-4 rounded-lg ${verificationResult ? 'bg-green-50' : 'bg-red-50'}`}>
                  {verificationResult ? (
                    <div>
                      <p className="text-green-800 font-bold">✓ Receta Válida</p>
                      <p className="text-sm text-green-700">Paciente: {verificationResult.patientName}</p>
                    </div>
                  ) : (
                    <p className="text-red-800 font-bold">✗ Receta no encontrada</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">Receta Médica</h3>
              <button onClick={() => setSelectedPrescription(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Paciente</p>
                <p className="font-medium">{selectedPrescription.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Diagnóstico</p>
                <p className="font-medium">{selectedPrescription.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium">{selectedPrescription.doctorName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Medicamentos</h4>
                {selectedPrescription.medications.map((m, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-gray-600">{m.dosage} - {m.frequency} por {m.duration}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Código QR</p>
                <img src={selectedPrescription.qrUrl} alt="QR Code" className="mx-auto w-48 h-48" />
                <p className="text-xs font-mono text-gray-500 mt-2">{selectedPrescription.code}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar/Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">Videollamada</h3>
              <button onClick={() => setShowVideoCall(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              <Video className="w-24 h-24 text-gray-600" />
              <p className="text-white ml-4">Conectando videollamada...</p>
            </div>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Colgar
              </button>
              <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                Silenciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}