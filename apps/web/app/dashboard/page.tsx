'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doctorAPI, appointmentAPI, aiConsultationAPI, Doctor, Appointment, AppointmentCountsByDate } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Icons
import { 
  LogOut, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Video,
  Trash,
  Bot
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, signout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      const response = await appointmentAPI.delete(appointmentToDelete);
      if (response.success) {
        loadAppointments();
        setDeleteModalOpen(false);
        setAppointmentToDelete(null);
      } else {
        alert(response.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Delete appointment error:', error);
      alert('Error deleting appointment');
    }
  };

  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    comments: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [doctorFormOpen, setDoctorFormOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: 0,
    consultationFee: 0,
    bio: '',
    qualifications: '',
  });
  const [doctorFormError, setDoctorFormError] = useState('');
  const [doctorFormLoading, setDoctorFormLoading] = useState(false);
  const [appointmentCounts, setAppointmentCounts] = useState<AppointmentCountsByDate[]>([]);
  const [aiConsultationLoading, setAiConsultationLoading] = useState(false);

  // Derived State
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  // Logic to load appointments
  const loadAppointments = useCallback(async () => {
    try {
      const scope = user?.role === 'doctor' ? 'doctor' : undefined;
      const response = await appointmentAPI.getAll(undefined, scope, user?.role === 'doctor');
      if (response.success) {
        setAppointments(response.data);
        setAppointmentCounts(response.countsByDate || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  }, [user?.role]);

  // Effects
useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated, loadAppointments]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      loadAppointments();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadAppointments]);

  // Queries
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await doctorAPI.getAll();
      return response.data || [];
    },
    enabled: isAuthenticated && !isDoctor,
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (payload: {
      userId: string;
      specialization: string;
      experience: number;
      bio?: string;
      consultationFee: number;
      qualifications?: Array<{ degree: string; institution?: string; year?: number }>;
    }) => doctorAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });

  // Handlers
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
    setBookingError('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingData({
      appointmentDate: tomorrow.toISOString().split('T')[0],
      appointmentTime: '10:00',
      reason: '',
      comments: ''
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    
    if (!selectedDoctor || !bookingData.appointmentDate || !bookingData.appointmentTime || !bookingData.reason) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await appointmentAPI.create({
        doctorId: selectedDoctor._id,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        reason: bookingData.reason,
        comments: bookingData.comments
      });

      if (response.success) {
        setShowBookingForm(false);
        setSelectedDoctor(null);
        setBookingData({ appointmentDate: '', appointmentTime: '', reason: '', comments: '' });
        loadAppointments();
      } else {
        setBookingError(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError('Network error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const response = await appointmentAPI.cancel(appointmentId);
      if (response.success) {
        loadAppointments();
      } else {
        alert(response.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Cancel appointment error:', error);
      alert('Error cancelling appointment');
    }
  };

  const handleStartCall = async (appointmentId: string) => {
    try {
      const response = await appointmentAPI.startCall(appointmentId);
      if (response.success && response.joinUrl) {
        window.open(response.joinUrl, '_blank');
        loadAppointments();
      } else {
        alert(response.message || 'Failed to start call');
      }
    } catch (error) {
      console.error('Start call error:', error);
      alert('Error starting call. Please try again.');
    }
  };

  // NEW: Mark appointment as completed
  const handleCompleteAppointment = async (appointmentId: string) => {
    if (!confirm('Mark this appointment as completed? It will be removed from your schedule.')) return;
    try {
      const response = await appointmentAPI.complete(appointmentId);
      if (response.success) {
        loadAppointments();
      } else {
        alert(response.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Complete appointment error:', error);
      alert('Error completing appointment');
    }
  };

  const handleJoinCall = async (appointmentId: string) => {
    try {
      const response = await appointmentAPI.joinCall(appointmentId);
      if (response.success && response.joinUrl) {
        window.open(response.joinUrl, '_blank');
      } else {
        alert(response.message || 'Failed to join call');
      }
    } catch (error) {
      console.error('Join call error:', error);
      alert('Error joining call. Please try again.');
    }
  };

  const handleJoinAiDoctor = async () => {
    setAiConsultationLoading(true);
    try {
      const response = await aiConsultationAPI.start();
      if (response.success && response.joinUrl) {
        window.open(response.joinUrl, '_blank');
      } else {
        alert(response.message || 'Failed to start AI consultation');
      }
    } catch (error) {
      console.error('AI consultation error:', error);
      alert('Error starting AI consultation. Please try again.');
    } finally {
      setAiConsultationLoading(false);
    }
  };

  const handleOpenDoctorForm = () => {
    setDoctorFormOpen(true);
    setDoctorFormError('');
    setDoctorForm({
      name: '',
      email: '',
      password: '',
      specialization: '',
      experience: 0,
      consultationFee: 0,
      bio: '',
      qualifications: '',
    });
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorFormError('');

    if (!doctorForm.name || !doctorForm.email || !doctorForm.password || !doctorForm.specialization) {
      setDoctorFormError('Please fill in all required fields');
      return;
    }

    setDoctorFormLoading(true);
    try {
      const signupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: doctorForm.email,
          password: doctorForm.password,
          name: doctorForm.name,
        }),
      });
      const signupData = await signupRes.json();
      if (!signupData.success || !signupData.data?.user?.id) {
        throw new Error(signupData.message || 'Failed to create user');
      }

      const userId = signupData.data.user.id;
      const qualificationsArray = doctorForm.qualifications
        ? doctorForm.qualifications.split(',').map(q => ({ degree: q.trim() })).filter(q => q.degree)
        : [];

      const res = await createDoctorMutation.mutateAsync({
        userId,
        specialization: doctorForm.specialization,
        experience: Number(doctorForm.experience) || 0,
        bio: doctorForm.bio || undefined,
        consultationFee: Number(doctorForm.consultationFee) || 0,
        qualifications: qualificationsArray,
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to create doctor');
      }

      setDoctorFormOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error creating doctor';
      setDoctorFormError(message);
    } finally {
      setDoctorFormLoading(false);
    }
  };

  // Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'completed': return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };
   
  const stats = {
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!isAuthenticated) return null;

  const todayStr = new Date().toLocaleDateString('en-CA');

  // Today's appointments — excludes completed and cancelled
  const todaysAppointments = isDoctor
    ? appointments
        .filter((a) => a.appointmentDate.slice(0, 10) === todayStr && a.status !== 'completed' && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    : [];

  // Future appointments — excludes completed and cancelled
  const upcomingAppointments = isDoctor
    ? appointments
        .filter((a) => a.appointmentDate.slice(0, 10) > todayStr && a.status !== 'completed' && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    : [];

  const activeAppointments = appointments.filter(
    a => a.status !== 'completed' && a.status !== 'cancelled'
  );
  const dayLoadMap = activeAppointments.reduce((acc, a) => {
    const date = a.appointmentDate.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const highestDayLoad = Math.max(...Object.values(dayLoadMap), 0);
  const totalUpcoming = activeAppointments.filter(
    a => a.appointmentDate.slice(0, 10) >= todayStr
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans section-padding">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold font-display">CarePulse</Link>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleOpenDoctorForm} className="gap-2">
                <Plus className="w-4 h-4" /> Add Doctor
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(user?.name || 'U').charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">{user?.name || user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            {isDoctor ? 'Here is your schedule for today.' : 'Manage your focus and health.'}
          </p>
        </div>

        {isDoctor ? (
          // DOCTOR VIEW
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary/5 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold font-display">{todaysAppointments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold font-display">{appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Highest Day Load</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold font-display">{Math.max(...upcomingAppointments
  .reduce((acc, a) => {
    const date = a.appointmentDate.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
  .values ? Object.values(upcomingAppointments
  .reduce((acc, a) => {
    const date = a.appointmentDate.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)) : [0], 0)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Today + Upcoming */}
              <div className="lg:col-span-2 space-y-8">

                {/* Today's Schedule */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-display">Today's Schedule</h2>
                  {todaysAppointments.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground bg-muted/20 border-dashed">
                      No appointments scheduled for today.
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {todaysAppointments.map(app => (
                        <Card key={app._id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{app.patient.name}</h3>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                                    {app.status}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                  {app.reason}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <Button size="sm" className="flex-1 md:flex-none gap-2" onClick={() => handleStartCall(app._id)}>
                                <Video className="w-4 h-4" /> Start Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 md:flex-none gap-2 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
                                onClick={() => handleCompleteAppointment(app._id)}
                              >
                                <CheckCircle className="w-4 h-4" /> Done
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteAppointment(app._id)}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Appointments */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-display">Upcoming Appointments</h2>
                  {upcomingAppointments.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground bg-muted/20 border-dashed">
                      No upcoming appointments.
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map(app => (
                        <Card key={app._id} className="overflow-hidden hover:shadow-md transition-shadow opacity-90">
                          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{app.patient.name}</h3>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                                    {app.status}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(app.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                  <Clock className="w-3 h-3" />
                                  {app.appointmentTime}
                                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                  {app.reason}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 text-muted-foreground" disabled>
                                <Video className="w-4 h-4" /> Call on {new Date(app.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteAppointment(app._id)}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right: Overview */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-display">Overview</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Upcoming Load</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
{Object.entries(dayLoadMap).slice(0, 5).map(([date, count]) => (
  <div key={date} className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">
      {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
    </span>
    <span className="font-semibold">{count} bookings</span>
  </div>
))}
{Object.keys(dayLoadMap).length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

        ) : (
          // PATIENT VIEW
          <div className="space-y-12">
            {/* Patient Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-3xl font-bold text-green-600">{stats.scheduled}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scheduled</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Doctor – join call */}
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/10 dark:bg-primary/20">
                    <Bot className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display">Talk to AI Doctor</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Start a video call and speak with our AI assistant for guidance. No appointment needed.
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="gap-2 shrink-0"
                  onClick={handleJoinAiDoctor}
                  disabled={aiConsultationLoading}
                >
                  <Video className="w-5 h-5" />
                  {aiConsultationLoading ? 'Starting…' : 'Join call with AI Doctor'}
                </Button>
              </CardContent>
            </Card>

            {/* Doctors List */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-display">Find a Doctor</h2>
              </div>
              {loadingDoctors ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl" />)}
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No doctors available right now.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map(doc => (
                    <Card key={doc._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{doc.user.name}</CardTitle>
                            <p className="text-sm text-primary font-medium">{doc.specialization}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">${doc.consultationFee}</div>
                            <div className="text-xs text-muted-foreground">per visit</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{doc.experience} years exp.</span>
                          <span>⭐ {doc.rating.average.toFixed(1)}</span>
                        </div>
                        {doc.bio && <p className="text-sm text-muted-foreground line-clamp-2">{doc.bio}</p>}
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => handleBookAppointment(doc)}>Book Appointment</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Appointments List */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-display">Your Appointments</h2>
              {appointments.length === 0 ? (
                <Card className="p-12 text-center bg-muted/10 border-dashed">
                  <h3 className="text-xl font-medium mb-2">No appointments yet</h3>
                  <p className="text-muted-foreground">Book your first appointment with one of our specialists above.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {appointments.map(app => (
                    <Card key={app._id} className="overflow-hidden">
                      <div className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{app.status === 'scheduled' ? 'Scheduled Visit' : app.status === 'completed' ? 'Completed Visit' : 'Pending Request'}</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" /> Dr. {app.doctor.user.name} ({app.doctor.specialization})
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> {new Date(app.appointmentDate).toLocaleDateString()} at {app.appointmentTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> {app.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {app.status !== 'cancelled' && app.status !== 'completed' && (
                            <>
                              <Button variant="default" size="sm" className="flex-1 md:flex-none gap-2" onClick={() => handleJoinCall(app._id)}>
                                <Video className="w-4 h-4" /> Join Call
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 md:flex-none text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleCancelAppointment(app._id)}>
                                Cancel
                              </Button>
                            </>
                          )}
                          <Button variant="destructive" size="sm" className="flex-1 md:flex-none gap-2" onClick={() => handleDeleteAppointment(app._id)}>
                            <Trash className="w-4 h-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* MODALS */}

      {/* Delete Confirmation Modal */}
      <Modal.Modal active={deleteModalOpen} onClickOutside={() => setDeleteModalOpen(false)}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>Delete Appointment</Modal.Title>
            <Modal.Subtitle>Are you sure you want to delete this appointment? This action cannot be undone.</Modal.Subtitle>
          </Modal.Header>
        </Modal.Body>
        <Modal.Actions>
          <Modal.Action onClick={() => setDeleteModalOpen(false)} type="secondary">
            Cancel
          </Modal.Action>
          <Modal.Action onClick={confirmDelete} type="error">
            Delete
          </Modal.Action>
        </Modal.Actions>
      </Modal.Modal>

      {/* Add Doctor Modal */}
      <Modal.Modal active={doctorFormOpen} onClickOutside={() => setDoctorFormOpen(false)}>
        <form onSubmit={handleCreateDoctor}>
          <Modal.Body className="max-h-[80vh]">
            <Modal.Header>
              <Modal.Title>Add New Doctor</Modal.Title>
            </Modal.Header>
            <div className="space-y-4">
              {doctorFormError && (
                <div className="p-3 text-sm bg-red-50 text-red-500 rounded-lg">{doctorFormError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} required placeholder="Dr. Name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} required placeholder="email@carepulse.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={doctorForm.password} onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input value={doctorForm.specialization} onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} required placeholder="Cardiology" />
                </div>
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <Input type="number" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: Number(e.target.value)})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fee ($)</Label>
                  <Input type="number" value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: Number(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <Label>Qualifications</Label>
                  <Input value={doctorForm.qualifications} onChange={e => setDoctorForm({...doctorForm, qualifications: e.target.value})} placeholder="MBBS, MD" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})} placeholder="Short bio..." />
              </div>
            </div>
          </Modal.Body>
          <Modal.Actions>
            <Modal.Action htmlType="button" onClick={() => setDoctorFormOpen(false)} type="secondary">
              Cancel
            </Modal.Action>
            <Modal.Action htmlType="submit" loading={doctorFormLoading} disabled={doctorFormLoading}>
              Create Doctor
            </Modal.Action>
          </Modal.Actions>
        </form>
      </Modal.Modal>

      {/* Booking Modal */}
      <Modal.Modal active={showBookingForm && !!selectedDoctor} onClickOutside={() => setShowBookingForm(false)}>
        {selectedDoctor && (
          <form onSubmit={handleSubmitBooking}>
            <Modal.Body className="w-[500px]">
              <Modal.Header>
                <Modal.Title>Book Appointment</Modal.Title>
                <Modal.Subtitle>with Dr. {selectedDoctor.user.name}</Modal.Subtitle>
              </Modal.Header>
              <div className="space-y-4">
                {bookingError && (
                  <div className="p-3 text-sm bg-red-50 text-red-500 rounded-lg">{bookingError}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={bookingData.appointmentDate} onChange={e => setBookingData({...bookingData, appointmentDate: e.target.value})} min={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={bookingData.appointmentTime} onChange={e => setBookingData({...bookingData, appointmentTime: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input value={bookingData.reason} onChange={e => setBookingData({...bookingData, reason: e.target.value})} placeholder="Checkup, consultation..." required />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input value={bookingData.comments} onChange={e => setBookingData({...bookingData, comments: e.target.value})} placeholder="Any specific symptoms?" />
                </div>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <Modal.Action htmlType="button" onClick={() => setShowBookingForm(false)} type="secondary">
                Cancel
              </Modal.Action>
              <Modal.Action htmlType="submit" loading={bookingLoading} disabled={bookingLoading}>
                Confirm Booking
              </Modal.Action>
            </Modal.Actions>
          </form>
        )}
      </Modal.Modal>
    </div>
  );
}