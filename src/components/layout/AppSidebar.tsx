import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  MessageSquare, 
  Calendar, 
  Settings,
  Phone,
  Bot
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'

interface AppSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    id: 'leads',
    title: 'Lead Management',
    icon: Users,
    description: 'Manage your leads'
  },
  {
    id: 'campaigns',
    title: 'AI Voice Agent',
    icon: Bot,
    description: 'Setup campaigns & scripts'
  },
  {
    id: 'interactions',
    title: 'Interaction History',
    icon: MessageSquare,
    description: 'Call, WhatsApp & Email logs'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    description: 'Schedule appointments'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    description: 'Business & integrations'
  }
]

export function AppSidebar({ currentPage, onPageChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">AI Outreach</h1>
            <p className="text-sm text-muted-foreground">Sales Automation</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onPageChange(item.id)}
                  className={`w-full justify-start p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{item.title}</div>
                    <div className={`text-xs ${
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}