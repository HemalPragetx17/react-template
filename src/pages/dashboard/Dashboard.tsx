import { useEffect, useState } from "react";
import { FaChartSimple, FaFileLines } from "react-icons/fa6";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionItem, Button, Card, CardBody, Drawer, DrawerBody, DrawerContent, DrawerHeader, Modal, Tab, Tabs, Tooltip } from "../../components/ui";
import type { IFormModal } from "../../models/dashboard";
import { Routing } from "../../routes/routing";
import DemoForm from "./DemoForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IFormModal | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    setUser({
      _id: "1y532794532453243245",
      name: "Hemal Gondaliya",
      email: "hemalgondaliya.imperoit@gmail.com",
      joiningDate: "2026-05-07",
      document: "https://umart-production.s3.af-south-1.amazonaws.com/category/categories/1751966524412_5390255224354014.png",
      age: 27,
      gender: "Male",
      technologies: [
        "Node.js",
        "TypeScript",
        "Tailwind CSS"
      ],
      hobbies: [
        "Gaming",
        "Sports"
      ],
      role: "Admin",
      status: true,
      agreeToTerms: true,
      bio: "nothing to say dear",
      startDate: "2026-05-14",
      endDate: "2026-05-28",
      phone: "919724582730",
      phoneCountry: "+91",
      profilePic: "https://umart-production.s3.af-south-1.amazonaws.com/category/categories/1751966524412_5390255224354014.png",
      image: "https://umart-production.s3.af-south-1.amazonaws.com/category/categories/1751966524412_5390255224354014.png",
      images: [
        {
          _id: "4y623785347895678934",
          url: "https://umart-production.s3.af-south-1.amazonaws.com/category/categories/1751966524412_5390255224354014.png"
        },
        {
          _id: "5y74928475928345234",
          url: "https://umart-production.s3.af-south-1.amazonaws.com/category/categories/1751966524412_5390255224354014.png"
        },
        {
          _id: "6y85934784579834598",
          url: "https://umart-production.s3.af-south-1.amazonaws.com/category/categories/1751966524412_5390255224354014.png"
        }
      ],
      imageToDelete: [],
      birthTime: "02:00 AM",
      appointment: "2026-06-07T15:12:00",
    })
  }, [])

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleAddUserSubmit = () => {
    setOpenDialog(false);
  };

  const handleFormOpen = () => {
    navigate(Routing.DemoFormPage);
  };

  const overviewIcon = <HiOutlineSquares2X2 className="w-4 h-4" aria-hidden />;
  const analyticsIcon = <FaChartSimple className="w-4 h-4" aria-hidden />;
  const reportsIcon = <FaFileLines className="w-4 h-4" aria-hidden />;

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      icon: overviewIcon,
      count: 9,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
          <Card shadow="md" fullWidth>
            <CardBody className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Users</h3>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">1,254</p>
              <span className="text-xs text-green-500 font-semibold inline-block mt-2">↑ 12% from last month</span>
            </CardBody>
          </Card>
          <Card shadow="md" fullWidth>
            <CardBody className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Sessions</h3>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">423</p>
              <span className="text-xs text-green-500 font-semibold inline-block mt-2">↑ 5% from last hour</span>
            </CardBody>
          </Card>
          <Card shadow="md" fullWidth>
            <CardBody className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Conversion Rate</h3>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">3.24%</p>
              <span className="text-xs text-red-500 font-semibold inline-block mt-2">↓ 0.4% from yesterday</span>
            </CardBody>
          </Card>
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: analyticsIcon,
      count: 3,
      content: (
        <Card shadow="md" fullWidth className="mt-2">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Performance Analytics</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Interactive charts and metric tracking would go here.</p>
            <div className="h-40 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center mt-4">
              <span className="text-neutral-400 text-xs">Analytics Chart Placeholder</span>
            </div>
          </CardBody>
        </Card>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: reportsIcon,
      count: 1,
      content: (
        <Card shadow="md" fullWidth className="mt-2">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">System Reports</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Generate, schedule, or view your automated data exports.</p>
            <div className="flex gap-3 mt-4">
              <Button size="md" variant="solid" color="primary">Download CSV</Button>
              <Button size="md" variant="bordered">Download PDF</Button>
            </div>
          </CardBody>
        </Card>
      ),
    },
  ];

  return (
    <section>
      <div className="flex justify-between items-center">
        <Tooltip
          placement="top"
          showArrow
          offset={8}
          delay={{ open: 100, close: 150 }}
          className="px-3 py-2 text-sm max-w-xs"
          content={
            <p className="text-xs text-default-600 dark:text-default-300 leading-relaxed">
              Real-time overview of your application's key metrics, sessions, and reports.
            </p>
          }
        >
          <p className="text-2xl cursor-default select-none">Dashboard</p>
        </Tooltip>
        <div className="flex gap-2">
          <Button onClick={handleDialogOpen}>
            Demo Form
          </Button>
          <Button onClick={() => setOpenDrawer(true)} variant="bordered">
            Demo Drawer
          </Button>
          <Button onClick={handleFormOpen}>
            Demo Form Page
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs
          variant="underlined"
          color="primary"
          size="md"
          radius="lg"
          isFullUnderline
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          {tabItems.map((item) => (
            <Tab
              key={item.id}
              title={
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              }
              count={item.count}
            >
              {item.content}
            </Tab>
          ))}
        </Tabs>
      </div>

      <Card shadow="md" fullWidth className="mt-12">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Frequently Asked Questions (Demo Accordion)</h3>
          <Accordion variant="bordered">
            <AccordionItem key="faq-1" title="How do I add a new user?">
              To add a new user, click the "Demo Form" button in the top right corner. Fill in the required details such as name, email, and roles, and click submit.
            </AccordionItem>
            <AccordionItem key="faq-2" title="How can I export reports?">
              Navigate to the "Reports" tab above. From there, you can download the consolidated system data in either CSV or PDF format.
            </AccordionItem>
            <AccordionItem key="faq-3" title="Are these metrics updated in real-time?">
              Yes, the sessions and conversion metrics are calculated dynamically and refreshed every hour to give you the most accurate overview.
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>

      <Modal
        openDialog={openDialog}
        handleDialogClose={handleDialogClose}
        title="Add New User"
        size="2xl"
        backdrop="blur"
      >
        <DemoForm
          user={user}
          onUserAdd={handleAddUserSubmit}
          handleDialogClose={handleDialogClose}
        />
      </Modal>

      <Drawer
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        size="xl"
        backdrop="blur"
        placement="right"
        motionProps={{
          variants: {
            initial: { x: "100%" },
            animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
            exit: { x: "-100vw", transition: { duration: 0.35, ease: "easeIn" as const } }
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader>Add New User (Drawer Mode)</DrawerHeader>
          <DrawerBody>
            <DemoForm
              user={user}
              onUserAdd={() => setOpenDrawer(false)}
              handleDialogClose={() => setOpenDrawer(false)}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </section>
  )
};

export default Dashboard
