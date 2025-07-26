'use client';
import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NotificationForm {
  title: string;
  body: string;
  screen: string;
}

const NotificationsPage = () => {
  const [type, setType] = useState<string>("all");
  const [formData, setFormData] = useState<NotificationForm>({
    title: "",
    body: "",
    screen: "home"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNotification = async () => {
    try {
      setIsLoading(true);
      toast.success("Notifications sent successfully!");
      setFormData({ title: "", body: "", screen: "home" });
    } catch (error) {
      console.error('Error in handleSendNotification:', error);
      toast.error("Failed to send notifications");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="text-black p-6"> 
        <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Send notifications to your users</p>
            <form onSubmit={e => { e.preventDefault(); handleSendNotification(); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Select Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Regular Users</SelectItem>
                    <SelectItem value="drivers">Drivers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Notification Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Notification Body</label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Screen to Navigate</label>
                <Select value={formData.screen} onValueChange={(value) => setFormData(prev => ({ ...prev, screen: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select screen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="rides">Rides</SelectItem>
                    <SelectItem value="/(root)/(tabs)/notifications">Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={!formData.title || !formData.body || isLoading}
                className="mt-4"
              >
                {isLoading ? 'Sending...' : 'Send Notifications'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;