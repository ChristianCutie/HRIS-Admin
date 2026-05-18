import { SidebarTrigger } from "@/components/ui/sidebar";


export function HeadbarComponent() {
    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className=" flex h-14 items-center px-4">
                <SidebarTrigger />
                <div className="ml-auto flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                        Welcome back, Admin
                    </span>
                </div>
            </div>
        </div>
    );
}