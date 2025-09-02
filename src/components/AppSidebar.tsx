import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAllPartners } from "@/hooks/useAllPartners";
import { BarChart3, BarChart, TrendingUp, Users, Database, BriefcaseBusiness, Table2, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"
import { useMemo } from 'react'

interface AppSidebarProps {
  selectedSection: string | null;
  onSectionSelect: (section: string) => void;
}

const MAIN_ITEMS = [
  { title: "Dashboard", path: "/dashboard", icon: BarChart },
  { title: "Overall",   path: "/overall",   icon: TrendingUp },
  //{ title: "Managers",  path: "/managers",  icon: Users },
];

const RESTRICTED = [
  { title: "Master Data", path: "/master-data", icon: Database },
]

const ITEMS = [
  { title: "Brand", path: "/extras/brand", icon: Table2 },
  { title: "Product", path: "/extras/product", icon: Globe },
  { title: "Bizdev", path: "/extras/bizdev", icon: BriefcaseBusiness }
]


export function AppSidebar() {
  const { data: partners, isLoading } = useAllPartners();
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const { role } = useAuth()

  const PREDEFINED = [
    "Apple News","Taboola","Newsletters","SEA","Outbrain","Mozilla","Liveintent",
    "Review + Ranking","Powerinbox","Listicles","Email + Affiliates","CRM (Email)",
    "CRM (SMS)", "Direct","SEO","Repurchase","RevContent",
    "Dianomi","Microsoft","Self Reactivation","OneNews","Smartnews","Nextdoor",
    "Newsbreak","Misc",
  ];


  const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  const orderIndex = useMemo(() => {
  const m = new Map<string, number>();
  PREDEFINED.forEach((name, i) => m.set(name, i));
  return m;
}, []);

const rawPartners: { id: string; name: string }[] = partners
  ? partners.map((p) => ({ id: p.id, name: p.name }))
  : PREDEFINED.map((name) => ({ id: slugify(name), name }));

  const displayPartners = useMemo(() => {
  return rawPartners.slice().sort((a, b) => {
    const ai = orderIndex.get(a.name);
    const bi = orderIndex.get(b.name);

    const aListed = ai !== undefined;
    const bListed = bi !== undefined;

    if (aListed && bListed) return (ai as number) - (bi as number);
    if (aListed) return -1;
    if (bListed) return 1;
    return a.name.localeCompare(b.name); 
  });
}, [rawPartners, orderIndex]);




  const navClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center px-3 py-2 text-sm ${
    isActive
      ? "bg-primary/10 text-lg"
      : "hover:bg-accent"
  }`;


  return (
    <Sidebar
      className={`transition-all duration-75 ${
        collapsed ? "w-16" : "w-52"
      } border-r border-sidebar-border bg-white`}
      collapsible="icon"
    >
      <div className="p-4">
        <span className="flex items-center justify-center">
          {collapsed ? (<img src={`${import.meta.env.BASE_URL}download.png`} className="h-8 w-8"/>) : (
            <img src={`${import.meta.env.BASE_URL}logo.svg`} className="h-8 w-25"/>
          )}
        </span>
        
      </div>
      <Separator className="mb-2 h-[1px]"/>
      <SidebarContent>
        {/* Main Sections */}
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title} className="text-lg">
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.path} end className={navClass}>
                      <item.icon
                        className={`h-4 w-4 ${
                          collapsed ? "mx-auto" : "mr-3"
                        }`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {role === 'elevated' && (
                <>
                  {RESTRICTED.map((item) => (
                    <SidebarMenuItem key={item.title} className="text-lg">
                      <SidebarMenuButton asChild className="mb-1">
                        <NavLink to={item.path} end className={navClass}>
                          <item.icon
                            className={`h-4 w-4 ${
                              collapsed ? "mx-auto" : "mr-3"
                            }`}
                          />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mb-2 h-[1px]" />
        
        <SidebarGroup>
          <SidebarGroupContent>
              <SidebarMenu>
                {ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="mb-1">
                      <NavLink to={item.path} className={navClass}>
                        <item.icon
                          className={`h-4 w-4 ${
                                collapsed ? "mx-auto" : "mr-3"
                              }`}
                        />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mb-2 h-[1px]" />

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-gray-500">
              Marketing Partners
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="partners">
                <AccordionTrigger className="px-3 py-2 text-sm font-medium">
                  Partners
                </AccordionTrigger>
                <AccordionContent>
                  <SidebarMenu>
                    {isLoading ? (
                      <div className="p-4 text-muted-foreground">Loading…</div>
                    ) : (
                      displayPartners.map(({id, name}) => {
                        return (
                          <SidebarMenuItem key={id}>
                            <SidebarMenuButton asChild className="mb-1">
                              <NavLink to={`/partners/${slugify(name)}`} className={navClass}>
                                <BarChart3
                                  className={`h-4 w-4 ${
                                    collapsed ? "mx-auto" : "mr-3"
                                  }`}
                                />
                                {!collapsed && <span>{name}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })
                    )}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
        
      </SidebarContent>
    </Sidebar>
  );
}