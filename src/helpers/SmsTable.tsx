import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

// Ant Design Components
import Table from "antd/lib/table";
import Button from "antd/lib/button";
import Input from "antd/lib/input";
import Popconfirm from "antd/lib/popconfirm";
import Spin from "antd/lib/spin";
import message from "antd/lib/message";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";

interface SmsData {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  simNumber?: string;
}

const SmsTable: React.FC = () => {
  const [smsData, setSmsData] = useState<SmsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSimNumber, setFilterSimNumber] = useState<string>("");
  const [globalSearch, setGlobalSearch] = useState<string>("");

  useEffect(() => {
    fetchSmsData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalSearch(filterSimNumber);
    }, 300);
    return () => clearTimeout(timeout);
  }, [filterSimNumber]);

  const fetchSmsData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "messages"));
      const fetchedData: SmsData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SmsData[];
      setSmsData(fetchedData);
      message.success("Data fetched successfully");
    } catch (error) {
      console.error("Error fetching SMS data:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deleteSms = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      setSmsData((prevData) => prevData.filter((sms) => sms.id !== id));
      message.success("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting SMS:", error);
      message.error("Failed to delete message");
    }
  };

  const deleteAllSms = async () => {
    try {
      setLoading(true);
      const batchDelete = smsData.map((sms) => deleteDoc(doc(db, "messages", sms.id)));
      await Promise.all(batchDelete);
      setSmsData([]);
      message.success("All messages deleted successfully");
    } catch (error) {
      console.error("Error deleting all SMS:", error);
      message.error("Failed to delete all messages");
    } finally {
      setLoading(false);
    }
  };

  const filteredSmsData = smsData.filter((sms) =>
    Object.values(sms)
      .join(" ")
      .toLowerCase()
      .includes(globalSearch.toLowerCase())
  );

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      <h2>SMS Messages</h2>

      <div style={{ marginBottom: "20px" }}>
        <Input
          placeholder="Search in table..."
          value={filterSimNumber}
          onChange={(e) => setFilterSimNumber(e.target.value)}
          style={{ marginBottom: 20, maxWidth: 300 }}
        />
      </div>

      {smsData.length > 0 && (
        <Popconfirm
          title="Are you sure you want to delete all messages?"
          onConfirm={deleteAllSms}
        >
          <Button danger style={{ marginBottom: 20 }}>Delete All</Button>
        </Popconfirm>
      )}

      {loading ? <Spin /> : (
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredSmsData}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            bordered
            size="middle"
            scroll={{ x: true }}
            rowSelection={{
              type: "checkbox",
            }}
            columns={[
              {
                title: "Sender",
                dataIndex: "sender",
                key: "sender",
                filters: [...new Set(smsData.map((sms) => sms.sender))].map((sender) => ({ text: sender, value: sender })),
                onFilter: (value, record) => record.sender === value,
                showSorterTooltip: false,
              },
              {
                title: "Message",
                dataIndex: "message",
                key: "message",
                render: (text) => <div style={{ wordWrap: "break-word", maxWidth: 400 }}>{text}</div>,
              },
              {
                title: "Timestamp",
                dataIndex: "timestamp",
                key: "timestamp",
                sorter: (a, b) => b.timestamp - a.timestamp,
                render: (timestamp) => new Date(timestamp).toLocaleString(),
                showSorterTooltip: false,
              },
              {
                title: "SIM Number",
                dataIndex: "simNumber",
                key: "simNumber",
                filters: [...new Set(smsData.map((sms) => sms.simNumber || "N/A"))].map((sim) => ({ text: sim, value: sim })),
                onFilter: (value, record) => (record.simNumber || "N/A") === value,
                showSorterTooltip: false,
              },
              {
                title: "Action",
                key: "action",
                render: (_, record) => (
                  <Popconfirm
                    title="Are you sure you want to delete this message?"
                    onConfirm={() => deleteSms(record.id)}
                  >
                    <Button danger icon={<DeleteOutlined />}>Delete</Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default SmsTable;
