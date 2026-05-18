import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarComponent } from "@/features/navbar/SidebarComponent";
import { HeadbarComponent } from "@/features/navbar/HeadbarComponent";


const Layout = () => {
    const [activeView, setActiveView] = useState('dashboard');

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <SidebarComponent
                    activeView={activeView}
                    setActiveView={setActiveView}
                />

                <main className="flex-1 overflow-auto">
                    <HeadbarComponent />
                    <div className="p-6">
                        <Outlet context={{ activeView }} />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
export default Layout;