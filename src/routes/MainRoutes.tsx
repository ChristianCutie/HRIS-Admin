import Login from '@/auth/Login'
import { useRoutes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/features/dashboard/Dashboard'
import SettingsComponent from '@/features/settings/SettingsComponent'
import ReportAnalytics from '@/features/report-analytics/ReportAnalytics'
import AttendanceLeaving from '@/features/attendance-leaving/AttendanceLeaving'
import SetupManager from '@/features/setup-manager/SetupManager'
import InitialSystemSetup from '@/features/setup-manager/pages/InitialSystemSetup'
import LessonSetup from '@/features/setup-manager/pages/LessonSetup'
import HolidaySetup from '@/features/setup-manager/pages/HolidaySetup'
import Employees from '@/features/employees/Employees'
import ChristmasBonus from '@/features/christmas-bonus/ChristmasBonus'
import RecruitmentJobPostings from '@/features/job-posting/RecruitmentJobPostings'
import RecruitmentOnboarding from '@/features/recruitment-onboarding/RecuitmentOnboarding'
import { PayrollProcessing } from '@/features/payroll-benefits/PayrollProcessing'
import { LoanManagement } from '@/features/loan-management/LoanManagement'
import Announcement from '@/features/announcement/Announcement'
const MainRoutes = () => {
    const routes = useRoutes([

        //BASE
        { path: "/", element: <Login /> },

        //HOME
        {
            path: "/", // parent wrapper
            element: <Layout />,
            children: [
                { path: "dashboard", element: <Dashboard /> },
                { path: "settings", element: <SettingsComponent /> },
                { path: "reports-analytics", element: <ReportAnalytics /> },
                { path: "setup-manager", element: <SetupManager /> },
                { path: "attendance-leaving", element: <AttendanceLeaving /> },
                { path: "employees", element: <Employees /> },
                { path: "job-posting", element: <RecruitmentJobPostings /> },
                { path: "payroll", element: <PayrollProcessing /> },
                { path: "christmas-bonus", element: <ChristmasBonus /> },
                { path: "loan-management", element: <LoanManagement /> },
                { path: "recruitment-onboarding", element: <RecruitmentOnboarding /> },
                { path: "announcement", element: <Announcement /> },
            ],
        },

        //SETUP ROUTES
        {
            path: "/setup",
            element: <Layout />,
            children: [
                { path: "initial", element: <InitialSystemSetup /> },
                { path: "lessons", element: <LessonSetup /> },
                { path: "holidays", element: <HolidaySetup /> },
            ],
        },
    ])

    return routes
}

export default MainRoutes