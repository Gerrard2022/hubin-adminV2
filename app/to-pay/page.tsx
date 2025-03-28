'use client';

import { Table, Typography, Checkbox, Button, Modal, message } from "antd";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";

const { Text } = Typography;

interface Driver {
    id: string;
    LegalName: string;
    PhoneNumber: string;
    MomoCode: number;
}

interface DriverTotal {
    DriverId: string;
    Name: string;
    PhoneNumber: string;
    MomoCode: number;
    Amount: number;
    rides: string[];
    rideDetails: RideDetail[];
    unpaidAmount: number;
}

interface RideDetail {
    ride_id: string;
    fare: number;
    origin: string;
    destination: string;
    date: string;
    payment_status: string;
}

export default function ToPay() {
    const [ridesData, setRidesData] = useState<any[]>([]);
    const [driversData, setDriversData] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<DriverTotal[] | null>(null);

    // Fetch data with pagination
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let allRides: any[] = [];
                let page = 0;
                const pageSize = 1000;
                
                while (true) {
                    const { data: rides, error } = await supabase
                        .from('Rides')
                        .select('*')
                        .eq('IsDriverPaid', false)
                        .eq('PaymentStatus', 'paid')
                        .range(page * pageSize, (page + 1) * pageSize - 1);

                    if (error) throw error;
                    if (!rides || rides.length === 0) break;
                    
                    allRides = [...allRides, ...rides];
                    if (rides.length < pageSize) break;
                    page++;
                }

                const { data: drivers, error: driversError } = await supabase
                    .from('Driver')
                    .select('*');

                if (driversError) throw driversError;

                setRidesData(allRides);
                if (drivers) setDriversData(drivers);
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Failed to load data');
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const { driverTotals, overallTotal, totalRides } = useMemo(() => {
        if (!ridesData || !driversData) {
            return { driverTotals: [], overallTotal: 0, totalRides: 0 };
        }

        const driversMap = driversData.reduce((acc: Record<string, Driver>, driver: Driver) => {
            acc[driver.id] = driver;
            return acc;
        }, {});

        const totalsMap = ridesData.reduce((acc, ride) => {
            if (ride.DriverId) {
                const fareBeforeAmount = Number(ride.FarePrice) || 0;
                const fareAmount = fareBeforeAmount * 0.85
                const driver = driversMap[ride.DriverId];

                if (!acc[ride.DriverId]) {
                    acc[ride.DriverId] = {
                        driver_id: ride.DriverId,
                        name: driver?.LegalName || 'Unknown',
                        phone_number: driver?.PhoneNumber || 'N/A',
                        momo_code: driver?.MomoCode,
                        amount: 0,
                        unpaidAmount: 0,
                        rides: [],
                        rideDetails: []
                    };
                }

                acc[ride.DriverId].amount += fareAmount;
                if (ride.PaymentStatus === "not paid") {
                    acc[ride.DriverId].unpaidAmount += fareAmount;
                }
                
                acc[ride.DriverId].rides.push(ride.ride_id);
                acc[ride.DriverId].rideDetails.push({
                    ride_id: ride.RideId,
                    fare: fareAmount,
                    origin: ride.OriginAddress,
                    destination: ride.DestinationAddress,
                    date: new Date(ride.created_at).toLocaleDateString(),
                    payment_status: ride.PaymentStatus
                });
            }
            return acc;
        }, {});

        const driverTotalsArray = Object.values(totalsMap).filter(
            (driver: any) => driver.rides.length > 0
        );
        
        const total = driverTotalsArray.reduce((sum, driver) => sum + driver.amount, 0);
        const totalRidesCount = driverTotalsArray.reduce(
            (sum, driver) => sum + driver.rideDetails.length,
            0
        );

        return {
            driverTotals: driverTotalsArray,
            overallTotal: total,
            totalRides: totalRidesCount
        };
    }, [ridesData, driversData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("rw-RW", {
            style: "currency",
            currency: "RWF",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            currencyDisplay: 'code'
        }).format(amount)
        .replace('RWF', 'RWF')
        .trim();
    };

    const handleCheckboxChange = (DriverId: string, checked: boolean) => {
        if (checked) {
            setSelectedDrivers((prev) => [...prev, DriverId]);
        } else {
            setSelectedDrivers((prev) => prev.filter((id) => id !== DriverId));
        }
    };

    const handleSendToPaidDrivers = () => {
        const selectedDriversData = driverTotals.filter((driver) =>
            selectedDrivers.includes(driver.DriverId)
        );

        if (selectedDriversData.length === 0) {
            message.warning("No drivers selected!");
            return;
        }

        setModalData(selectedDriversData);
        setModalVisible(true);
    };

    const handleSubmitPaidDrivers = async () => {
        if (!modalData) {
            message.error("No drivers selected");
            return;
        }
    
        try {
            for (const driver of modalData) {
                // Update all unpaid rides for the driver in bulk
                try {
                    const { error: updateError } = await supabase
                        .from('Rides')
                        .update({ IsDriverPaid: true })
                        .eq('DriverId', driver.DriverId)
                        .eq('PaymentStatus', 'paid');
    
                    if (updateError) {
                        throw updateError;
                    }
                    message.success(`Updated unpaid rides for ${driver.Name}`);
                } catch (error) {
                    console.error(`Error updating rides for ${driver.Name}:`, error);
                    throw error;
                }
    
                // Create paid_drivers record
                try {
                    const { error: createError } = await supabase
                        .from('PaidDrivers')
                        .insert({
                            PhoneNumber: driver.PhoneNumber,
                            DriverId: driver.DriverId,
                            Name: driver.Name,
                            Amount: driver.unpaidAmount
                        });
    
                    if (createError) {
                        throw createError;
                    }
                    message.success(`Payment record created for ${driver.Name}`);
                } catch (error) {
                    console.error(`Error creating paid driver record for ${driver.Name}:`, error);
                    throw error;
                }
            }
    
            message.success("All payments processed successfully!");
            setModalVisible(false);
            setSelectedDrivers([]);
            // Refresh the data with pagination and filter out paid rides
            let allRides: any[] = [];
            let page = 0;
            const pageSize = 1000;
    
            while (true) {
                const { data: rides, error } = await supabase
                    .from('Rides')
                    .select('*')
                    .eq('IsDriverPaid', false) // Only fetch unpaid rides
                    .range(page * pageSize, (page + 1) * pageSize - 1);
    
                if (error) throw error;
                if (!rides || rides.length === 0) break;
    
                allRides = [...allRides, ...rides];
                if (rides.length < pageSize) break;
                page++;
            }
    
            if (allRides.length > 0) {
                setRidesData(allRides);
            }
        } catch (error) {
            message.error(error.message || "Error recording payments");
            console.error("Error:", error);
        }
    };
    

    return (
        <MainLayout>
            <div className="p-6">
                <Table
                    dataSource={driverTotals}
                    loading={loading}
                    pagination={{ pageSize: 12 }}
                    rowKey="DriverId"
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                dataSource={record.rideDetails}
                                pagination={false}
                                size="small"
                            >
                                <Table.Column title="Date" dataIndex="date" />
                                <Table.Column title="From" dataIndex="origin" />
                                <Table.Column title="To" dataIndex="destination" />
                                <Table.Column 
                                    title="Fare" 
                                    dataIndex="fare"
                                    render={(value) => formatCurrency(value)}
                                />
                                <Table.Column
                                    title="Status"
                                    dataIndex="PaymentStatus"
                                    render={(status) => (
                                        <Text type={status === "paid" ? "success" : "warning"}>
                                            {status}
                                        </Text>
                                    )}
                                />
                            </Table>
                        ),
                    }}
                >
                    <Table.Column
                        title="Select"
                        render={(text, record: DriverTotal) => (
                            <Checkbox
                                onChange={(e) => handleCheckboxChange(record.DriverId, e.target.checked)}
                                checked={selectedDrivers.includes(record.DriverId)}
                            />
                        )}
                    />
                    <Table.Column
                        title="Driver Name"
                        dataIndex="name"
                        sorter={(a: DriverTotal, b: DriverTotal) => a.Name.localeCompare(b.Name)}
                    />
                    <Table.Column title="Phone Number" dataIndex="PhoneNumber" />
                    <Table.Column title="Momo Code" dataIndex="MomoCode" />
                    <Table.Column
                        title="Total Fare"
                        dataIndex="amount"
                        render={(value) => formatCurrency(value)}
                        sorter={(a: DriverTotal, b: DriverTotal) => a.Amount - b.Amount}
                    />
                    <Table.Column
                        title="Total Rides"
                        dataIndex="rides"
                        render={(rides) => rides.length}
                        sorter={(a: DriverTotal, b: DriverTotal) => a.rides.length - b.rides.length}
                    />
                </Table>

                <div className="pt-5 text-right border-t-2 border-gray-100 mt-5">
                    <Text strong className="text-base mr-5">
                        Total Drivers: {driverTotals.length}
                    </Text>
                    <Text strong className="text-base mr-5">
                        Total Rides: {totalRides}
                    </Text>
                    <Text strong className="text-xl mr-5">
                        Overall Total: {formatCurrency(overallTotal)}
                    </Text>
                    <Button
                        type="primary"
                        onClick={handleSendToPaidDrivers}
                        disabled={selectedDrivers.length === 0}
                    >
                        Mark Selected as Paid
                    </Button>
                </div>

                <Modal
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onOk={handleSubmitPaidDrivers}
                    title="Confirm Payment"
                    width={600}
                >
                    <div>
                        {modalData && modalData.map((driver) => (
                            <div key={driver.DriverId} className="mb-5 p-3 border border-gray-200">
                                <p><strong>Driver:</strong> {driver.Name}</p>
                                <p><strong>Phone:</strong> {driver.PhoneNumber}</p>
                                <p><strong>MomoCode:</strong>{driver.MomoCode}</p>
                                <p><strong>Total Rides:</strong> {driver.rideDetails.length}</p>
                                <p><strong>Total Amount:</strong> {formatCurrency(driver.Amount)}</p>
                            </div>
                        ))}
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
} 
