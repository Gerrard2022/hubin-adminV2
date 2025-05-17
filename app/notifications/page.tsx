'use client';
import MainLayout from "@/components/layout/MainLayout";
import { Select, Input, Button, message } from "antd";
import { useState } from "react";
import { SendBulkDriverNotifications } from "@/lib/utils";

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
      await SendBulkDriverNotifications(
        formData.title,
        formData.body,
        formData.screen,
        type,
        {
          fare_price: 0,
          distance_traveled: 0,
          distance: 0,
          vehicle: ""
        }
      );
      message.success("Notifications sent successfully!");
      setFormData({ title: "", body: "", screen: "home" });
    } catch (error) {
      console.error('Error in handleSendNotification:', error);
      message.error("Failed to send notifications");
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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Select Type</label>
                <Select 
                  value={type}
                  onChange={setType}
                  className="w-full"
                >
                  <Select.Option value="all">All Users</Select.Option>
                  <Select.Option value="users">Regular Users</Select.Option>
                  <Select.Option value="drivers">Drivers</Select.Option>
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
                <Input.TextArea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium">Screen to Navigate</label>
                <Select
                  value={formData.screen}
                  onChange={(value) => setFormData(prev => ({ ...prev, screen: value }))}
                  className="w-full"
                >
                  <Select.Option value="home">Home</Select.Option>
                  <Select.Option value="profile">Profile</Select.Option>
                  <Select.Option value="rides">Rides</Select.Option>
                  <Select.Option value="/(root)/(tabs)/notifications">Notifications</Select.Option>
                </Select>
              </div>

              <Button
                type="primary"
                onClick={handleSendNotification}
                loading={isLoading}
                disabled={!formData.title || !formData.body}
                className="mt-4"
              >
                Send Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;