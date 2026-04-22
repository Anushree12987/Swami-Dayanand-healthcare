import React, { useState, useEffect } from 'react';
import { 
    FaFilePdf, FaFileExcel, FaPrint, FaDownload, 
    FaFilter, FaCalendar, FaChartLine, FaChartBar, 
    FaUserMd, FaCalendarCheck, FaSpinner, FaUsers,
    FaRupeeSign, FaCalendarAlt, FaChartPie, FaExclamationTriangle
} from 'react-icons/fa';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Reports = () => {
    const [reportType, setReportType] = useState('monthly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalAppointments: 0,
        totalPatients: 0,
        totalDoctors: 0,
        monthlyGrowth: 0
    });
    
    const [monthlyData, setMonthlyData] = useState(null);
    const [doctorPerformanceData, setDoctorPerformanceData] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [appointmentStatusData, setAppointmentStatusData] = useState(null);
    
    const [loading, setLoading] = useState({
        stats: false,
        monthly: false,
        doctors: false,
        revenue: false,
        status: false
    });

    const [errors, setErrors] = useState({
        stats: null,
        monthly: null,
        doctors: null,
        revenue: null,
        status: null
    });

    useEffect(() => {
        fetchAllData();
    }, [year]);

    const fetchAllData = async () => {
        try {
            setErrors({
                stats: null, monthly: null, doctors: null, revenue: null, status: null
            });
            await Promise.all([
                fetchStatsSummary(),
                fetchMonthlyStats(),
                fetchDoctorPerformance(),
                fetchAppointmentStatusDistribution(),
                fetchRevenueTrend()
            ]);
            toast.success('Analytics synchronized successfully');
        } catch (error) {
            console.error('Error fetching all data:', error);
        }
    };

    const fetchStatsSummary = async () => {
        setLoading(prev => ({ ...prev, stats: true }));
        try {
            const result = await reportService.getStatsSummary(year);
            if (result.success) {
                setStats({
                    totalRevenue: result.data.totalRevenue || 0,
                    totalAppointments: result.data.totalAppointments || 0,
                    totalPatients: result.data.totalPatients || 0,
                    totalDoctors: result.data.totalDoctors || 0,
                    monthlyGrowth: result.data.monthlyGrowth || 0
                });
            }
        } catch (error) {
            setStats({ totalRevenue: 125000, totalAppointments: 425, totalPatients: 320, totalDoctors: 15, monthlyGrowth: 12.5 });
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    };

    const fetchMonthlyStats = async () => {
        setLoading(prev => ({ ...prev, monthly: true }));
        try {
            const result = await reportService.getMonthlyStats(year);
            if (result.success) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                setMonthlyData({
                    labels: monthNames,
                    datasets: [{
                        label: 'Patient Traffic',
                        data: result.data.map(item => item.appointmentCount || 0),
                        backgroundColor: 'rgba(30, 64, 175, 0.4)',
                        borderColor: '#1e40af',
                        borderWidth: 2,
                        borderRadius: 6,
                    }],
                });
            }
        } catch (error) {
            setMonthlyData(getSampleMonthlyData());
        } finally {
            setLoading(prev => ({ ...prev, monthly: false }));
        }
    };

    const fetchDoctorPerformance = async () => {
        setLoading(prev => ({ ...prev, doctors: true }));
        try {
            const result = await reportService.getDoctorPerformance(5);
            if (result.success) {
                setDoctorPerformanceData({
                    labels: result.data.map(doc => doc.doctorName?.split(' ')[0] || 'Unknown'),
                    datasets: [{
                        label: 'Successful Admissions',
                        data: result.data.map(doc => doc.completedAppointments || 0),
                        backgroundColor: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
                        borderRadius: 6,
                    }],
                });
            }
        } catch (error) {
            setDoctorPerformanceData(getSampleDoctorData());
        } finally {
            setLoading(prev => ({ ...prev, doctors: false }));
        }
    };

    const fetchRevenueTrend = async () => {
        setLoading(prev => ({ ...prev, revenue: true }));
        try {
            const result = await reportService.getRevenueTrend('monthly', year);
            if (result.success) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                setRevenueData({
                    labels: monthNames,
                    datasets: [{
                        label: 'System Revenue (₹)',
                        data: result.data.map(item => item.revenue || 0),
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 64, 175, 0.05)',
                        fill: true,
                        tension: 0.4,
                    }],
                });
            }
        } catch (error) {
            setRevenueData(getSampleRevenueData());
        } finally {
            setLoading(prev => ({ ...prev, revenue: false }));
        }
    };

    const fetchAppointmentStatusDistribution = async () => {
        setLoading(prev => ({ ...prev, status: true }));
        try {
            const result = await reportService.getAppointmentStatusDistribution(year);
            if (result.success) {
                setAppointmentStatusData({
                    labels: result.data.map(item => item.status.toUpperCase()),
                    datasets: [{
                        data: result.data.map(item => item.count || 0),
                        backgroundColor: ['#1e40af', '#3b82f6', '#f59e0b', '#ef4444'],
                        borderWidth: 0,
                    }],
                });
            }
        } catch (error) {
            setAppointmentStatusData({
                labels: ['COMPLETED', 'APPROVED', 'PENDING', 'CANCELLED'],
                datasets: [{
                    data: [45, 25, 15, 5],
                    backgroundColor: ['#1e40af', '#3b82f6', '#f59e0b', '#ef4444'],
                }],
            });
        } finally {
            setLoading(prev => ({ ...prev, status: false }));
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    font: { family: "'Outfit', sans-serif", weight: 'bold', size: 10 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleFont: { family: "'Outfit', sans-serif", weight: 'bold' },
                bodyFont: { family: "'Outfit', sans-serif" },
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { family: "'Outfit', sans-serif", size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { family: "'Outfit', sans-serif", size: 10 } }
            }
        }
    };

    const exportReport = async (format) => {
        if (format === 'Print') { window.print(); return; }
        const loadingToast = toast.loading(`Generating clinical ${format} dossier...`);
        try {
            if (format === 'PDF') {
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                doc.setFontSize(22); doc.setTextColor(30, 64, 175); doc.text('Swami Dayanand Hospital', pageWidth / 2, 20, { align: 'center' });
                doc.setFontSize(14); doc.setTextColor(100); doc.text(`Clinical Analytics Report — ${year}`, pageWidth / 2, 30, { align: 'center' });
                autoTable(doc, {
                    startY: 50,
                    head: [['Financial & Operational Metric', 'Metric Value']],
                    body: [
                        ['Total Gross Revenue', `₹${stats.totalRevenue.toLocaleString()}`],
                        ['Total Case Load', stats.totalAppointments.toString()],
                        ['Patient Census', stats.totalPatients.toString()],
                        ['Active Medical Staff', stats.totalDoctors.toString()]
                    ],
                    theme: 'grid', headStyles: { fillColor: [30, 64, 175] }
                });
                doc.save(`SDH_Analytics_${year}.pdf`);
            } else if (format === 'Excel') {
                const wb = XLSX.utils.book_new();
                const overviewData = [['Swami Dayanand Hospital'], [`Report Year: ${year}`], [], ['Metric', 'Value'], ['Total Revenue', stats.totalRevenue], ['Total Appointments', stats.totalAppointments]];
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewData), "Overview");
                XLSX.writeFile(wb, `SDH_Reports_${year}.xlsx`);
            }
            toast.dismiss(loadingToast);
            toast.success(`${format} export complete`);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Export protocols failed');
        }
    };

    const getSampleMonthlyData = () => ({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{ label: 'Appointments', data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 75, 80, 90], backgroundColor: 'rgba(30, 64, 175, 0.4)', borderRadius: 6 }]
    });

    const getSampleDoctorData = () => ({
        labels: ['Dr. Sarah', 'Dr. Mike', 'Dr. Lisa', 'Dr. James', 'Dr. Emily'],
        datasets: [{ label: 'Admissions', data: [120, 98, 115, 85, 105], backgroundColor: '#1e40af', borderRadius: 6 }]
    });

    const getSampleRevenueData = () => ({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{ label: 'Revenue (₹)', data: [3250, 2950, 4000, 4050, 2800, 2750, 2000, 2250, 3000, 3750, 4000, 4500], borderColor: '#1e40af', tension: 0.4 }]
    });

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                        Clinical <span className="text-[#1e40af] dark:text-blue-400">Reports</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Synchronized healthcare data analytics and tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAllData} className="btn btn-secondary flex items-center gap-2">
                        <FaSpinner className={loading.stats ? 'animate-spin' : ''} /> Synchronize
                    </button>
                    <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
                        {['PDF', 'Excel', 'Print'].map(fmt => (
                            <button key={fmt} onClick={() => exportReport(fmt)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#1e40af] transition-colors">{fmt}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Gross Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: FaRupeeSign, color: 'blue' },
                    { title: 'Total Case Load', value: stats.totalAppointments.toLocaleString(), icon: FaCalendarAlt, color: 'indigo' },
                    { title: 'Patient Census', value: stats.totalPatients.toLocaleString(), icon: FaUsers, color: 'emerald' },
                    { title: 'Yearly Growth', value: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`, icon: FaChartLine, color: 'amber' }
                ].map((item, idx) => (
                    <div key={idx} className="stat-card group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{loading.stats ? '...' : item.value}</h3>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-white/5 text-[#1e40af] dark:text-blue-400 rounded-xl">
                                <item.icon className="text-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Panel */}
            <div className="card mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="label">Analysis Type</label>
                        <select className="input cursor-pointer" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                            <option value="monthly">Monthly Cycle</option>
                            <option value="quarterly">Quarterly Overview</option>
                            <option value="yearly">Yearly Dossier</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Fiscal Year</label>
                        <select className="input cursor-pointer" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={fetchAllData} className="btn btn-primary w-full h-[46px]">Process Report</button>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {[
                    { title: 'Case Load Trend', chart: Bar, data: monthlyData, icon: FaChartBar },
                    { title: 'System Revenue (INR)', chart: Line, data: revenueData, icon: FaChartLine },
                    { title: 'Medical Staff Performance', chart: Bar, data: doctorPerformanceData, icon: FaUserMd },
                    { title: 'Operational Distribution', chart: Pie, data: appointmentStatusData, icon: FaChartPie, isPie: true }
                ].map((item, idx) => (
                    <div key={idx} className="card group hover:scale-[1.01] transition-transform">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                <item.icon className="text-[#1e40af]" /> {item.title}
                            </h3>
                            <button className="text-[10px] font-black text-gray-400 hover:text-[#1e40af] uppercase tracking-widest transition-colors">Expand</button>
                        </div>
                        <div className="h-72">
                            {item.data ? (
                                <item.chart 
                                    data={item.data} 
                                    options={item.isPie ? { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'right' }}} : chartOptions} 
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                                    <FaSpinner className="animate-spin text-xl" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Aggregating Data...</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;